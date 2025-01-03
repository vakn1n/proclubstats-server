import { Types, ClientSession } from "mongoose";
import { inject, injectable } from "tsyringe";
import { BadRequestError, NotFoundError } from "../errors";
import logger from "../config/logger";
import { FixtureMapper } from "../mappers/fixture-mapper";
import LeagueMapper from "../mappers/league-mapper";
import Fixture, { AddFixtureData } from "../models/fixture";
import { AddGameData } from "../models/game/game";
import { ILeague } from "../models/league";
import { IFixtureService } from "../interfaces/fixture";
import { ILeagueService, ILeagueRepository } from "../interfaces/league";
import { ITeamService } from "../interfaces/team";
import { CacheService } from "../interfaces/util-services/cache-service.interface";
import { transactionService } from "./util-services/transaction-service";
import { AddSingleFixtureData, FixtureDTO, LeagueDTO, LeagueTableRow, TopAssister, TopScorer } from "@pro-clubs-manager/shared-dtos";
import { IGameRepository } from "../interfaces/game";
import { ITeamOfTheWeekService } from "../interfaces/wrapper-services/team-of-the-week-service.interface";

const LEAGUE_TABLE_CACHE_KEY = "leagueTable";
const TOP_SCORERS_CACHE_KEY = "topScorers";
const TOP_ASSISTS_CACHE_KEY = "topAssists";

@injectable()
export class LeagueService implements ILeagueService {
  constructor(
    @inject("ILeagueRepository") private leagueRepository: ILeagueRepository,
    @inject("IGameRepository") private gameRepository: IGameRepository,
    @inject("ITeamService") private teamService: ITeamService,
    @inject("CacheService") private cacheService: CacheService,
    @inject("IFixtureService") private fixtureService: IFixtureService,
    @inject("ITeamOfTheWeekService") private teamOfTheWeekService: ITeamOfTheWeekService
  ) {}

  async startNewSeason(leagueId: string, startDateString: string, endDateString?: string): Promise<void> {
    logger.info(`LeagueService: Starting new season for league with id ${leagueId}`);

    const league = await this.leagueRepository.getLeagueById(leagueId);

    const startDate = new Date(startDateString);
    const endDate = endDateString ? new Date(endDateString) : undefined;

    const newSeasonNumber = league.currentSeason ? league.currentSeason.seasonNumber + 1 : 1;

    await transactionService.withTransaction(async (session) => {
      if (league.currentSeason) {
        league.seasonsHistory.push(league.currentSeason);
      }

      league.currentSeason = {
        seasonNumber: newSeasonNumber,
        winner: null,
        fixtures: [],
        startDate,
        endDate,
        teams: league.teams,
      };

      await league.save({ session });

      // start new season for all the teams in the league
      await this.teamService.startNewLeagueSeason(league._id, newSeasonNumber, session);
    });
  }

  async addLeague(name: string, imgUrl?: string): Promise<ILeague> {
    const isLeagueExists = await this.leagueRepository.isLeagueNameExists(name);
    if (isLeagueExists) {
      throw new BadRequestError(`League ${name} already exists`);
    }

    logger.info(`LeagueService: Adding league with name ${name}`);

    const league = await this.leagueRepository.createLeague(name, imgUrl);

    return league;
  }

  async createFixture(leagueId: string, addFixtureData: AddSingleFixtureData): Promise<FixtureDTO> {
    const { round, games } = addFixtureData;

    logger.info(`LeagueService: adding fixture ${round} for league ${leagueId}`);

    const league = await this.leagueRepository.getLeagueById(leagueId);

    // const isFixtureRoundExists = await Fixture.exists({ round, league: league._id });

    // if (isFixtureRoundExists) {
    //   throw new BadRequestError(`Fixture with round ${round} already exists`);
    // }

    const startDate = new Date(addFixtureData.startDate);
    const endDate = new Date(addFixtureData.endDate);

    const gamesData: AddGameData[] = games.map((game) => ({
      awayTeam: new Types.ObjectId(game.awayTeamId),
      homeTeam: new Types.ObjectId(game.homeTeamId),
      round,
    }));
    return await transactionService.withTransaction(async (session) => {
      const fixture = await this.fixtureService.generateFixture(
        { leagueId: league._id, seasonNumber: league.currentSeason.seasonNumber, round, gamesData, startDate, endDate },
        session
      );
      league.currentSeason.fixtures.push(fixture._id); // add fixture to the latest season

      const fixtureDto = await FixtureMapper.mapToDto(fixture);
      await league.save({ session });

      return fixtureDto;
    });
  }

  async generateLeagueFixtures(leagueId: string, leagueStartDate: string, fixturesPerWeek: number): Promise<FixtureDTO[]> {
    logger.info(`LeagueService: Generating fixtures for league with id ${leagueId}`);

    const league = await this.leagueRepository.getLeagueById(leagueId);

    if (league.teams.length < 2) {
      throw new BadRequestError(`League with id ${leagueId} must have at least 2 teams`);
    }

    const startDate = new Date(leagueStartDate);

    const fixturesData = this.generateFixturesData(league.teams, league._id, startDate, fixturesPerWeek);
    return await transactionService.withTransaction(async (session) => {
      const fixtures = [];

      for (const fixtureData of fixturesData) {
        const fixture = await this.fixtureService.generateFixture(fixtureData, session);
        fixtures.push(fixture);
      }
      league.currentSeason.fixtures = fixtures.map((fixture) => fixture._id);
      await league.save({ session });
      return await FixtureMapper.mapToDtos(fixtures);
    });
  }

  private generateFixturesData(teams: Types.ObjectId[], leagueId: Types.ObjectId, leagueStartDate: Date, fixturesPerWeek: number): AddFixtureData[] {
    logger.info(`LeagueService: generating fixtures data`);

    // TODO: handle dummy team
    // TODO: use random to generate the fixtures better

    const fixturesCount = teams.length - 1;
    const gamesPerFixture = Math.ceil(teams.length / 2);
    const fixtures: AddFixtureData[] = [];

    let startDate: Date = leagueStartDate;
    let endDate: Date = new Date(leagueStartDate.getTime());
    endDate.setDate(endDate.getDate() + 7);

    let reverseOrder = false;
    // two league rounds
    for (let k = 0; k < 2; k++) {
      for (let round = k * fixturesCount; round < k * fixturesCount + fixturesCount; round++) {
        const fixtureGames: AddGameData[] = [];
        for (let j = 0; j < gamesPerFixture; j++) {
          const homeTeamIndex = reverseOrder ? teams.length - 1 - j : j;
          const awayTeamIndex = reverseOrder ? j : teams.length - 1 - j;
          fixtureGames.push({
            homeTeam: teams[homeTeamIndex],
            awayTeam: teams[awayTeamIndex],
          });
        }

        // fixtures.push({ leagueId, gamesData: fixtureGames, round: round + 1, startDate: new Date(startDate.getTime()), endDate: new Date(endDate.getTime()) });

        // updates date after we done all fixtures of the week
        if ((round + 1) % fixturesPerWeek === 0) {
          startDate.setDate(endDate.getDate() + 1);
          endDate.setDate(startDate.getDate() + 7);
        }
        teams.splice(1, 0, teams.pop()!);
      }
      reverseOrder = !reverseOrder;
    }
    return fixtures;
  }

  async deleteAllLeagueFixtures(leagueId: string): Promise<void> {
    logger.info(`LeagueService: removing all fixtures for league with id ${leagueId}`);

    const league = await this.leagueRepository.getLeagueById(leagueId);

    await transactionService.withTransaction(async (session) => {
      await this.fixtureService.deleteFixtures(league.currentSeason.fixtures, session);
      try {
        league.currentSeason.fixtures = [];
        await league.save({ session });
      } catch (e) {
        logger.error(e);
        throw new Error(`failed to remove fixtures for league with id ${leagueId}`);
      }
    });
  }

  async deleteLeague(id: string): Promise<void> {
    await this.leagueRepository.deleteLeague(id);

    await this.cacheService.delete(`${LEAGUE_TABLE_CACHE_KEY}:${id}`);
  }

  async getLeagueById(id: string): Promise<LeagueDTO> {
    logger.info(`LeagueService: getting league with id ${id}`);
    const league = await this.leagueRepository.getLeagueById(id);

    return await LeagueMapper.toDto(league);
  }

  async getAllLeagues(): Promise<LeagueDTO[]> {
    logger.info(`LeagueService: getting all leagues`);
    const leagues = await this.leagueRepository.getAllLeagues();
    return await LeagueMapper.toDtos(leagues);
  }

  async getLeagueTable(leagueId: string): Promise<LeagueTableRow[]> {
    // look for the table in cache
    let leagueTable = await this.getLeagueTableFromCache(leagueId);
    if (!leagueTable) {
      // Calculate the league table if it's not in the cache
      leagueTable = await this.calculateLeagueTable(leagueId);
      await this.setLeagueTableInCache(leagueId, leagueTable);
    }
    return leagueTable;
  }

  async getLeagueTeamOfTheWeek(leagueId: string, startDate: Date, endDate: Date): Promise<{}> {
    logger.info(`LeagueService: getting team of the week for league with id ${leagueId}`);

    const league = await this.leagueRepository.getLeagueById(leagueId);

    const leagueGames = await this.gameRepository.getLeaguePlayedGamesByDate(
      { leagueId: league._id, seasonNumber: league.currentSeason.seasonNumber },
      startDate,
      endDate
    );

    if (!leagueGames.length) {
      throw new BadRequestError(`No games played for the week between ${startDate} and ${endDate} in league ${league.name}`);
    }

    return await this.teamOfTheWeekService.getTeamOfTheWeek(leagueGames);
  }

  private async setLeagueTableInCache(leagueId: string, leagueTable: LeagueTableRow[]): Promise<void> {
    await this.cacheService.set(`${LEAGUE_TABLE_CACHE_KEY}:${leagueId}`, leagueTable, 10 * 60 * 60 * 1000);
  }

  private async getLeagueTableFromCache(leagueId: string): Promise<LeagueTableRow[] | null> {
    const leagueTable = await this.cacheService.get(`${LEAGUE_TABLE_CACHE_KEY}:${leagueId}`);
    if (!leagueTable) return null;

    return JSON.parse(leagueTable) as LeagueTableRow[];
  }

  async updateLeagueTable(leagueId: string) {
    const leagueTable = await this.calculateLeagueTable(leagueId);
    await this.setLeagueTableInCache(leagueId, leagueTable);
  }

  async getTeamPosition(teamId: string, leagueId: string): Promise<number> {
    const leagueTable = await this.getLeagueTable(leagueId);
    const position = leagueTable.findIndex((row) => row.teamId === teamId) + 1;
    return position;
  }

  private async calculateLeagueTable(leagueId: string): Promise<LeagueTableRow[]> {
    const tableRows = await this.teamService.getTeamsStatsByLeague(leagueId);

    this.sortTableRows(tableRows);

    return tableRows;
  }

  private sortTableRows(tableRows: LeagueTableRow[]) {
    // Sort the tableRows based on points, goal difference, etc.
    tableRows.sort((a, b) => {
      if (a.points !== b.points) {
        return b.points - a.points; // Higher points first
      }

      if (a.goalDifference !== b.goalDifference) {
        return b.goalDifference - a.goalDifference; // Higher goal difference first
      }

      return b.goalsScored - a.goalsScored; // Higher goals scored first
    });
  }

  async getTopScorers(leagueId: string, limit: number = 10): Promise<TopScorer[]> {
    logger.info(`LeagueService: getting top scorers for ${leagueId}`);
    let topScorers = await this.getTopScorersFromCache(leagueId);
    if (!topScorers) {
      logger.info(`calculating top scorers for league with id ${leagueId}`);
      topScorers = await this.leagueRepository.calculateLeagueTopScorers(leagueId, limit);

      await this.setTopScorersInCache(leagueId, topScorers);
    }

    return topScorers;
  }

  async getTopAssists(leagueId: string, limit: number = 10): Promise<TopAssister[]> {
    logger.info(`LeagueService: getting top assists for league with id ${leagueId}`);

    let topAssists = await this.getTopAssistsFromCache(leagueId);
    if (!topAssists) {
      logger.info(`calculating top assists for league with id ${leagueId}`);
      topAssists = await this.leagueRepository.calculateLeagueTopAssisters(leagueId, limit);
      await this.setTopAssistsInCache(leagueId, topAssists);
    }

    return topAssists;
  }

  private async getTopScorersFromCache(leagueId: string): Promise<TopScorer[] | null> {
    const cachedData = await this.cacheService.get(`${TOP_SCORERS_CACHE_KEY}:${leagueId}`);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  }
  private async getTopAssistsFromCache(leagueId: string): Promise<TopAssister[] | null> {
    const cachedData = await this.cacheService.get(`${TOP_ASSISTS_CACHE_KEY}:${leagueId}`);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  }

  async setTopAssistsInCache(leagueId: string, players: TopAssister[]) {
    await this.cacheService.set(`${TOP_ASSISTS_CACHE_KEY}:${leagueId}`, players, 10 * 60 * 60 * 1000);
  }

  private async setTopScorersInCache(leagueId: string, players: TopScorer[]): Promise<void> {
    await this.cacheService.set(`${TOP_SCORERS_CACHE_KEY}:${leagueId}`, players, 10 * 60 * 60 * 1000);
  }
}

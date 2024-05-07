import { autoInjectable } from "tsyringe";
import { ClientSession } from "mongodb";
import { Types } from "mongoose";
import { AddSingleFixtureData, FixtureDTO, LeagueTableRow, TopAssister, TopScorer } from "../../types-changeToNPM/shared-DTOs";
import BadRequestError from "../errors/bad-request-error";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";
import Fixture, { AddFixtureData, IFixture } from "../models/fixture";
import { AddGameData } from "../models/game";
import League, { ILeague } from "../models/league";
import Team, { ITeam } from "../models/team";
import { FixtureService, CacheService } from "./";
import { transactionService } from "./transaction-service";
import { FixtureMapper } from "../mappers/fixture-mapper";

const LEAGUE_TABLE_CACHE_KEY = "leagueTable";
const TOP_SCORERS_CACHE_KEY = "topScorers";
const TOP_ASSISTS_CACHE_KEY = "topAssists";

@autoInjectable()
export default class LeagueService {
  private cacheService: CacheService;
  private fixtureService: FixtureService;

  constructor(cacheService: CacheService, fixtureService: FixtureService) {
    console.log("league");

    this.cacheService = cacheService;
    this.fixtureService = fixtureService;
  }

  async addLeague(name: string, imgUrl?: string): Promise<ILeague> {
    const isLeagueExists = !!(await League.exists({ name }));
    if (isLeagueExists) {
      throw new BadRequestError(`League ${name} already exists`);
    }

    logger.info(`Adding league with name ${name}`);

    const league = await League.create({ name, imgUrl });

    return league;
  }

  // async addTeamToLeague(teamId: Types.ObjectId, leagueId: string, session: ClientSession): Promise<void> {
  //   logger.info(`Adding team with id ${teamId} to league with id ${leagueId}`);

  //   const league = await League.findById(leagueId);
  //   if (!league) {
  //     throw new NotFoundError(`League with id ${leagueId} not found`);
  //   }

  //   league.teams.push(teamId);
  //   await league.save({ session });

  //   // invalidate cache for table when team is added to the league
  //   await this.cacheService.delete(`${LEAGUE_TABLE_CACHE_KEY}:${leagueId}`);
  // }

  async removeTeamFromLeague(leagueId: Types.ObjectId, teamId: Types.ObjectId, session: ClientSession): Promise<void> {
    logger.info(`Removing team with id ${teamId} from league with id ${leagueId}`);

    const league = await League.findById(leagueId);
    if (!league) {
      throw new NotFoundError(`League with id ${leagueId} not found`);
    }

    const teamIndex = league.teams.indexOf(teamId);
    if (teamIndex === -1) {
      throw new NotFoundError(`Team with id ${teamId} not found in league with id ${leagueId}`);
    }

    league.teams.splice(teamIndex, 1);
    await league.save({ session });

    await this.cacheService.delete(`${LEAGUE_TABLE_CACHE_KEY}:${leagueId}`);
  }

  async createFixture(leagueId: string, addFixtureData: AddSingleFixtureData): Promise<FixtureDTO> {
    const { round, games } = addFixtureData;

    logger.info(`LeagueService: adding fixture ${round} for league ${leagueId}`);

    const league = await League.findById(leagueId);
    if (!league) {
      throw new NotFoundError(`League with id ${leagueId} not found`);
    }

    const isFixtureRoundExists = await Fixture.exists({ round, league: league._id });

    if (isFixtureRoundExists) {
      throw new BadRequestError(`Fixture with round ${round} already exists`);
    }

    const startDate = new Date(addFixtureData.startDate);
    const endDate = new Date(addFixtureData.endDate);

    const gamesData: AddGameData[] = games.map((game) => ({
      awayTeam: new Types.ObjectId(game.awayTeamId),
      homeTeam: new Types.ObjectId(game.homeTeamId),
    }));

    return await transactionService.withTransaction(async (session) => {
      const fixture = await this.fixtureService.generateFixture({ leagueId: league._id, round, gamesData, startDate, endDate }, session);
      league.fixtures.push(fixture._id);
      const fixtureDto = await FixtureMapper.mapToDto(fixture);
      await league.save({ session });
      return fixtureDto;
    });
  }

  async generateFixtures(leagueId: string, leagueStartDate: string, fixturesPerWeek: number): Promise<IFixture[]> {
    logger.info(`LeagueService: Generating fixtures for league with id ${leagueId}`);

    const league = await League.findById(leagueId);

    if (!league) {
      throw new NotFoundError(`League with id ${leagueId} not found`);
    }

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
      league.fixtures = fixtures.map((fixture) => fixture._id);
      await league.save({ session });
      return fixtures;
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

        fixtures.push({ leagueId, gamesData: fixtureGames, round: round + 1, startDate: new Date(startDate.getTime()), endDate: new Date(endDate.getTime()) });

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

  async deleteAllFixtures(leagueId: string): Promise<void> {
    logger.info(`LeagueService: removing all fixtures for league with id ${leagueId}`);

    const league = await League.findById(leagueId);
    if (!league) {
      throw new NotFoundError(`League with id ${leagueId} not found`);
    }

    await transactionService.withTransaction(async (session) => {
      await this.fixtureService.deleteFixtures(league.fixtures, session);
      try {
        league.fixtures = [];
        await league.save({ session });
      } catch (e) {
        logger.error(e);
        throw new Error(`failed to remove fixtures for league with id ${leagueId}`);
      }
    });
  }

  async removeLeague(id: string): Promise<ILeague> {
    const league = await League.findByIdAndDelete(id);
    if (!league) {
      throw new NotFoundError(`League with id ${id} not found`);
    }

    await this.cacheService.delete(`${LEAGUE_TABLE_CACHE_KEY}:${id}`);

    return league;
  }

  async getLeagueById(id: string): Promise<ILeague> {
    const league = await League.findById(id);
    if (!league) {
      throw new NotFoundError(`cant find league with id ${id}`);
    }

    return league;
  }

  async getAllLeagues(): Promise<ILeague[]> {
    return await League.find();
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
    const league = await League.findById(leagueId).populate<{ teams: ITeam[] }>({
      path: "teams",
      select: "name stats id imgUrl",
    });

    if (!league) {
      throw new NotFoundError(`league with id ${leagueId} not found`);
    }

    const tableRows: LeagueTableRow[] = league.teams.map((team) => this.calculateTableRow(team));

    this.sortTableRows(tableRows);

    return tableRows;
  }

  private calculateTableRow(team: ITeam): LeagueTableRow {
    const stats = team.stats;
    const gamesPlayed = stats.wins + stats.losses + stats.draws;
    const goalDifference = stats.goalsScored - stats.goalsConceded;
    const points = stats.wins * 3 + stats.draws;

    return {
      teamId: team.id,
      teamName: team.name,
      imgUrl: team.imgUrl,
      gamesPlayed,
      gamesWon: stats.wins,
      gamesLost: stats.losses,
      draws: stats.draws,
      goalDifference,
      points,
      goalsConceded: stats.goalsConceded,
      goalsScored: stats.goalsScored,
      cleanSheets: stats.cleanSheets,
    };
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
    logger.info(`getting top scorers for ${leagueId}`);
    let topScorers = await this.getTopScorersFromCache(leagueId);
    if (!topScorers) {
      topScorers = await this.calculateTopScorers(leagueId, limit);

      await this.setTopScorersInCache(leagueId, topScorers);
    }

    return topScorers;
  }

  private async calculateTopScorers(leagueId: string, limit: number): Promise<TopScorer[]> {
    logger.info(`calculating top scorers for league with id ${leagueId}`);

    try {
      return await Team.aggregate<TopScorer>([
        { $match: { league: new Types.ObjectId(leagueId) } },
        { $lookup: { from: "players", localField: "players", foreignField: "_id", as: "players" } },
        { $unwind: "$players" },
        {
          $addFields: {
            goalsPerGame: {
              $cond: {
                if: { $eq: ["$players.stats.games", 0] },
                then: 0,
                else: { $divide: ["$players.stats.goals", "$players.stats.games"] },
              },
            },
          },
        },
        {
          $project: {
            playerId: "$players._id",
            playerName: "$players.name",
            teamId: "$_id",
            teamName: "$name",
            position: "$players.position",
            playerImgUrl: "$players.imgUrl",
            games: "$players.stats.games",
            goals: "$players.stats.goals",
            goalsPerGame: 1,
          },
        },
        { $sort: { goals: -1 } },
        { $limit: limit },
      ]);
    } catch (e) {
      logger.error(e);
      throw new Error(`failed to calculate top scorers for league with id ${leagueId}`);
    }
  }

  async getTopAssists(leagueId: string, limit: number = 10): Promise<TopAssister[]> {
    let topAssists = await this.getTopAssistsFromCache(leagueId);
    if (!topAssists) {
      // Perform the aggregation if the data is not in the cache
      topAssists = await this.calculateTopAssists(leagueId, limit);
      await this.setTopAssistsInCache(leagueId, topAssists);
    }

    return topAssists;
  }

  private async calculateTopAssists(leagueId: string, limit: number): Promise<TopAssister[]> {
    logger.info(`calculating top assists for league with id ${leagueId}`);

    try {
      return await Team.aggregate<TopAssister>([
        { $match: { league: new Types.ObjectId(leagueId) } },
        { $lookup: { from: "players", localField: "players", foreignField: "_id", as: "players" } },
        { $unwind: "$players" },
        {
          $addFields: {
            assistsPerGame: {
              $cond: {
                if: { $eq: ["$players.stats.games", 0] },
                then: 0,
                else: { $divide: ["$players.stats.assists", "$players.stats.games"] },
              },
            },
          },
        },
        {
          $project: {
            playerId: "$players._id",
            playerName: "$players.name",
            teamId: "$_id",
            teamName: "$name",
            position: "$players.position",
            playerImgUrl: "$players.imgUrl",
            games: "$players.stats.games",
            assists: "$players.stats.assists",
            assistsPerGame: 1,
          },
        },
        { $sort: { assists: -1 } },
        { $limit: limit },
      ]);
    } catch (e) {
      logger.error(e);
      throw new Error(`failed to calculate top assists for league with id ${leagueId}`);
    }
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

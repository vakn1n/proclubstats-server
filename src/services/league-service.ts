import { ClientSession } from "mongodb";
import { Types } from "mongoose";
import { LeagueTableRow, TopAssister, TopScorer } from "../../types-changeToNPM/shared-DTOs";
import BadRequestError from "../errors/bad-request-error";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";
import League, { ILeague } from "../models/league";
import Team, { ITeam } from "../models/team";
import CacheService from "./cache-service";
import { transactionService } from "./transaction-service";
import FixtureService from "./fixture-service";

const LEAGUE_TABLE_CACHE_KEY = "leagueTable";
const TOP_SCORERS_CACHE_KEY = "topScorers";
const TOP_ASSISTS_CACHE_KEY = "topAssists";

class LeagueService {
  private static instance: LeagueService;
  private cacheService: CacheService;
  private fixtureService: FixtureService

  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.fixtureService = FixtureService.getInstance();
  }

  static getInstance(): LeagueService {
    if (!LeagueService.instance) {
      LeagueService.instance = new LeagueService();
    }
    return LeagueService.instance;
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

  async addTeamToLeague(teamId: Types.ObjectId, leagueId: string, session: ClientSession): Promise<void> {
    logger.info(`Adding team with id ${teamId} to league with id ${leagueId}`);

    const league = await League.findById(leagueId);
    if (!league) {
      throw new NotFoundError(`League with id ${leagueId} not found`);
    }

    league.teams.push(teamId);
    await league.save({ session });

    // invalidate cache for table when team is added to the league
    await this.cacheService.delete(`${LEAGUE_TABLE_CACHE_KEY}:${leagueId}`);
  }

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

  async addFixtureToLeague(leagueId: string, fixtureId: Types.ObjectId, session: ClientSession): Promise<void> {
    const league = await League.findById(leagueId).session(session);
    if (!league) {
      throw new NotFoundError(`League with id ${leagueId} not found`);
    }

    league.fixtures.push(fixtureId);
    await league.save({ session });
  }

  async generateFixtures(leagueId: string) {
    const league = await this.getLeagueById(leagueId);

    if (league.teams.length < 2) {
      throw new BadRequestError(`League with id ${leagueId} must have at least 2 teams`);
    }

    const fixtures = this.generateRoundRobinFixtures(league.teams);
    await transactionService.withTransaction(async (session) => {

      await Promise.all(fixtures.map(async (round) => {
        await Promise.all(round.map(async (match) => {
            await this.fixtureService.createFixture(match, session);
        }));
        
      }))
      league.fixtures = fixtures.map((f) => f.id);
      await league.save({ session });
    }
  }

  private generateRoundRobinFixtures(teams: Types.ObjectId[]): any[] {
    const totalRounds = teams.length - 1;
    const matchesPerRound = teams.length / 2;
    const rounds: any[] = [];

    for (let round = 0; round < totalRounds; round++) {
      const fixtures: any[] = [];
      for (let j = 0; j < matchesPerRound; j++) {
        const fixture = {
          homeTeam: teams[round],
          awayTeam: teams[teams.length - 1 - round],
          round: round + 1, // Adjust round numbering
      };
      fixtures.push(fixture);
      }
      rounds.push(fixtures);
      teams.splice(1, 0, teams.pop()!);
    }

    return rounds.flat();
  }

  private async saveFixtures(fixtures: any[], leagueId: string) {
    // await transactionService.withTransaction(async (session) => {
    //   for (const fixture of fixtures) {
    //     await FixtureService.getInstance().addFixture(fixture, session);
    //   }
    //   league.fixtures = fixtures.map((f) => f.id);
    //   await league.save({ session });
    // });
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
      console.log(topScorers);

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

export default LeagueService;

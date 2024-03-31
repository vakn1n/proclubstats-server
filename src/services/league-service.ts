import { ClientSession } from "mongodb";
import { Types } from "mongoose";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";
import League, { ILeague } from "../models/league";
import { IPlayer } from "../models/player";
import Team, { ITeam } from "../models/team";
import CacheService from "./cache-service";
import { LeagueTableRow } from "../../types-changeToNPM/shared-DTOs";

const LEAGUE_TABLE_CACHE_KEY = "leagueTable";
const TOP_SCORERS_CACHE_KEY = "topScorers";
const TOP_ASSISTS_CACHE_KEY = "topAssists";

class LeagueService {
  private static instance: LeagueService;
  private cacheService: CacheService;

  private constructor() {
    this.cacheService = CacheService.getInstance();
  }

  static getInstance(): LeagueService {
    if (!LeagueService.instance) {
      LeagueService.instance = new LeagueService();
    }
    return LeagueService.instance;
  }

  async addLeague(name: string): Promise<ILeague> {
    const isLeagueExists = !!(await League.exists({ name }));
    if (isLeagueExists) {
      throw new Error(`League ${name} already exists`);
    }

    logger.info(`Adding league with name ${name}`);

    const league = await League.create({ name });

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

  async addFixtureToLeague(leagueId: string, fixtureId: Types.ObjectId, session: ClientSession): Promise<void> {
    const league = await League.findById(leagueId, {}, { session });
    if (!league) {
      throw new NotFoundError(`League with id ${leagueId} not found`);
    }

    league.fixtures.push(fixtureId);
    await league.save({ session });
  }

  async removeLeague(id: string): Promise<ILeague> {
    const league = await League.findByIdAndDelete(id);
    if (!league) {
      throw new NotFoundError(`League with id ${id} not found`);
    }
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
      select: "name stats id ",
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

  async getTopScorers(leagueId: string, limit: number = 10): Promise<IPlayer[]> {
    logger.info(`getting top scorers for ${leagueId}`);
    let topScorers = await this.getTopScorersFromCache(leagueId);
    if (!topScorers) {
      topScorers = await this.calculateTopScorers(leagueId, limit);
      await this.setTopScorersInCache(leagueId, topScorers);
    }

    return topScorers;
  }

  private async getTopScorersFromCache(leagueId: string): Promise<IPlayer[] | null> {
    const cachedData = await this.cacheService.get(`${TOP_SCORERS_CACHE_KEY}:${leagueId}`);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  }

  private async calculateTopScorers(leagueId: string, limit: number): Promise<IPlayer[]> {
    logger.info(`calculating top scorers for league with id ${leagueId}`);

    try {
      return await Team.aggregate<IPlayer>([
        { $match: { league: new Types.ObjectId(leagueId) } },
        { $lookup: { from: "players", localField: "players", foreignField: "_id", as: "players" } },
        { $unwind: "$players" },
        {
          $group: {
            _id: "$players._id",
            player: { $first: "$players" },
            goalsScored: { $sum: "$players.goalsScored" },
          },
        },
        { $sort: { goalsScored: -1 } },
        { $limit: limit },
      ]);
    } catch (e) {
      logger.error(e);
      throw new Error(`failed to calculate top scorers for league with id ${leagueId}`);
    }
  }

  async getTopAssists(leagueId: string, limit: number = 10): Promise<IPlayer[]> {
    let topAssists = await this.getTopScorersFromCache(leagueId);
    if (!topAssists) {
      // Perform the aggregation if the data is not in the cache
      topAssists = await this.calculateTopAssists(leagueId, limit);
      await this.setTopAssistsInCache(leagueId, topAssists);
    }

    return topAssists;
  }

  private async calculateTopAssists(leagueId: string, limit: number = 10): Promise<IPlayer[]> {
    try {
      return await Team.aggregate<IPlayer>([
        { $match: { league: new Types.ObjectId(leagueId) } },
        { $lookup: { from: "players", localField: "players", foreignField: "_id", as: "players" } },
        { $unwind: "$players" },
        { $group: { _id: "$players._id", player: { $first: "$players" }, assists: { $sum: "$players.assists" } } },
        { $sort: { assists: -1 } },
        { $limit: limit },
      ]);
    } catch (e) {
      logger.error(e);
      throw new Error(`failed to calculate top assists for league with id ${leagueId}`);
    }
  }

  async setTopAssistsInCache(leagueId: string, players: IPlayer[]) {
    await this.cacheService.set(`${TOP_ASSISTS_CACHE_KEY}:${leagueId}`, players, 10 * 60 * 60 * 1000);
  }

  private async setTopScorersInCache(leagueId: string, players: IPlayer[]): Promise<void> {
    await this.cacheService.set(`${TOP_SCORERS_CACHE_KEY}:${leagueId}`, players, 10 * 60 * 60 * 1000);
  }
}

export default LeagueService;

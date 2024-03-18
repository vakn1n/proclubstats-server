import { Types } from "mongoose";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";
import League, { ILeague } from "../models/league";
import Team from "../models/team";
import { ITeam } from "../models/team";
import Player, { IPlayer } from "../models/player";
import CacheService from "./cache-service";

interface LeagueTableRow {
  teamId: string;
  teamName: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  draws: number;
  goalDifference: number;
  points: number;
  goalsConceded: number;
  goalsScored: number;
  cleanSheets: number;
}

const LEAGUE_TABLE_CACHE_KEY = "leagueTable";

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

    const league = new League({ name });
    await league.save();
    return league;
  }

  async addFixtureToLeague(leagueId: string, fixtureId: Types.ObjectId) {
    throw new Error("Method not implemented.");
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
    await this.cacheService.set(`${LEAGUE_TABLE_CACHE_KEY}:${leagueId}`, leagueTable);
  }

  private async getLeagueTableFromCache(leagueId: string): Promise<LeagueTableRow[] | null> {
    const leagueTable = await this.cacheService.get(`${LEAGUE_TABLE_CACHE_KEY}:${leagueId}`);
    if (!leagueTable) return null;
    return leagueTable as LeagueTableRow[];
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
      select: "name stats",
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
    const topScorers = await Team.aggregate<IPlayer>([
      { $match: { leagueId } },
      { $unwind: "$players" },
      { $lookup: { from: "players", localField: "players", foreignField: "_id", as: "player" } },
      { $unwind: "$player" },
      { $sort: { "player.stats.goals": -1 } },
      { $limit: limit },
      { $replaceRoot: { newRoot: "$player" } }, // Replace the root with the player object
    ]);

    return topScorers;
  }

  async getTopAssists(leagueId: string, limit: number = 10): Promise<IPlayer[]> {
    const topAssists = await Team.aggregate<IPlayer>([
      { $match: { leagueId } },
      { $unwind: "$players" },
      { $lookup: { from: "players", localField: "players", foreignField: "_id", as: "player" } },
      { $unwind: "$player" },
      { $sort: { "player.stats.assists": -1 } },
      { $limit: limit },
    ]);

    return topAssists;
  }
}

export default LeagueService;

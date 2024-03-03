import League, { ILeague } from "../models/league";
import { IPlayer } from "../models/player";

class LeagueService {
  private static instance: LeagueService;

  private constructor() {}

  static getInstance(): LeagueService {
    if (!this.instance) {
      this.instance = new LeagueService();
    }
    return this.instance;
  }

  async createLeague(data: any): Promise<ILeague> {
    const league = new League(data);
    await league.save();
    return league;
  }

  async removeLeague(id: string): Promise<void> {
    // Implementation...
  }

  async getLeagueById(id: string): Promise<ILeague> {
    const league = await League.findById(id);
    if (!league) {
      throw new Error(`cant find league with id ${id}`);
    }

    return league;
  }

  async getAllLeagues(): Promise<ILeague[]> {
    return await League.find();
  }

  async getTopScorers(): Promise<IPlayer[]> {
    // TODO: imp
    throw new Error("Method not implemented.");
  }

  async getTopAssists(): Promise<IPlayer[]> {
    // TODO: imp
    throw new Error("Method not implemented.");
  }
}

export default LeagueService;

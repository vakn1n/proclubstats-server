import { Types } from "mongoose";
import League, { ILeague } from "../models/league";
import { IPlayer } from "../models/player";
import NotFoundError from "../errors/not-found-error";

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

  async getTopScorers(limit: number = 10): Promise<IPlayer[]> {
    // TODO: imp
    throw new Error("Method not implemented.");
  }

  async getTopAssists(limit: number = 10): Promise<IPlayer[]> {
    // TODO: imp
    throw new Error("Method not implemented.");
  }
}

export default LeagueService;

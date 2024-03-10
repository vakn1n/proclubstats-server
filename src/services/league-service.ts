import { Types } from "mongoose";
import League, { ILeague } from "../models/league";
import { IPlayer } from "../models/player";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";

class LeagueService {
  private static instance: LeagueService;

  private constructor() {}

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

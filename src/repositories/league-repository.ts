// league-repository.ts
import { ClientSession, Types } from "mongoose";
import NotFoundError from "../errors/not-found-error";
import QueryFailedError from "../errors/query-failed-error";
import ILeagueRepository from "../interfaces/league/league-repository.interface";
import logger from "../logger";
import League, { ILeague } from "../models/league";

export default class LeagueRepository implements ILeagueRepository {
  async getAllLeagues(): Promise<ILeague[]> {
    try {
      const leagues = await League.find();
      return leagues;
    } catch (error: any) {
      logger.error(error.message);
      throw new QueryFailedError(`Failed to get all leagues`);
    }
  }

  async getLeagueById(id: string | Types.ObjectId, session?: ClientSession): Promise<ILeague> {
    try {
      const league = await League.findById(id, {}, { session });
      if (!league) {
        throw new NotFoundError(`League with id ${id} not found`);
      }
      return league;
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error; // Re-throw NotFoundError
      } else {
        logger.error(error.message);
        throw new QueryFailedError(`Failed to get league by id ${id}`);
      }
    }
  }

  async isLeagueNameExists(name: string): Promise<boolean> {
    try {
      const exists = await League.exists({ name });
      return !!exists;
    } catch (error: any) {
      logger.error(error.message);
      throw new QueryFailedError(`Failed to check if league name exists`);
    }
  }

  async createLeague(name: string, imgUrl?: string | undefined, session?: ClientSession): Promise<ILeague> {
    try {
      const league = (await League.create({ name, imgUrl }, { session }))[0];
      return league;
    } catch (error: any) {
      logger.error(error.message);
      throw new QueryFailedError(`Failed to create league with name ${name}`);
    }
  }

  async deleteLeague(id: string | Types.ObjectId, session?: ClientSession): Promise<void> {
    try {
      const league = await League.findByIdAndDelete(id, { session });
      if (!league) {
        throw new NotFoundError(`League with id ${id} not found`);
      }
    } catch (e: any) {
      if (e instanceof NotFoundError) {
        throw e;
      } else {
        logger.error(e.message);
        throw new QueryFailedError(`Failed to delete league with id ${id}`);
      }
    }
  }
}

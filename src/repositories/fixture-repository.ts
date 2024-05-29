import { ClientSession, Types } from "mongoose";
import { IFixtureRepository } from "../interfaces/fixture/fixture-repository.interface";
import Fixture, { IFixture } from "../models/fixture";
import { BadRequestError, NotFoundError, QueryFailedError } from "../errors";
import logger from "../config/logger";

export class FixtureRepository implements IFixtureRepository {
  async getFixtureById(id: string | Types.ObjectId, session?: ClientSession): Promise<IFixture> {
    try {
      const fixture = await Fixture.findById(id, {}, { session });
      if (!fixture) {
        throw new NotFoundError(`cant find fixture with id ${id}`);
      }
      return fixture;
    } catch (e: any) {
      if (e instanceof NotFoundError) {
        throw e;
      } else {
        logger.error(e.message);
        throw new QueryFailedError(`Failed to get fixture by id ${id}`);
      }
    }
  }
  async getAllFixturesByLeagueId(leagueId: string | Types.ObjectId, session?: ClientSession): Promise<IFixture[]> {
    try {
      const fixtures = await Fixture.find({ league: leagueId }, {}, { session });
      return fixtures;
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to get fixtures by league id ${leagueId}`);
    }
  }

  async getFixturesByLeagueWithPagination(leagueId: string, page: number, pageSize: number): Promise<IFixture[]> {
    try {
      return await Fixture.find({ league: leagueId })
        .sort({ round: 1 }) // Assuming you want to sort by date, adjust as needed
        .skip((page - 1) * pageSize)
        .limit(pageSize);
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to get fixtures by league id ${leagueId}`);
    }
  }

  async getLeagueFixture(leagueId: string | Types.ObjectId, round: number, session?: ClientSession | undefined): Promise<IFixture> {
    try {
      const fixture = await Fixture.findOne({ league: leagueId, round }, {}, { session });
      if (!fixture) {
        throw new NotFoundError(`cant find fixture with league id ${leagueId} and round ${round}`);
      }
      return fixture;
    } catch (e: any) {
      if (e instanceof NotFoundError) {
        throw e;
      } else {
        logger.error(e.message);
        throw new QueryFailedError(`Failed to get fixture by league id ${leagueId} and round ${round}`);
      }
    }
  }

  async createFixture(leagueId: string | Types.ObjectId, startDate: Date, endDate: Date, round: number, session?: ClientSession): Promise<IFixture> {
    try {
      const fixture = new Fixture({ league: leagueId, startDate, endDate, round });
      await fixture.save({ session });
      return fixture;
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to create fixture for league ${leagueId}`);
    }
  }

  async deleteFixtureById(id: string | Types.ObjectId, session?: ClientSession): Promise<void> {
    try {
      await Fixture.findByIdAndDelete(id, { session });
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to delete fixture with id ${id}`);
    }
  }

  async deleteFixtures(fixturesIds: string[] | Types.ObjectId[], session?: ClientSession): Promise<void> {
    try {
      const deleteRes = await Fixture.deleteMany({ _id: { $in: fixturesIds } }, { session });
      if (deleteRes.deletedCount !== fixturesIds.length) {
        throw new BadRequestError(`Failed to delete all requested fixtures, some fixtures were not deleted`);
      }
    } catch (e: any) {
      if (e instanceof BadRequestError) {
        throw e;
      } else {
        logger.error(e.message);
        throw new QueryFailedError(`Failed to delete fixtures with ids ${fixturesIds}`);
      }
    }
  }

  async countFixturesByLeague(leagueId: string): Promise<number> {
    try {
      return await Fixture.countDocuments({ league: leagueId });
    } catch (e: any) {
      logger.error(e.message);
      throw new Error(`Failed to count fixtures by league id ${leagueId}`);
    }
  }
}

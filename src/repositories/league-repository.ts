import { ClientSession, Types } from "mongoose";
import { BadRequestError, NotFoundError, QueryFailedError } from "../errors";
import { ILeagueRepository } from "../interfaces/league/league-repository.interface";
import logger from "../config/logger";
import League, { ILeague, ILeagueSeason } from "../models/league";
import { TopScorer, TopAssister } from "@pro-clubs-manager/shared-dtos";

export class LeagueRepository implements ILeagueRepository {
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
  async removeTeamFromLeague(leagueId: Types.ObjectId, teamId: Types.ObjectId, session?: ClientSession | undefined): Promise<void> {
    try {
      const league = await League.updateOne({ _id: leagueId }, { $pull: { teams: teamId } }, { session });
      if (!league) {
        throw new NotFoundError(`League with id ${leagueId} not found`);
      }
    } catch (e: any) {
      if (e instanceof NotFoundError) {
        throw e;
      } else {
        logger.error(e.message);
        throw new QueryFailedError(`Failed to remove team from league with id ${leagueId}`);
      }
    }
  }

  async calculateLeagueTopScorers(leagueId: string, limit: number, session?: ClientSession): Promise<TopScorer[]> {
    try {
      return await League.aggregate<TopScorer>(
        [
          { $match: { _id: new Types.ObjectId(leagueId) } },
          { $lookup: { from: "teams", localField: "teams", foreignField: "_id", as: "teams" } },
          { $unwind: "$teams" },
          { $lookup: { from: "players", localField: "teams.players", foreignField: "_id", as: "players" } },
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
              teamId: "$teams._id",
              teamName: "$teams.name",
              position: "$players.position",
              playerImgUrl: "$players.imgUrl",
              games: "$players.stats.games",
              goals: "$players.stats.goals",
              goalsPerGame: 1,
            },
          },
          { $sort: { goals: -1 } },
          { $limit: limit },
        ],
        { session }
      );
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`failed to calculate top scorers for league with id ${leagueId}`);
    }
  }

  async calculateLeagueTopAssisters(leagueId: string, limit: number, session?: ClientSession): Promise<TopAssister[]> {
    try {
      return await League.aggregate<TopAssister>(
        [
          { $match: { _id: new Types.ObjectId(leagueId) } },
          { $lookup: { from: "teams", localField: "teams", foreignField: "_id", as: "teams" } },
          { $unwind: "$teams" },
          { $lookup: { from: "players", localField: "teams.players", foreignField: "_id", as: "players" } },
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
              teamId: "$teams._id",
              teamName: "$teams.name",
              position: "$players.position",
              playerImgUrl: "$players.imgUrl",
              games: "$players.stats.games",
              assists: "$players.stats.assists",
              assistsPerGame: 1,
            },
          },
          { $sort: { assists: -1 } },
          { $limit: limit },
        ],
        { session }
      );
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed To Calculate top assisters for league with id ${leagueId}`);
    }
  }
}

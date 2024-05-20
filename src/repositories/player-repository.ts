// player-repository.ts
import { ClientSession, Types } from "mongoose";
import { NotFoundError, QueryFailedError } from "../errors";
import IPlayerRepository from "../interfaces/player/player-repository.interface";
import Player, { IPlayer } from "../models/player";
import logger from "../logger";
import { CreatePlayerDataRequest } from "../../types-changeToNPM/shared-DTOs";
import { injectable } from "tsyringe";
import { IPlayerGamePerformance } from "../models/game";

@injectable()
export default class PlayerRepository implements IPlayerRepository {
  async getPlayerById(id: string | Types.ObjectId, session?: ClientSession): Promise<IPlayer> {
    const player = await Player.findById(id, {}, { session });
    if (!player) {
      throw new NotFoundError(`Player with id ${id} not found`);
    }
    return player;
  }

  async createPlayer({ age, name, position, imgUrl, phone, playablePositions }: CreatePlayerDataRequest, session?: ClientSession): Promise<IPlayer> {
    try {
      const player = await Player.create({ age, name, position, imgUrl, phone, playablePositions }, { session });
      return player[0];
    } catch (error: any) {
      logger.error(error.message);
      throw new QueryFailedError(`Failed to create player`);
    }
  }

  async deletePlayer(id: string | Types.ObjectId, session?: ClientSession): Promise<void> {
    try {
      const deletedPlayer = await Player.findByIdAndDelete(id, { session });
      if (!deletedPlayer) {
        throw new NotFoundError(`Player with id ${id} not found`);
      }
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      } else {
        logger.error(error.message);
        throw new QueryFailedError(`Failed to delete player`);
      }
    }
  }

  async removePlayersFromTeam(playersIds: Types.ObjectId[], session?: ClientSession): Promise<void> {
    try {
      const updateRes = await Player.updateMany({ _id: { $in: playersIds } }, { team: null }, { session });
      if (updateRes.modifiedCount !== playersIds.length) {
        throw new Error("Players removed count is not equal to players count");
      }
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to remove players from team`);
    }
  }

  async updatePlayersGamePerformance(playersStats: IPlayerGamePerformance[], session: ClientSession): Promise<void> {
    const updateOperations = playersStats.map((playerStats) => {
      const { playerId, goals, assists, rating, playerOfTheMatch, cleanSheet } = playerStats;
      return this.createUpdatePlayerPerformanceQuery(playerId, goals || 0, assists || 0, rating, playerOfTheMatch || false, cleanSheet);
    });

    try {
      const result = await Player.bulkWrite(updateOperations, { session });
      if (result.modifiedCount !== playersStats.length) {
        throw new Error("Failed to update all player stats");
      }
      logger.info("Successfully updated player stats");
    } catch (error: any) {
      logger.error(`Failed to update player stats: ${error.message}`);
      throw error;
    }
  }

  async revertPlayersGamePerformance(playersStats: IPlayerGamePerformance[], session: ClientSession) {
    const revertOperations = playersStats.map((playerStats) => {
      const { playerId, goals, assists, rating, playerOfTheMatch, cleanSheet } = playerStats;
      return this.createRevertPlayerPerformanceQuery(playerId, goals || 0, assists || 0, rating, playerOfTheMatch || false, cleanSheet);
    });

    try {
      const result = await Player.bulkWrite(revertOperations, { session });
      if (result.modifiedCount !== playersStats.length) {
        throw new Error("Failed to revert all player stats");
      }
      logger.info("Successfully reverted player stats");
    } catch (error: any) {
      logger.error(`Failed to revert player stats: ${error.message}`);
      throw error;
    }
  }

  private createUpdatePlayerPerformanceQuery(playerId: string, goals: number, assists: number, rating: number, playerOfTheMatch: boolean, cleanSheet: boolean) {
    return {
      updateOne: {
        filter: { _id: new Types.ObjectId(playerId) },
        update: [
          {
            $set: {
              "stats.goals": { $add: ["$stats.goals", goals || 0] },
              "stats.assists": { $add: ["$stats.assists", assists || 0] },
              "stats.games": { $add: ["$stats.games", 1] },
              "stats.playerOfTheMatch": { $add: ["$stats.playerOfTheMatch", playerOfTheMatch ? 1 : 0] },
              "stats.cleanSheets": { $add: ["$stats.cleanSheets", cleanSheet ? 1 : 0] },
              "stats.avgRating": {
                $cond: [
                  { $eq: ["$stats.games", 0] },
                  { $ifNull: [rating, 0] },
                  {
                    $divide: [{ $add: [{ $multiply: ["$stats.avgRating", "$stats.games"] }, rating] }, { $add: ["$stats.games", 1] }],
                  },
                ],
              },
            },
          },
        ],
      },
    };
  }

  private createRevertPlayerPerformanceQuery(playerId: string, goals: number, assists: number, rating: number, playerOfTheMatch: boolean, cleanSheet: boolean) {
    return {
      updateOne: {
        filter: { _id: new Types.ObjectId(playerId) },
        update: [
          {
            $set: {
              "stats.goals": { $subtract: ["$stats.goals", goals || 0] },
              "stats.assists": { $subtract: ["$stats.assists", assists || 0] },
              "stats.games": { $subtract: ["$stats.games", 1] },
              "stats.playerOfTheMatch": { $subtract: ["$stats.playerOfTheMatch", playerOfTheMatch ? 1 : 0] },
              "stats.cleanSheets": { $subtract: ["$stats.cleanSheets", cleanSheet ? 1 : 0] },
              // Calculate the new average rating outside of the $cond operator
              "stats.avgRating": {
                $cond: [
                  { $eq: ["$stats.games", 1] }, // Check if this is the first game
                  0, // If it's the first game, set avgRating to 0
                  {
                    $divide: [{ $subtract: [{ $multiply: ["$stats.avgRating", "$stats.games"] }, rating] }, { $subtract: ["$stats.games", 1] }],
                  },
                ],
              },
            },
          },
        ],
      },
    };
  }
}

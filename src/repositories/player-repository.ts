// player-repository.ts
import { ClientSession, Types } from "mongoose";
import { NotFoundError, QueryFailedError } from "../errors";
import { IPlayerRepository } from "../interfaces/player/player-repository.interface";
import Player, { IPlayer, PopulatedPlayerWithTeam } from "../models/player/player";
import logger from "../config/logger";
import { injectable } from "tsyringe";
import { PlayerGamePerformance } from "../models/game/game";
import { CreatePlayerDataRequest } from "@pro-clubs-manager/shared-dtos";

@injectable()
export class PlayerRepository implements IPlayerRepository {
  async getPlayersWithTeamData(playerIds: (string | Types.ObjectId)[]): Promise<PopulatedPlayerWithTeam[]> {
    try {
      const players = await Player.find({ _id: { $in: playerIds } })
        .select("id name imgUrl")
        .populate<{ team: { id: string; name: string; imgUrl?: string } }>({
          path: "team",
          select: "id name imgUrl",
        })
        .exec();

      return players;
    } catch (err: any) {
      logger.error(err.message);
      throw new QueryFailedError(`Failed to get players with team data`);
    }
  }
  async getPlayersByLeague(leagueId: Types.ObjectId | string, session?: ClientSession): Promise<IPlayer[]> {
    try {
      return await Player.find({ "currentSeason.league": leagueId }, {}, { session });
    } catch (err: any) {
      logger.error(err.message);
      throw new QueryFailedError(`Failed to get players by league ${leagueId}`);
    }
  }
  async getPlayerById(id: string | Types.ObjectId, session?: ClientSession): Promise<IPlayer> {
    const player = await Player.findById(id, {}, { session });
    if (!player) {
      throw new NotFoundError(`Player with id ${id} not found`);
    }
    return player;
  }

  async getPlayersByTeamId(teamId: Types.ObjectId, session?: ClientSession): Promise<IPlayer[]> {
    try {
      return await Player.find({ team: teamId }, {}, { session });
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to get players by team id ${teamId}`);
    }
  }

  async getFreeAgents(session?: ClientSession): Promise<IPlayer[]> {
    return await Player.find({ team: null }, {}, { session });
  }

  async createPlayer({ age, name, position, imgUrl, phone, playablePositions }: CreatePlayerDataRequest, session?: ClientSession): Promise<IPlayer> {
    try {
      const player = await Player.create([{ age, name, position, imgUrl, phone, playablePositions }], { session });
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

  async setPlayerTeam(playerId: string | Types.ObjectId, teamId: string | Types.ObjectId | null, session?: ClientSession | undefined): Promise<void> {
    try {
      await Player.updateOne({ _id: playerId }, { team: teamId }, { session });
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to set team ${teamId} to player ${playerId}`);
    }
  }
  async renamePlayer(playerId: string | Types.ObjectId, newName: string, session?: ClientSession): Promise<void> {
    try {
      await Player.updateOne({ _id: playerId }, { name: newName }, { session });
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to rename player ${playerId}`);
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

  async updatePlayersGamePerformance(playersStats: PlayerGamePerformance[], session: ClientSession): Promise<void> {
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

  async revertPlayersGamePerformance(playersStats: PlayerGamePerformance[], session: ClientSession) {
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

  private createUpdatePlayerPerformanceQuery(
    playerId: Types.ObjectId,
    goals: number,
    assists: number,
    rating: number,
    playerOfTheMatch: boolean,
    cleanSheet: boolean
  ) {
    return {
      updateOne: {
        filter: { _id: playerId },
        update: [
          {
            $set: {
              "currentSeason.stats.goals": { $add: [{ $ifNull: ["$currentSeason.stats.goals", 0] }, goals || 0] },
              "currentSeason.stats.assists": { $add: [{ $ifNull: ["$currentSeason.stats.assists", 0] }, assists || 0] },
              "currentSeason.stats.games": { $add: [{ $ifNull: ["$currentSeason.stats.games", 0] }, 1] },
              "currentSeason.stats.playerOfTheMatch": { $add: [{ $ifNull: ["$currentSeason.stats.playerOfTheMatch", 0] }, playerOfTheMatch ? 1 : 0] },
              "currentSeason.stats.cleanSheets": { $add: [{ $ifNull: ["$currentSeason.stats.cleanSheets", 0] }, cleanSheet ? 1 : 0] },
              "currentSeason.stats.avgRating": {
                $cond: [
                  { $eq: [{ $ifNull: ["$currentSeason.stats.games", 0] }, 0] },
                  { $ifNull: [rating, 0] },
                  {
                    $divide: [
                      { $add: [{ $multiply: [{ $ifNull: ["$currentSeason.stats.avgRating", 0] }, { $ifNull: ["$currentSeason.stats.games", 0] }] }, rating] },
                      { $add: [{ $ifNull: ["$currentSeason.stats.games", 0] }, 1] },
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
    };
  }

  private createRevertPlayerPerformanceQuery(
    playerId: Types.ObjectId,
    goals: number,
    assists: number,
    rating: number,
    playerOfTheMatch: boolean,
    cleanSheet: boolean
  ) {
    return {
      updateOne: {
        filter: { _id: playerId },
        update: [
          {
            $set: {
              "currentSeason.stats.goals": { $subtract: [{ $ifNull: ["$currentSeason.stats.goals", 0] }, goals || 0] },
              "currentSeason.stats.assists": { $subtract: [{ $ifNull: ["$currentSeason.stats.assists", 0] }, assists || 0] },
              "currentSeason.stats.games": {
                $cond: {
                  if: { $gt: [{ $ifNull: ["$currentSeason.stats.games", 0] }, 0] },
                  then: { $subtract: [{ $ifNull: ["$currentSeason.stats.games", 0] }, 1] },
                  else: 0,
                },
              },
              "currentSeason.stats.playerOfTheMatch": { $subtract: [{ $ifNull: ["$currentSeason.stats.playerOfTheMatch", 0] }, playerOfTheMatch ? 1 : 0] },
              "currentSeason.stats.cleanSheets": { $subtract: [{ $ifNull: ["$currentSeason.stats.cleanSheets", 0] }, cleanSheet ? 1 : 0] },
              "currentSeason.stats.avgRating": {
                $cond: [
                  { $lte: [{ $ifNull: ["$currentSeason.stats.games", 1] }, 1] },
                  0,
                  {
                    $divide: [
                      {
                        $subtract: [
                          { $multiply: [{ $ifNull: ["$currentSeason.stats.avgRating", 0] }, { $ifNull: ["$currentSeason.stats.games", 0] }] },
                          rating,
                        ],
                      },
                      { $subtract: [{ $ifNull: ["$currentSeason.stats.games", 0] }, 1] },
                    ],
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

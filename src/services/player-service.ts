import { ClientSession, Types } from "mongoose";
import { AddPlayerDataRequest, PlayerDTO } from "../../types-changeToNPM/shared-DTOs";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";
import { PlayerMapper } from "../mappers/player-mapper";
import { IPlayerGamePerformance } from "../models/game";
import Player from "../models/player";
import ImageService from "./images-service";
import TeamService from "./team-service";
import { transactionService } from "./transaction-service";

export default class PlayerService {
  private static instance: PlayerService;
  private teamService: TeamService;
  private imageService: ImageService;

  constructor() {
    this.teamService = TeamService.getInstance();
    this.imageService = ImageService.getInstance();
  }

  static getInstance(): PlayerService {
    if (!this.instance) {
      this.instance = new PlayerService();
    }
    return this.instance;
  }

  async addPlayer(data: AddPlayerDataRequest): Promise<PlayerDTO> {
    logger.info(`PlayerService: adding player with name ${data.name} to team with id ${data.teamId}`);

    const { teamId, age, name, position, phone } = data;

    let playablePositions = [position];

    if (data.playablePositions) {
      playablePositions = data.playablePositions;
    }

    return await transactionService.withTransaction(async (session) => {
      const player = await Player.create({ name, team: teamId, age, playablePositions, position, phone, session });
      await TeamService.getInstance().addPlayerToTeam(player._id, teamId, session);
      return PlayerMapper.mapToDto(player);
    });
  }

  async setPlayerImage(playerId: string, file: Express.Multer.File): Promise<string> {
    logger.info(`PlayerService: setting image for player with ${playerId}`);

    const player = await Player.findById(playerId);
    if (!player) {
      throw new NotFoundError(`Player with id ${playerId} not found`);
    }

    if (player.imgUrl) {
      // remove current image from cloud
      await this.imageService.deleteImageFromCloudinary(player.imgUrl);
    }
    const imageUrl = await this.imageService.uploadImage(file);

    player.imgUrl = imageUrl;
    await player.save();

    return imageUrl;
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
                    $divide: [{ $add: [{ $multiply: ["$stats.avgRating", "$stats.games"] }, rating || 0] }, { $add: ["$stats.games", 1] }],
                  },
                ],
              },
            },
          },
        ],
      },
    };
  }

  async revertPlayersGamePerformance(playersStats: IPlayerGamePerformance[], session: ClientSession): Promise<void> {
    logger.info(`reverting players game performance..`);

    const revertOperations = playersStats.map((playerStats) => {
      const { playerId, goals, assists, rating, playerOfTheMatch, cleanSheet } = playerStats;
      return {
        updateOne: {
          filter: { _id: new Types.ObjectId(playerId) },
          update: {
            $set: {
              "stats.goals": { $subtract: ["$stats.goals", goals || 0] },
              "stats.assists": { $subtract: ["$stats.assists", assists || 0] },
              "stats.games": { $subtract: ["$stats.games", 1] },
              "stats.playerOfTheMatch": { $subtract: ["$stats.playerOfTheMatch", playerOfTheMatch ? 1 : 0] },
              "stats.cleanSheets": { $subtract: ["$stats.cleanSheets", cleanSheet ? 1 : 0] },
              "stats.avgRating": {
                $cond: [
                  { $eq: ["$stats.games", 1] }, // Check if this is the first game
                  0, // If it's the first game, set avgRating to 0
                  {
                    $divide: [{ $subtract: [{ $multiply: ["$stats.avgRating", "$stats.games"] }, rating || 0] }, { $subtract: ["$stats.games", 1] }],
                  },
                ],
              },
            },
          },
          upsert: false,
        },
      };
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

  async getPlayerById(id: string): Promise<PlayerDTO> {
    logger.info(`PlayerService:  getting player with id ${id}`);

    const player = await Player.findById(id);
    if (!player) {
      throw new NotFoundError(`cant find player with id ${id}`);
    }

    return await PlayerMapper.mapToDto(player);
  }

  async getAllPlayers(): Promise<PlayerDTO[]> {
    const players = await Player.find();
    return await PlayerMapper.mapToDtos(players);
  }

  async deletePlayer(id: string): Promise<void> {
    logger.info(`PlayerService:  deleting player with id ${id}`);

    await transactionService.withTransaction(async (session) => {
      const player = await Player.findById(id, {}, { session });
      if (!player) {
        throw new NotFoundError(`Player with id ${id} not found.`);
      }

      await this.teamService.removePlayerFromTeam(player.team, player.id, session);

      await Player.findByIdAndDelete(id, { session });

      if (player.imgUrl) {
        await this.imageService.deleteImageFromCloudinary(player.imgUrl);
      }
    });
  }
}

import { AddPlayerDataRequest, PlayerDTO } from "../../types-changeToNPM/shared-DTOs";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";
import { PlayerMapper } from "../mappers/player-mapper";
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
    logger.info(`PlayerService: setting  image for player with ${playerId}`);

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
    return PlayerMapper.mapToDtos(players);
  }

  async deletePlayer(id: string): Promise<void> {
    logger.info(`PlayerService:  deleting player with id ${id}`);

    await transactionService.withTransaction(async (session) => {
      const player = await Player.findById(id).session(session);
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

import { ClientSession, Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import logger from "../config/logger";
import { IPlayerRepository, IPlayerService } from "../interfaces/player";
import { ImageService } from "../interfaces/util-services/image-service.interface";
import { PlayerMapper } from "../mappers/player-mapper";
import { IPlayerGamePerformance } from "../models/game";
import { IPlayer } from "../models/player";
import { PlayerDTO, CreatePlayerDataRequest } from "@pro-clubs-manager/shared-dtos";

@injectable()
export class PlayerService implements IPlayerService {
  private imageService: ImageService;
  private playerRepository: IPlayerRepository;

  constructor(@inject("IPlayerRepository") playerRepository: IPlayerRepository, @inject("ImageService") imageService: ImageService) {
    this.playerRepository = playerRepository;
    this.imageService = imageService;
  }
  async renamePlayer(id: string, newName: string): Promise<void> {
    logger.info(`PlayerService: renaming player with id ${id}`);

    await this.playerRepository.renamePlayer(id, newName);
  }

  async getPlayerById(id: string): Promise<PlayerDTO> {
    logger.info(`PlayerService: getting player with id ${id}`);

    const player = await this.playerRepository.getPlayerById(id);

    return await PlayerMapper.mapToDto(player);
  }

  async createPlayer(playerData: CreatePlayerDataRequest): Promise<PlayerDTO> {
    const { age, name, position, phone } = playerData;

    logger.info(`PlayerService: creating player with name ${name}`);

    let playablePositions = [position];

    if (playerData.playablePositions) {
      playablePositions = playerData.playablePositions;
    }

    const player = await this.playerRepository.createPlayer({ name, age, playablePositions, position, phone });
    return PlayerMapper.mapToDto(player);
  }

  async setPlayerImage(playerId: string, file: Express.Multer.File): Promise<string> {
    logger.info(`PlayerService: setting image for player with ${playerId}`);

    const player = await this.playerRepository.getPlayerById(playerId);

    if (player.imgUrl) {
      // remove current image from cloud
      await this.imageService.removeImage(player.imgUrl);
    }
    const imageUrl = await this.imageService.uploadImage(file);

    player.imgUrl = imageUrl;
    await player.save();

    return imageUrl;
  }

  async removePlayersFromTeam(playersIds: Types.ObjectId[], session: ClientSession): Promise<void> {
    logger.info(`PlayerService: removing ${playersIds.length} players from team`);
    return await this.playerRepository.removePlayersFromTeam(playersIds, session);
  }

  async updatePlayersGamePerformance(playersStats: IPlayerGamePerformance[], session: ClientSession): Promise<void> {
    logger.info(`PlayerService: updating players game performance..`);
    return await this.playerRepository.updatePlayersGamePerformance(playersStats, session);
  }

  async revertPlayersGamePerformance(playersStats: IPlayerGamePerformance[], session: ClientSession): Promise<void> {
    logger.info(`PlayerService: reverting players game performance..`);
    return await this.playerRepository.revertPlayersGamePerformance(playersStats, session);
  }

  async deletePlayer(player: IPlayer, session: ClientSession): Promise<void> {
    logger.info(`PlayerService: deleting player with id ${player.id}`);

    await this.playerRepository.deletePlayer(player.id, session);

    if (player.imgUrl) {
      await this.imageService.removeImage(player.imgUrl);
    }
  }
}

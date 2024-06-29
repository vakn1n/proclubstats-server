import { ClientSession, Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import logger from "../config/logger";
import { IPlayerRepository, IPlayerService } from "../interfaces/player";
import { ImageService } from "../interfaces/util-services/image-service.interface";
import { PlayerMapper } from "../mappers/player-mapper";
import { IPlayerGamePerformance } from "../models/game";
import { IPlayer, IPlayerSeason } from "../models/player";
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

  async getFreeAgents(session?: ClientSession): Promise<PlayerDTO[]> {
    logger.info(`PlayerService: getting free agents players`);

    const freeAgents = await this.playerRepository.getFreeAgents(session);

    return await PlayerMapper.mapToDtos(freeAgents);
  }

  async createPlayer(playerData: CreatePlayerDataRequest): Promise<PlayerDTO> {
    logger.info(`PlayerService: creating player with name ${playerData.name}`);

    if (!playerData.playablePositions) {
      playerData.playablePositions = [playerData.position];
    }

    const player = await this.playerRepository.createPlayer(playerData);
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

  async startNewSeason(teamId: Types.ObjectId, leagueId: Types.ObjectId, seasonNumber: number, session: ClientSession): Promise<void> {
    logger.info(`PlayerService: starting new season for players in team with id ${teamId}`);

    const players = await this.playerRepository.getPlayersByTeamId(teamId, session);
    const newSeason: IPlayerSeason = {
      league: leagueId,
      team: teamId,
      seasonNumber: seasonNumber,
      stats: {
        assists: 0,
        goals: 0,
        avgRating: 0,
        cleanSheets: 0,
        games: 0,
        playerOfTheMatch: 0,
      },
    };

    await Promise.all(
      players.map(async (player) => {
        if (player.currentSeason) {
          player.seasonsHistory.push(player.currentSeason);
        }
        player.currentSeason = newSeason;
      })
    );
  }
}

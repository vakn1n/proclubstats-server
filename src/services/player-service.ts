import { AddPlayerDataRequest, PlayerDTO } from "../../types-changeToNPM/shared-DTOs";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";
import { PlayerMapper } from "../mappers/player-mapper";
import Player from "../models/player";
import TeamService from "./team-service";
import { transactionService } from "./transaction-service";

export default class PlayerService {
  private static instance: PlayerService;

  static getInstance(): PlayerService {
    if (!this.instance) {
      this.instance = new PlayerService();
    }
    return this.instance;
  }

  async addPlayer(data: AddPlayerDataRequest): Promise<PlayerDTO> {
    logger.info(`adding player with name ${data.name} to team with id ${data.teamId}`);

    const { teamId, age, name, position, phone, imgUrl } = data;

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

  async getPlayerById(id: string): Promise<PlayerDTO> {
    logger.info(`getting player with id ${id}`);

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
    logger.info(`deleting player with id ${id}`);

    const result = await Player.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError(`Player with id ${id} not found.`);
    }
  }
}

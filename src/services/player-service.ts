import { AddPlayerDataRequest } from "../controllers/player-controller";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";
import Player, { IPlayer } from "../models/player";
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

  async addPlayer(data: AddPlayerDataRequest): Promise<IPlayer> {
    logger.info(`adding player with name ${data.name} to team with id ${data.teamId}`);

    const { teamId, age, name, playablePositions, position, phone, imgUrl } = data;

    return await transactionService.withTransaction(async (session) => {
      const player = await Player.create({ name, team: teamId, age, playablePositions, position, phone });
      await TeamService.getInstance().addPlayerToTeam(player._id, teamId, session);
      return player;
    });
  }

  async getPlayerById(id: string): Promise<IPlayer> {
    logger.info(`getting player with id ${id}`);

    const player = await Player.findById(id);
    if (!player) {
      throw new NotFoundError(`cant find player with id ${id}`);
    }
    return player;
  }

  async getAllPlayers(): Promise<IPlayer[]> {
    const players = await Player.find();
    return players;
  }

  async deletePlayer(id: string): Promise<void> {
    logger.info(`deleting player with id ${id}`);

    const result = await Player.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError(`Player with id ${id} not found.`);
    }
  }
}

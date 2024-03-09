import NotFoundError from "../errors/not-found-error";
import Player, { IPlayer } from "../models/player";

export default class PlayerService {
  private static instance: PlayerService;

  static getInstance(): PlayerService {
    if (!this.instance) {
      this.instance = new PlayerService();
    }
    return this.instance;
  }

  async addPlayer(data: any): Promise<IPlayer> {
    //TODO: create type for the data object

    if (!data.playablePositions) {
      data.playablePositions = [data.favoritePosition];
    }

    // TODO: check if there is already such player in that team

    const player = new Player(data);
    await player.save();
    return player;
  }

  async getPlayerById(id: string): Promise<IPlayer> {
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
}

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
    const player = new Player(data);
    await player.save();
    return player;
  }

  async getPlayerById(id: string): Promise<IPlayer> {
    const player = await Player.findById(id);
    if (!player) {
      throw new Error(`cant find player with id ${id}`); //TODO: create specific error
    }
    return player;
  }

  async getAllPlayers(): Promise<IPlayer[]> {
    const players = await Player.find();
    return players;
  }
}

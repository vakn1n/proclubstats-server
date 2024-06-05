import { Types, ClientSession } from "mongoose";
import { IGameRepository } from "../../interfaces/game";
import { AddGameData, IGame } from "../../models/game";

export class MockGameRepository implements IGameRepository {
  async createGame(fixtureId: string | Types.ObjectId, addGameData: AddGameData, session?: ClientSession): Promise<IGame> {
    throw new Error("not implemented");
  }
  async createGames(fixtureId: string | Types.ObjectId, addGameData: AddGameData[], session?: ClientSession): Promise<IGame[]> {
    throw new Error("not implemented");
  }

  async deleteGameById(id: string | Types.ObjectId, session?: ClientSession): Promise<void> {
    throw new Error("not implemented");
  }
  async getGameById(id: string | Types.ObjectId, session?: ClientSession): Promise<IGame> {
    throw new Error("not implemented");
  }
  async getGamesByIds(ids: string | Types.ObjectId[], session?: ClientSession): Promise<IGame[]> {
    throw new Error("not implemented");
  }
  async getTeamGames(teamId: string | Types.ObjectId[], session?: ClientSession): Promise<IGame[]> {
    throw new Error("not implemented");
  }
  async getPlayedTeamGames(teamId: string | Types.ObjectId[], session?: ClientSession): Promise<IGame[]> {
    throw new Error("not implemented");
  }
}

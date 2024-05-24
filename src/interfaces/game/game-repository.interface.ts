import { Types, ClientSession } from "mongoose";
import { AddGameData, IGame } from "../../models/game";

export default interface IGameRepository {
  createGame(fixtureId: string | Types.ObjectId, addGameData: AddGameData, session?: ClientSession): Promise<IGame>;
  createGames(fixtureId: string | Types.ObjectId, addGameData: AddGameData[], session?: ClientSession): Promise<IGame[]>;

  deleteGameById(id: string | Types.ObjectId, session?: ClientSession): Promise<void>;

  getGameById(id: string | Types.ObjectId, session?: ClientSession): Promise<IGame>;
  getGamesByIds(ids: string | Types.ObjectId[], session?: ClientSession): Promise<IGame[]>;
  getTeamGames(teamId: string | Types.ObjectId[], session?: ClientSession): Promise<IGame[]>;
}

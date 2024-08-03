import { Types, ClientSession } from "mongoose";
import { IGameRepository } from "../../interfaces/game";
import { AddGameData, IGame } from "../../models/game";

export class MockGameRepository implements IGameRepository {
  getLeagueSeasonTeamGames = jest.fn<Promise<IGame[]>, [string | Types.ObjectId[], string | Types.ObjectId, number, number?, ClientSession?]>();
  getPlayedLeagueSeasonTeamGames = jest.fn<Promise<IGame[]>, [string | Types.ObjectId[], string | Types.ObjectId, number, number?, ClientSession?]>();
  createGame = jest.fn<Promise<IGame>, [string | Types.ObjectId, Types.ObjectId, number, AddGameData, ClientSession?]>();
  createGames = jest.fn<Promise<IGame[]>, [string | Types.ObjectId, Types.ObjectId, number, AddGameData[], ClientSession?]>();
  deleteGameById = jest.fn<Promise<void>, [string | Types.ObjectId, ClientSession?]>();
  getGameById = jest.fn<Promise<IGame>, [string | Types.ObjectId, ClientSession?]>();
  getGamesByIds = jest.fn<Promise<IGame[]>, [string | Types.ObjectId[], ClientSession?]>();
}

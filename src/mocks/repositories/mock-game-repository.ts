import { Types, ClientSession } from "mongoose";
import { IGameRepository } from "../../interfaces/game";
import { AddGameData, IGame, PopulatedPlayerGameData } from "../../models/game/game";

export class MockGameRepository implements IGameRepository {
  getPlayerPlayedSeasonGames = jest.fn<Promise<IGame[]>, [string, string | Types.ObjectId, number]>();
  getPlayerLastGames = jest.fn<Promise<PopulatedPlayerGameData[]>, [string | Types.ObjectId, string | Types.ObjectId, number, number]>();
  getLeagueSeasonTeamGames = jest.fn<Promise<IGame[]>, [string | Types.ObjectId[], string | Types.ObjectId, number, number?, ClientSession?]>();
  getPlayedLeagueSeasonTeamGames = jest.fn<Promise<IGame[]>, [string | Types.ObjectId[], string | Types.ObjectId, number, number?, ClientSession?]>();
  createGame = jest.fn<Promise<IGame>, [string | Types.ObjectId, Types.ObjectId, number, AddGameData, ClientSession?]>();
  createGames = jest.fn<Promise<IGame[]>, [string | Types.ObjectId, Types.ObjectId, number, AddGameData[], ClientSession?]>();
  deleteGameById = jest.fn<Promise<void>, [string | Types.ObjectId, ClientSession?]>();
  getGameById = jest.fn<Promise<IGame>, [string | Types.ObjectId, ClientSession?]>();
  getGamesByIds = jest.fn<Promise<IGame[]>, [string | Types.ObjectId[], ClientSession?]>();
}

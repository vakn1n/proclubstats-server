import { GameDTO, UpdatePlayerPerformanceDataRequest } from "@pro-clubs-manager/shared-dtos";
import { Types, ClientSession } from "mongoose";
import { IGameService } from "../../interfaces/game";
import { AddGameData, IGame } from "../../models/game/game";

export class MockGameService implements IGameService {
  getGameById = jest.fn<Promise<GameDTO>, [string | Types.ObjectId, ClientSession?]>();
  getGamesByIds = jest.fn<Promise<GameDTO[]>, [string[] | Types.ObjectId[]]>();
  getCurrentSeasonTeamGames = jest.fn<Promise<GameDTO[]>, [string | Types.ObjectId, number?, ClientSession?]>();
  createGame = jest.fn<Promise<GameDTO>, [Types.ObjectId, Types.ObjectId, number, AddGameData, ClientSession]>();
  createFixtureGames = jest.fn<Promise<IGame[]>, [Types.ObjectId, Types.ObjectId, number, AddGameData[], ClientSession]>();
  updateGameResult = jest.fn<Promise<void>, [string, number, number]>();
  updateTeamPlayersPerformance = jest.fn<Promise<void>, [string, boolean, UpdatePlayerPerformanceDataRequest[]]>();
  deleteGame = jest.fn<Promise<void>, [string]>();
}

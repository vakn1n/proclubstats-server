import { ClientSession, Types } from "mongoose";
import { GameDTO, UpdatePlayerPerformanceDataRequest } from "../../../types-changeToNPM/shared-DTOs";
import { AddGameData, IGame } from "../../models/game";

export interface IGameService {
  getGameById(id: string | Types.ObjectId, session?: ClientSession): Promise<GameDTO>;
  getGamesByIds(gamesIds: string[] | Types.ObjectId[]): Promise<GameDTO[]>;
  getTeamGames(teamId: string | Types.ObjectId, session?: ClientSession): Promise<GameDTO[]>;

  createGame(gameData: AddGameData, fixtureId: Types.ObjectId, session: ClientSession): Promise<GameDTO>;
  createFixtureGames(fixtureId: Types.ObjectId, gamesData: AddGameData[], session: ClientSession): Promise<IGame[]>;

  updateGameResult(gameId: string, homeTeamGoals: number, awayTeamGoals: number): Promise<void>;

  updateTeamPlayersPerformance(gameId: string, isHomeTeam: boolean, playersPerformance: UpdatePlayerPerformanceDataRequest[]): Promise<void>;

  deleteGame(id: string): Promise<void>;
}

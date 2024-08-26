import { ClientSession, Types } from "mongoose";
import { AddGameData, IGame } from "../../models/game/game";
import { GameDTO, UpdatePlayerPerformanceDataRequest } from "@pro-clubs-manager/shared-dtos";

export interface IGameService {
  getGameById(id: string | Types.ObjectId, session?: ClientSession): Promise<GameDTO>;
  getGamesByIds(gamesIds: string[] | Types.ObjectId[]): Promise<GameDTO[]>;
  getCurrentSeasonTeamGames(teamId: string | Types.ObjectId, limit?: number, session?: ClientSession): Promise<GameDTO[]>;

  createGame(fixtureId: Types.ObjectId, leagueId: Types.ObjectId, seasonNumber: number, gameData: AddGameData, session: ClientSession): Promise<GameDTO>;
  createFixtureGames(
    fixtureId: Types.ObjectId,
    leagueId: Types.ObjectId,
    seasonNumber: number,
    gamesData: AddGameData[],
    session: ClientSession
  ): Promise<IGame[]>;

  updateGameResult(gameId: string, homeTeamGoals: number, awayTeamGoals: number, date: Date): Promise<void>;

  updateTeamPlayersPerformance(gameId: string, isHomeTeam: boolean, playersPerformance: UpdatePlayerPerformanceDataRequest[]): Promise<void>;

  deleteGame(id: string): Promise<void>;
}

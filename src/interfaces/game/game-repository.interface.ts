import { Types, ClientSession } from "mongoose";
import { AddGameData, IGame } from "../../models/game/game";
import { PopulatedPlayerGameData } from "../../models/game/game-types";

export interface IGameRepository {
  createGame(
    fixtureId: string | Types.ObjectId,
    leagueId: Types.ObjectId,
    seasonNumber: number,
    addGameData: AddGameData,
    session?: ClientSession
  ): Promise<IGame>;
  createGames(
    fixtureId: string | Types.ObjectId,
    leagueId: Types.ObjectId,
    seasonNumber: number,
    addGameData: AddGameData[],
    session?: ClientSession
  ): Promise<IGame[]>;

  deleteGameById(id: string | Types.ObjectId, session?: ClientSession): Promise<void>;

  getGameById(id: string | Types.ObjectId, session?: ClientSession): Promise<IGame>;
  getGamesByIds(ids: string | Types.ObjectId[], session?: ClientSession): Promise<IGame[]>;
  getLeagueSeasonTeamGames(
    teamId: string | Types.ObjectId[],
    leagueId: string | Types.ObjectId,
    seasonNumber: number,
    limit?: number,
    session?: ClientSession
  ): Promise<IGame[]>;
  getPlayedLeagueSeasonTeamGames(
    teamId: string | Types.ObjectId[],
    leagueId: string | Types.ObjectId,
    seasonNumber: number,
    limit?: number,
    session?: ClientSession
  ): Promise<IGame[]>;

  getPlayerPlayedSeasonGames(playerId: string, league: string | Types.ObjectId, seasonNumber: number, session?: ClientSession): Promise<IGame[]>;

  getPlayerLastGames(
    playerId: string | Types.ObjectId,
    league: string | Types.ObjectId,
    seasonNumber: number,
    numberOfGames: number
  ): Promise<PopulatedPlayerGameData[]>;

  getLeaguePlayedGamesByDate(leagueData: { leagueId: Types.ObjectId; seasonNumber: number }, startDate: Date, endDate: Date): Promise<IGame[]>;
}

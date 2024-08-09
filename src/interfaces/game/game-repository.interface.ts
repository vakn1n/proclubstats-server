import { Types, ClientSession } from "mongoose";
import { AddGameData, IGame } from "../../models/game";

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

  getPlayerPlayedGames(playerId: string | Types.ObjectId, league: string | Types.ObjectId, seasonNumber: number, session?: ClientSession): Promise<IGame[]>;
}

import { Types, ClientSession } from "mongoose";
import { IGameRepository } from "../../interfaces/game";
import { AddGameData, IGame } from "../../models/game";

export class MockGameRepository implements IGameRepository {
  getLeagueSeasonTeamGames(
    teamId: string | Types.ObjectId[],
    leagueId: string | Types.ObjectId,
    seasonNumber: number,
    limit?: number,
    session?: ClientSession
  ): Promise<IGame[]> {
    throw new Error("Method not implemented.");
  }
  getPlayedLeagueSeasonTeamGames(
    teamId: string | Types.ObjectId[],
    leagueId: string | Types.ObjectId,
    seasonNumber: number,
    limit?: number,
    session?: ClientSession
  ): Promise<IGame[]> {
    throw new Error("Method not implemented.");
  }
  async createGame(
    fixtureId: string | Types.ObjectId,
    leagueId: Types.ObjectId,
    seasonNumber: number,
    addGameData: AddGameData,
    session?: ClientSession
  ): Promise<IGame> {
    throw new Error("not implemented");
  }
  async createGames(
    fixtureId: string | Types.ObjectId,
    leagueId: Types.ObjectId,
    seasonNumber: number,
    addGameData: AddGameData[],
    session?: ClientSession
  ): Promise<IGame[]> {
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
}

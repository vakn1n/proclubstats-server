import { ClientSession, Types } from "mongoose";
import { IGameRepository } from "../interfaces/game/game-repository.interface";
import Game, { AddGameData, IGame } from "../models/game";
import { BadRequestError, NotFoundError, QueryFailedError } from "../errors";
import logger from "../config/logger";
import { GAME_STATUS } from "@pro-clubs-manager/shared-dtos";

export class GameRepository implements IGameRepository {
  async createGame(
    fixtureId: string | Types.ObjectId,
    leagueId: Types.ObjectId,
    seasonNumber: number,
    addGameData: AddGameData,
    session?: ClientSession
  ): Promise<IGame> {
    const { homeTeam, awayTeam, date } = addGameData;
    try {
      const game = new Game({
        fixture: fixtureId,
        homeTeam,
        awayTeam,
        date,
        league: leagueId,
        seasonNumber,
      });
      await game.save({ session });
      return game;
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to create game`);
    }
  }

  async createGames(
    fixtureId: string | Types.ObjectId,
    leagueId: Types.ObjectId,
    seasonNumber: number,
    gamesData: AddGameData[],
    session?: ClientSession
  ): Promise<IGame[]> {
    const gamesWithFixtureId = gamesData.map((game) => ({
      ...game,
      fixture: fixtureId,
      league: leagueId,
      seasonNumber,
    }));

    try {
      const games = await Game.insertMany(gamesWithFixtureId, { session });
      return games;
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to create games`);
    }
  }

  async getGameById(id: string | Types.ObjectId, session?: ClientSession): Promise<IGame> {
    try {
      const game = await Game.findById(id, {}, { session });
      if (!game) {
        throw new NotFoundError(`Game with id ${id} not found`);
      }
      return game;
    } catch (e: any) {
      if (e instanceof NotFoundError) {
        throw e;
      } else {
        logger.error(e.message);
        throw new QueryFailedError(`Failed to get game by id ${id}`);
      }
    }
  }
  async getGamesByIds(ids: string | Types.ObjectId[], session?: ClientSession): Promise<IGame[]> {
    try {
      const games = await Game.find({ _id: { $in: ids } }, {}, { session });
      if (games.length !== ids.length) {
        throw new BadRequestError(`Failed to get some of the games`);
      }
      return games;
    } catch (e: any) {
      if (e instanceof NotFoundError) {
        throw e;
      } else {
        logger.error(e.message);
        throw new QueryFailedError(`Failed to get games by ids ${ids}`);
      }
    }
  }

  async getLeagueSeasonTeamGames(teamId: string, leagueId: string, seasonNumber: number, limit: number = 10): Promise<IGame[]> {
    try {
      const games = await Game.find({ league: leagueId, seasonNumber: seasonNumber, $or: [{ homeTeam: teamId }, { awayTeam: teamId }] })
        .sort({ round: 1 })
        .limit(limit)
        .exec();
      return games;
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to get games for team ${teamId}`);
    }
  }
  async getPlayedLeagueSeasonTeamGames(teamId: string, leagueId: string | Types.ObjectId, seasonNumber: number, limit: number = 10): Promise<IGame[]> {
    try {
      const games = await Game.find({
        league: leagueId,
        seasonNumber: seasonNumber,
        $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
        status: [GAME_STATUS.COMPLETED, GAME_STATUS.PLAYED],
      })
        .sort({ round: 1 })
        .limit(limit)
        .exec();
      return games;
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to get played games for team ${teamId}`);
    }
  }

  async deleteGameById(id: string | Types.ObjectId, session?: ClientSession | undefined): Promise<void> {
    try {
      await Game.findByIdAndDelete(id, { session });
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to delete game with id: ${id}`);
    }
  }
}

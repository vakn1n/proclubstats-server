import { ClientSession } from "mongoose";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";
import Game, { AddGameData, IGame, IGameTeamStats } from "../models/game";
import TeamService from "./team-service";
import { transactionService } from "./transaction-service";

class GameService {
  private static instance: GameService;

  private constructor() {}

  static getInstance(): GameService {
    if (!this.instance) {
      this.instance = new GameService();
    }
    return this.instance;
  }

  async createGame(gameData: AddGameData, session: ClientSession): Promise<IGame> {
    const { homeTeamId, awayTeamId, round, leagueId } = gameData;

    const game = new Game({
      homeTeam: homeTeamId,
      awayTeam: awayTeamId,
      round,
      league: leagueId,
    });

    await game.save({ session });
    return game;
  }

  async updateGameResult(gameId: string, result: { homeTeamGoals: number; awayTeamGoals: number }): Promise<void> {
    logger.info(`updating game ${gameId} result`);

    const game = await Game.findById(gameId);

    if (!game) {
      throw new NotFoundError(`game ${gameId} not found`);
    }

    game.result = result;
    game.played = true;

    await game.save();
  }

  async updateGameStats(gameId: string, homeTeamStats: IGameTeamStats, awayTeamStats: IGameTeamStats) {
    logger.info(`updating fixture ${gameId} stats`);

    const game = await Game.findById(gameId);

    if (!game) {
      throw new NotFoundError(`game ${gameId} not found`);
    }

    if (!game.played) {
      throw new Error(`can't update game stats before updating its result`);
    }

    await transactionService.withTransaction(async (session) => {
      game.homeTeamStats = homeTeamStats;
      game.awayTeamStats = awayTeamStats;

      await Promise.all([
        TeamService.getInstance().addGameStats(game.homeTeam, homeTeamStats, session),
        TeamService.getInstance().addGameStats(game.awayTeam, awayTeamStats, session),
      ]);

      await game.save({ session });
    });
  }

  async addGameResultAndStats(gameId: string, gameData: any) {
    // TODO: create type for the fixture data
    logger.info(`updating fixture ${gameId} result and stats`);

    const game = await Game.findById(gameId);

    if (!game) {
      throw new NotFoundError(`fixture ${gameId} not found`);
    }
    await transactionService.withTransaction(async (session) => {
      game.homeTeamStats = gameData.homeTeamStats;
      game.awayTeamStats = gameData.awayTeamStats;
      game.result = gameData.result;
      game.played = true;

      await Promise.all([
        TeamService.getInstance().addGameStats(game.homeTeam, gameData.homeTeamStats, session),
        TeamService.getInstance().addGameStats(game.awayTeam, gameData.awayTeamStats, session),
      ]);

      await game.save({ session });
    });
  }

  async deleteGame(id: string): Promise<IGame> {
    logger.info(`deleting game ${id}`);

    const game = await Game.findByIdAndDelete(id);
    if (!game) {
      throw new NotFoundError(`game with id ${id} not found`);
    }
    return game;
  }

  async getGameById(id: string): Promise<IGame> {
    logger.info(`getting game ${id}`);

    const game = await Game.findById(id);
    if (!game) {
      throw new NotFoundError(`game with id ${id} not found`);
    }
    return game;
  }

  async getAllGames(): Promise<IGame[]> {
    logger.info(`getting all games`);
    return await Game.find();
  }
}

export default GameService;

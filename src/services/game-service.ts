import { ClientSession, Types } from "mongoose";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";
import Game, { AddGameData, IGame } from "../models/game";
import TeamService from "./team-service";
import { transactionService } from "./transaction-service";
import BadRequestError from "../errors/bad-request-error";
import { GameStatus, IGameTeamStats } from "../../types-changeToNPM/shared-DTOs";

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
    const { homeTeamId, awayTeamId, fixtureId } = gameData;

    logger.info(`GameService: creating game, home team ${homeTeamId} and away team ${awayTeamId}`);

    const game = new Game({
      homeTeam: homeTeamId,
      awayTeam: awayTeamId,
      fixture: fixtureId,
    });

    await game.save({ session });
    return game;
  }

  async updateGameResult(gameId: string, result: { homeTeamGoals: number; awayTeamGoals: number }): Promise<void> {
    logger.info(`GameService: updating game ${gameId} result`);

    const game = await Game.findById(gameId);

    if (!game) {
      throw new NotFoundError(`game ${gameId} not found`);
    }

    game.result = result;
    game.status = GameStatus.PLAYED;

    await game.save();
  }

  async updateGameStats(gameId: string, homeTeamStats: IGameTeamStats, awayTeamStats: IGameTeamStats) {
    logger.info(`GameService: updating game ${gameId} stats`);

    const game = await Game.findById(gameId);

    if (!game) {
      throw new NotFoundError(`game ${gameId} not found`);
    }

    if (game.status !== GameStatus.PLAYED) {
      throw new BadRequestError(`can't update game stats before updating its result`);
    }

    await transactionService.withTransaction(async (session) => {
      game.homeTeamStats = homeTeamStats;
      game.awayTeamStats = awayTeamStats;

      await Promise.all([
        TeamService.getInstance().addGameStats(game.homeTeam, homeTeamStats, session),
        TeamService.getInstance().addGameStats(game.awayTeam, awayTeamStats, session),
      ]);

      game.status = GameStatus.COMPLETED;
      await game.save({ session });
    });
  }

  async addGameResultAndStats(gameId: string, gameData: any) {
    // TODO: create type for the fixture data
    logger.info(`GameService: updating game ${gameId} result and stats`);

    const game = await Game.findById(gameId);

    if (!game) {
      throw new NotFoundError(`game ${gameId} not found`);
    }
    await transactionService.withTransaction(async (session) => {
      game.homeTeamStats = gameData.homeTeamStats;
      game.awayTeamStats = gameData.awayTeamStats;
      game.result = gameData.result;
      game.status = GameStatus.COMPLETED;

      await Promise.all([
        TeamService.getInstance().addGameStats(game.homeTeam, gameData.homeTeamStats, session),
        TeamService.getInstance().addGameStats(game.awayTeam, gameData.awayTeamStats, session),
      ]);

      await game.save({ session });
    });
  }

  async deleteFixtureGames(fixtureId: Types.ObjectId, session: ClientSession) {
    logger.info(`GameService: deleting games for fixture ${fixtureId}`);
    try {
      await Game.deleteMany({ fixture: fixtureId }).session(session);
    } catch (e) {
      logger.error(e);
      throw new Error(`failed to delete games for fixture ${fixtureId}`);
    }
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

import { ClientSession, Types } from "mongoose";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";
import Game, { AddGameData, IGame } from "../models/game";
import TeamService from "./team-service";
import { transactionService } from "./transaction-service";
import BadRequestError from "../errors/bad-request-error";
import { GAME_STATUS } from "../../types-changeToNPM/shared-DTOs";

class GameService {
  private static instance: GameService;

  private constructor() {}

  static getInstance(): GameService {
    if (!this.instance) {
      this.instance = new GameService();
    }
    return this.instance;
  }

  async createGame(gameData: AddGameData, fixtureId: Types.ObjectId, session: ClientSession): Promise<IGame> {
    const { homeTeam, awayTeam, date } = gameData;

    logger.info(`GameService: creating game, home team ${homeTeam} and away team ${awayTeam}`);

    const game = new Game({
      homeTeam,
      awayTeam,
      fixture: fixtureId,
      date,
    });

    await game.save({ session });

    return game;
  }

  async createFixtureGames(gamesData: AddGameData[], fixtureId: Types.ObjectId, session: ClientSession): Promise<IGame[]> {
    logger.info(`GameService: creating games for fixture with id ${fixtureId}`);

    const gamesWithFixtureId = gamesData.map((game) => ({
      ...game,
      fixture: fixtureId,
    }));

    return await Game.insertMany(gamesWithFixtureId, { session });
  }

  async updateGameResult(gameId: string, homeTeamGoals: number, awayTeamGoals: number): Promise<void> {
    logger.info(`GameService: updating game ${gameId} result`);

    const game = await Game.findById(gameId);

    if (!game) {
      throw new NotFoundError(`game ${gameId} not found`);
    }

    transactionService.withTransaction(async (session) => {
      game.result = {
        homeTeamGoals,
        awayTeamGoals,
      };
      game.status = GAME_STATUS.PLAYED;

      await game.updateTeamStats(session);
      await game.save({ session });
    });
  }

  async updateGameStats(gameId: string, homeTeamStats: any, awayTeamStats: any) {
    logger.info(`GameService: updating game ${gameId} stats`);

    const game = await Game.findById(gameId);

    if (!game) {
      throw new NotFoundError(`game ${gameId} not found`);
    }

    if (game.status !== GAME_STATUS.PLAYED) {
      throw new BadRequestError(`can't update game stats before updating its result`);
    }

    await transactionService.withTransaction(async (session) => {
      game.homeTeamStats = homeTeamStats;
      game.awayTeamStats = awayTeamStats;
      game.status = GAME_STATUS.COMPLETED;

      await Promise.all([
        TeamService.getInstance().addTeamGameStats(game.homeTeam, homeTeamStats, session),
        TeamService.getInstance().addTeamGameStats(game.awayTeam, awayTeamStats, session),
      ]);

      await game.save({ session });
    });
  }

  async updateGameResultAndStats(gameId: string, gameData: any) {
    logger.info(`GameService: updating game ${gameId} result and stats`);

    const game = await Game.findById(gameId);

    if (!game) {
      throw new NotFoundError(`game ${gameId} not found`);
    }

    console.log(gameData);

    await transactionService.withTransaction(async (session) => {
      // game.homeTeamStats = gameData.homeTeamStats;
      // game.awayTeamStats = gameData.awayTeamStats;
      // game.result = gameData.result;
      // game.status = GAME_STATUS.COMPLETED;
      // await Promise.all([
      //   TeamService.getInstance().addTeamGameStats(game.homeTeam, gameData.homeTeamStats, session),
      //   TeamService.getInstance().addTeamGameStats(game.awayTeam, gameData.awayTeamStats, session),
      // ]);
      // await game.save({ session });
    });
  }

  async deleteFixturesGames(fixturesIds: Types.ObjectId[], session: ClientSession) {
    logger.info(`GameService: deleting games for fixtures with ids ${fixturesIds}`);
    await Game.deleteMany({ fixtureId: { $in: fixturesIds } }, { session });
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

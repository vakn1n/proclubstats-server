import { ClientSession, Types } from "mongoose";
import { GAME_STATUS, GameDTO, PlayerPerformanceDTO, UpdatePlayerPerformanceDataRequest } from "../../types-changeToNPM/shared-DTOs";
import BadRequestError from "../errors/bad-request-error";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";
import Game, { AddGameData, IGame, IPlayerGamePerformance } from "../models/game";
import PlayerService from "./player-service";
import TeamService from "./team-service";
import { transactionService } from "./transaction-service";
import { GameMapper } from "../mappers/game-mapper";

class GameService {
  private static instance: GameService;

  private constructor() {}

  static getInstance(): GameService {
    if (!this.instance) {
      this.instance = new GameService();
    }
    return this.instance;
  }

  async getGamesByIds(gamesIds: Types.ObjectId[]): Promise<GameDTO[]> {
    logger.info(`GameService: fetching ${gamesIds.length} games`);

    const games = await Game.find({ _id: { $in: gamesIds } });
    if (games.length !== gamesIds.length) {
      throw new BadRequestError(`Some requested games does not exist`);
    }
    return await GameMapper.mapToDtos(games);
  }

  async getGameById(id: string): Promise<GameDTO> {
    logger.info(`getting game ${id}`);

    const game = await Game.findById(id);
    if (!game) {
      throw new NotFoundError(`game with id ${id} not found`);
    }
    return await GameMapper.mapToDto(game);
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

    return await transactionService.withTransaction(async (session) => {
      if (game.status !== GAME_STATUS.SCHEDULED) {
        await TeamService.getInstance().revertTeamGameData(game.homeTeam, game.result!.homeTeamGoals, game.result!.awayTeamGoals, session);

        await TeamService.getInstance().revertTeamGameData(game.awayTeam, game.result!.awayTeamGoals, game.result!.homeTeamGoals, session);
      }
      game.result = {
        homeTeamGoals,
        awayTeamGoals,
      };

      game.status = GAME_STATUS.PLAYED;

      await TeamService.getInstance().updateTeamGameStats(game.homeTeam, homeTeamGoals, awayTeamGoals, session);
      await TeamService.getInstance().updateTeamGameStats(game.awayTeam, awayTeamGoals, homeTeamGoals, session);
      await game.save({ session });
    });
  }

  async updateTeamPlayersPerformance(gameId: string, isHomeTeam: boolean, playersPerformance: UpdatePlayerPerformanceDataRequest[]) {
    logger.info(`GameService: updating game ${gameId} team stats`);
    const game = await Game.findById(gameId);
    if (!game) {
      throw new NotFoundError(`game ${gameId} not found`);
    }
    if (game.status !== GAME_STATUS.PLAYED && game.status !== GAME_STATUS.COMPLETED) {
      throw new BadRequestError(`can't update game team stats before updating its result`);
    }

    return await transactionService.withTransaction(async (session) => {
      const isCleanSheet = isHomeTeam ? game.result!.awayTeamGoals === 0 : game.result!.homeTeamGoals === 0;
      const playersStats: IPlayerGamePerformance[] = playersPerformance.map((playerPerformance) => ({
        ...playerPerformance,
        cleanSheet: isCleanSheet,
      }));

      await this.setGamePlayersPerformance(game, isHomeTeam, playersStats, session);

      if (game.homeTeamPlayersPerformance?.length && game.awayTeamPlayersPerformance?.length) {
        game.status = GAME_STATUS.COMPLETED;
      }

      await PlayerService.getInstance().updatePlayersGamePerformance(playersStats, session);

      await game.save({ session });
    });
  }

  private async setGamePlayersPerformance(game: IGame, isHomeTeam: boolean, playersStats: IPlayerGamePerformance[], session: ClientSession) {
    if (isHomeTeam) {
      if (game.homeTeamPlayersPerformance?.length) {
        await PlayerService.getInstance().revertPlayersGamePerformance(game.homeTeamPlayersPerformance, session);
      }
      game.homeTeamPlayersPerformance = playersStats;
    } else {
      if (game.awayTeamPlayersPerformance?.length) {
        await PlayerService.getInstance().revertPlayersGamePerformance(game.awayTeamPlayersPerformance, session);
      }
      game.awayTeamPlayersPerformance = playersStats;
    }
  }

  async deleteFixturesGames(fixturesIds: Types.ObjectId[], session: ClientSession) {
    logger.info(`GameService: deleting games for fixtures with ids ${fixturesIds}`);

    // TODO: remove results data from the team and players

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
}

export default GameService;

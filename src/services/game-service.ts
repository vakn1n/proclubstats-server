import { ClientSession, Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import logger from "../config/logger";
import { BadRequestError } from "../errors";
import { IGameRepository, IGameService } from "../interfaces/game";
import { IPlayerService } from "../interfaces/player";
import { ITeamService } from "../interfaces/team";
import { GameMapper } from "../mappers/game-mapper";
import { AddGameData, IGame, IPlayerGamePerformance } from "../models/game";
import { transactionService } from "./util-services/transaction-service";
import { GameDTO, GAME_STATUS, UpdatePlayerPerformanceDataRequest } from "@pro-clubs-manager/shared-dtos";
@injectable()
export class GameService implements IGameService {
  private gameRepository: IGameRepository;
  private teamService: ITeamService;
  private playerService: IPlayerService;

  constructor(
    @inject("IGameRepository") gameRepository: IGameRepository,
    @inject("ITeamService") teamService: ITeamService,
    @inject("IPlayerService") playerService: IPlayerService
  ) {
    this.gameRepository = gameRepository;
    this.teamService = teamService;
    this.playerService = playerService;
  }

  async getGamesByIds(gamesIds: Types.ObjectId[]): Promise<GameDTO[]> {
    logger.info(`GameService: fetching ${gamesIds.length} games`);

    const games = await this.gameRepository.getGamesByIds(gamesIds);

    return await GameMapper.mapToDtos(games);
  }

  async getGameById(id: string): Promise<GameDTO> {
    logger.info(`GameService: getting game ${id}`);

    const game = await this.gameRepository.getGameById(id);

    return await GameMapper.mapToDto(game);
  }

  async getTeamGames(teamId: string, limit?: number): Promise<GameDTO[]> {
    logger.info(`GameService: getting games for team ${teamId}`);

    let teamGames = await this.gameRepository.getTeamGames(teamId);

    if (limit) {
      // if we pass limit, it means we want to fetch the last games, so sort the rounds the opposite way
      teamGames.sort((game1, game2) => game2.round - game1.round);
      teamGames = teamGames.slice(0, limit);
    }

    return await GameMapper.mapToDtos(teamGames);
  }

  async createGame(gameData: AddGameData, fixtureId: Types.ObjectId, session: ClientSession): Promise<GameDTO> {
    logger.info(`GameService: creating game, home team ${gameData.homeTeam} and away team ${gameData.awayTeam}`);

    const game = await this.gameRepository.createGame(fixtureId, gameData, session);

    return await GameMapper.mapToDto(game);
  }

  async createFixtureGames(fixtureId: Types.ObjectId, gamesData: AddGameData[], session: ClientSession): Promise<IGame[]> {
    logger.info(`GameService: creating games for fixture with id ${fixtureId}`);

    return await this.gameRepository.createGames(fixtureId, gamesData, session);
  }

  async updateGameResult(gameId: string, homeTeamGoals: number, awayTeamGoals: number): Promise<void> {
    logger.info(`GameService: updating game ${gameId} result`);

    const game = await this.gameRepository.getGameById(gameId);

    return await transactionService.withTransaction(async (session) => {
      if (game.status !== GAME_STATUS.SCHEDULED) {
        await this.teamService.revertTeamGameStats(game.homeTeam, game.result!.homeTeamGoals, game.result!.awayTeamGoals, session);

        await this.teamService.revertTeamGameStats(game.awayTeam, game.result!.awayTeamGoals, game.result!.homeTeamGoals, session);
      }
      game.result = {
        homeTeamGoals,
        awayTeamGoals,
      };

      game.status = GAME_STATUS.PLAYED;

      await this.teamService.updateTeamGameStats(game.homeTeam, homeTeamGoals, awayTeamGoals, session);
      await this.teamService.updateTeamGameStats(game.awayTeam, awayTeamGoals, homeTeamGoals, session);
      await game.save({ session });
    });
  }

  async updateTeamPlayersPerformance(gameId: string, isHomeTeam: boolean, playersPerformance: UpdatePlayerPerformanceDataRequest[]) {
    logger.info(`GameService: updating game ${gameId} team stats`);
    const game = await this.gameRepository.getGameById(gameId);

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

      await this.playerService.updatePlayersGamePerformance(playersStats, session);

      await game.save({ session });
    });
  }

  private async setGamePlayersPerformance(game: IGame, isHomeTeam: boolean, playersStats: IPlayerGamePerformance[], session: ClientSession) {
    if (isHomeTeam) {
      if (game.homeTeamPlayersPerformance?.length) {
        await this.playerService.revertPlayersGamePerformance(game.homeTeamPlayersPerformance, session);
      }
      game.homeTeamPlayersPerformance = playersStats;
    } else {
      if (game.awayTeamPlayersPerformance?.length) {
        await this.playerService.revertPlayersGamePerformance(game.awayTeamPlayersPerformance, session);
      }
      game.awayTeamPlayersPerformance = playersStats;
    }
  }

  async deleteGame(id: string): Promise<void> {
    logger.info(`deleting game ${id}`);
    await this.gameRepository.deleteGameById(id);
  }
}

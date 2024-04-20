import { ClientSession, Types } from "mongoose";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";
import Game, { AddGameData, IGame } from "../models/game";
import TeamService from "./team-service";
import { transactionService } from "./transaction-service";
import BadRequestError from "../errors/bad-request-error";
import { GAME_STATUS, GameDTO, TeamGameStatsData } from "../../types-changeToNPM/shared-DTOs";
import PlayerService from "./player-service";
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
      if (game.status === GAME_STATUS.PLAYED || game.status === GAME_STATUS.COMPLETED) {
        // TODO: remove prev result from teams stats
      }
      game.result = {
        homeTeamGoals,
        awayTeamGoals,
      };
      game.status = GAME_STATUS.PLAYED;

      // await Promise.all([
      //   TeamService.getInstance().updateTeamGameStats(game.homeTeam, homeTeamGoals, awayTeamGoals, session),
      //   TeamService.getInstance().updateTeamGameStats(game.awayTeam, awayTeamGoals, homeTeamGoals, session),
      // ]);
      await TeamService.getInstance().updateTeamGameStats(game.homeTeam, homeTeamGoals, awayTeamGoals, session);
      await TeamService.getInstance().updateTeamGameStats(game.awayTeam, awayTeamGoals, homeTeamGoals, session);
      await game.save({ session });
      console.log("game saved");
    });
  }

  async updateGameStats(gameId: string, homeTeamStats: TeamGameStatsData, awayTeamStats: TeamGameStatsData) {
    logger.info(`GameService: updating game ${gameId} events and players stats`);

    const game = await Game.findById(gameId);

    if (!game) {
      throw new NotFoundError(`game ${gameId} not found`);
    }

    if (game.status !== GAME_STATUS.PLAYED && game.status !== GAME_STATUS.COMPLETED) {
      throw new BadRequestError(`can't update game players stats before updating its result`);
    }

    return await transactionService.withTransaction(async (session) => {
      game.status = GAME_STATUS.COMPLETED;
      game.homeTeamStats = {
        goals: homeTeamStats.goals?.map((goalData) => ({ scorerId: goalData.scorerId, minute: goalData.minute, assisterId: goalData.assisterId })),
        // playerStats: homeTeamStats.playersStats.map((playerStat) => ({
        //   playerId: playerStat.id,
        //   rating: playerStat.rating,
        //   playerOfTheMatch: playerStat.playerOfTheMatch,
        // })),
      };
      game.awayTeamStats = {
        goals: awayTeamStats.goals?.map((goalData) => ({ scorerId: goalData.scorerId, minute: goalData.minute, assisterId: goalData.assisterId })),
        // playerStats: awayTeamStats.playersStats?.map((playerStat) => ({
        //   playerId: playerStat.id,
        //   rating: playerStat.rating,
        //   playerOfTheMatch: playerStat.playerOfTheMatch,
        // })),
      };

      // await Promise.all([
      await PlayerService.getInstance().updatePlayersGameStats(homeTeamStats.playersStats, session),
        await PlayerService.getInstance().updatePlayersGameStats(awayTeamStats.playersStats || [], session),
        // ]);

        await game.save({ session });
    });
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

  async getGameById(id: string): Promise<GameDTO> {
    logger.info(`getting game ${id}`);

    const game = await Game.findById(id);
    if (!game) {
      throw new NotFoundError(`game with id ${id} not found`);
    }
    return await GameMapper.mapToDto(game);
  }

  async getAllGames(): Promise<IGame[]> {
    logger.info(`getting all games`);
    return await Game.find();
  }
}

export default GameService;

import { Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import { IGameRepository } from "../../interfaces/game";
import { IPlayerRepository } from "../../interfaces/player";
import { IPlayerStatsService } from "../../interfaces/wrapper-services";
import { IPlayerStats } from "../../models/player/player";
import logger from "../../config/logger";
import { PlayerLastGamesForm } from "@pro-clubs-manager/shared-dtos";

@injectable()
export class PlayerStatsService implements IPlayerStatsService {
  constructor(@inject("IPlayerRepository") private playerRepository: IPlayerRepository, @inject("IGameRepository") private gameRepository: IGameRepository) {}

  async getPlayerStatsByPosition(playerId: string | Types.ObjectId): Promise<{ [position: string]: IPlayerStats }> {
    const player = await this.playerRepository.getPlayerById(playerId);
    if (!player.currentSeason) {
      return {};
    }
    const playerGames = await this.gameRepository.getPlayerPlayedSeasonGames(player.id, player.currentSeason.league, player.currentSeason.seasonNumber);
    console.log(playerGames.length);

    const positionStats: { [position: string]: IPlayerStats } = {};

    playerGames.forEach((game) => {
      const performances = [...game.homeTeamPlayersPerformance!, ...game.awayTeamPlayersPerformance!];
      const playerPerformance = performances.find((p) => p.playerId.equals(player._id));

      if (!playerPerformance) {
        logger.error(`Player ${player.id} didnt played in the game ${game.id}`);
        throw new Error(`Failed to fetch player ${player.id} stats by position `);
      }
      const { positionPlayed, rating, goals, assists, cleanSheet, playerOfTheMatch } = playerPerformance;
      if (!positionPlayed) {
        logger.error(`Player ${player.id} doesnt have position in the game ${game.id}`);
        throw new Error(`Failed to fetch player ${player.id} stats by position `);
      }
      if (!positionStats[positionPlayed]) {
        positionStats[positionPlayed] = {
          games: 0,
          goals: 0,
          assists: 0,
          cleanSheets: 0,
          playerOfTheMatch: 0,
          avgRating: 0,
        };
      }

      const stats = positionStats[positionPlayed];
      stats.games += 1;
      stats.goals += goals || 0;
      stats.assists += assists || 0;
      stats.cleanSheets += cleanSheet ? 1 : 0;
      stats.playerOfTheMatch += playerOfTheMatch ? 1 : 0;
      stats.avgRating = (stats.avgRating * (stats.games - 1) + rating) / stats.games;
    });

    return positionStats;
  }

  async getLastFiveGamesPerformance(playerId: string, numberOfGames: number = 5): Promise<PlayerLastGamesForm> {
    const player = await this.playerRepository.getPlayerById(playerId);
    if (!player.currentSeason) {
      return { lastGames: [], totalGoals: 0, totalAssists: 0 };
    }

    const games = await this.gameRepository.getPlayerLastGames(playerId, player.currentSeason?.league, player.currentSeason?.seasonNumber, numberOfGames);
    let totalGoals = 0;
    let totalAssists = 0;

    const gamesPerformance = games.map((game) => {
      const performance =
        game.homeTeamPlayersPerformance?.find((p) => p.playerId.equals(player._id)) ||
        game.awayTeamPlayersPerformance?.find((p) => p.playerId.equals(player._id));

      if (!performance) {
        logger.error(`Player ${playerId} didnt played in the game ${game.id}`);
        throw new Error(`failed to get last games of player with id ${playerId}`);
      }

      totalGoals += performance.goals || 0;
      totalAssists += performance.assists || 0;

      return {
        gameId: game.id,
        league: { name: game.league.name, id: game.league.id },
        round: game.round,
        date: game.date,
        rating: performance.rating || 0,
        goals: performance.goals || 0,
        assists: performance.assists || 0,
        homeTeam: { id: game.homeTeam.id, name: game.homeTeam.name, imgUrl: game.homeTeam.imgUrl },
        awayTeam: { id: game.awayTeam.id, name: game.awayTeam.name, imgUrl: game.awayTeam.imgUrl },
        result: {
          homeTeamGoals: game.result!.homeTeamGoals,
          awayTeamGoals: game.result!.awayTeamGoals,
        },
        positionPlayed: performance.positionPlayed,
      };
    });

    return {
      lastGames: gamesPerformance,
      totalGoals,
      totalAssists,
    };
  }
}

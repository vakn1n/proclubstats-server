import { Types } from "mongoose";
import { inject } from "tsyringe";
import { IGameRepository } from "../../interfaces/game";
import { IPlayerRepository } from "../../interfaces/player";
import { IPlayerStatsService } from "../../interfaces/wrapper-services";
import { IPlayerStats } from "../../models/player";
import logger from "../../config/logger";

export class PlayerStatsService implements IPlayerStatsService {
  private playerRepository: IPlayerRepository;
  private gameRepository: IGameRepository;
  constructor(@inject("IPlayerRepository") playerRepository: IPlayerRepository, @inject("IGameRepository") gameRepository: IGameRepository) {
    this.gameRepository = gameRepository;
    this.playerRepository = playerRepository;
  }

  async getPlayerStatsByPosition(playerId: string | Types.ObjectId): Promise<{ [position: string]: IPlayerStats }> {
    const player = await this.playerRepository.getPlayerById(playerId);
    if (!player.currentSeason) {
      return {};
    }
    const playerGames = await this.gameRepository.getPlayerPlayedGames(playerId, player.currentSeason.league, player.currentSeason.seasonNumber);
    const positionStats: { [position: string]: IPlayerStats } = {};

    playerGames.forEach((game) => {
      const performances = [...game.homeTeamPlayersPerformance!, ...game.awayTeamPlayersPerformance!];
      const playerPerformance = performances.find((p) => p.playerId === player.id);

      if (!playerPerformance) {
        logger.error(`Player ${player.id} didnt played in the game ${game.id}`);
        return;
      }
      const { positionPlayed, rating, goals, assists, cleanSheet, playerOfTheMatch } = playerPerformance;
      if (!positionPlayed) {
        logger.error(`Player ${player.id} doesnt have position in the game ${game.id}`);
        return;
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
}

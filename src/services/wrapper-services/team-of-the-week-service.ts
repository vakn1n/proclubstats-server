import { inject, injectable } from "tsyringe";
import { ITeamOfTheWeekService } from "../../interfaces/wrapper-services/team-of-the-week-service.interface";
import { IPlayerRepository } from "../../interfaces/player";
import { IGame } from "../../models/game/game";
import logger from "../../config/logger";

@injectable()
export class TeamOfTheWeekService implements ITeamOfTheWeekService {
  constructor(@inject("IPlayerRepository") private playerRepository: IPlayerRepository) {}
  calculateTeamOfTheWeek(games: IGame[]): Promise<{}> {
    logger.info(`TeamOfTheWeekService: calculating team of the week`);
    console.log(games);

    throw new Error("Method not implemented.");
  }

  //   private calculate(games: any[]) {
  //     const playerStats = this.aggregatePlayerStats(games);
  //     return this.selectBestPlayers(playerStats);
  //   }

  //   private aggregatePlayerStats(games: any[]) {
  //     const stats = {};

  //     for (const game of games) {
  //       for (const performance of [...game.homeTeamPerformances, ...game.awayTeamPerformances]) {
  //         const playerId = performance.player._id.toString();
  //         if (!stats[playerId]) {
  //           stats[playerId] = { ...performance, gamesPlayed: 0, totalStats: { ...performance } };
  //         }

  //         // Increment stats
  //         stats[playerId].gamesPlayed++;
  //         stats[playerId].totalStats.rating += performance.rating;
  //         stats[playerId].totalStats.cleanSheets += performance.cleanSheet ? 1 : 0;
  //         stats[playerId].totalStats.goals += performance.goals || 0;
  //         stats[playerId].totalStats.assists += performance.assists || 0;
  //       }
  //     }

  //     return stats;
  //   }

  //   private selectBestPlayers(playerStats: any) {
  //     const formation = { gk: 1, def: 3, mid: 5, st: 2 }; // Example formation
  //     const team = { gk: [], def: [], mid: [], st: [] };

  //     for (const playerId in playerStats) {
  //       const stats = playerStats[playerId];
  //       const avgRating = stats.totalStats.rating / stats.gamesPlayed;

  //       if (stats.gamesPlayed < 2) continue; // Filter out ineligible players

  //       const playerScore = this.calculateScore(stats, avgRating);
  //       team[stats.position].push({ playerId, playerScore });
  //     }

  //     // Select top players for each position
  //     for (const position in team) {
  //       team[position].sort((a, b) => b.playerScore - a.playerScore);
  //       team[position] = team[position].slice(0, formation[position]);
  //     }

  //     return team;
  //   }

  private calculateScore(stats: any, avgRating: number) {
    const { position } = stats;
    switch (position) {
      case "gk":
        return avgRating * 0.7 + stats.totalStats.cleanSheets * 0.3;
      case "def":
        return avgRating * 0.5 + stats.totalStats.cleanSheets * 0.5 + (stats.totalStats.goals + stats.totalStats.assists) * 0.1;
      case "mid":
        return avgRating * 0.7 + (stats.totalStats.assists / stats.gamesPlayed) * 0.2 + stats.totalStats.cleanSheets * 0.1;
      case "st":
        return avgRating * 0.3 + (stats.totalStats.goals / stats.gamesPlayed) * 0.6 + (stats.totalStats.assists / stats.gamesPlayed) * 0.1;
      default:
        return avgRating;
    }
  }
}

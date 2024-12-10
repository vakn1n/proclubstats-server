import { inject, injectable } from "tsyringe";
import { ITeamOfTheWeekService } from "../../interfaces/wrapper-services/team-of-the-week-service.interface";
import { IPlayerRepository } from "../../interfaces/player";
import { IGame, PlayerGamePerformance } from "../../models/game/game";
import logger from "../../config/logger";

type PlayersWeekStatsMap = {
  [playerId: string]: {
    totalGames: number;
    positions: {
      [position: string]: {
        goals: number;
        games: number;
        assists: number;
        cleanSheets: number;
        totalRating: number;
      };
    };
  };
};

const positionMapping: { [key: string]: string } = {
  CF: "ST",
  ST: "ST",
  CM: "CDM",
  CDM: "CDM",
  RB: "RM",
  RM: "RM",
  RW: "RM",
  RWB: "RM",
  LB: "LM",
  LM: "LM",
  LW: "LM",
  LWB: "LM",
  CAM: "CAM",
};

// Function to normalize position
function normalizePosition(position: string): string {
  return positionMapping[position] || position; // Default to original position if no mapping exists
}

@injectable()
export class TeamOfTheWeekService implements ITeamOfTheWeekService {
  constructor(@inject("IPlayerRepository") private playerRepository: IPlayerRepository) {}
  calculateTeamOfTheWeek(games: IGame[]): Promise<{}> {
    logger.info(`TeamOfTheWeekService: calculating team of the week`);
    // Step 1: Aggregate player stats from games
    const playerStats = this.aggregatePlayersWeeklyStats(games);
    console.log(playerStats);
    // 2. Calculate total scores for eligible players
    // const scoredPlayers = this.calculateTotalScores(playersWeekStats, eligiblePlayers);

    // // 3. Select Team of the Week
    // const teamOfTheWeek = this.selectTeamOfTheWeek(scoredPlayers, playersWeekStats);

    // // 4. Select Honorable Mentions
    // const honorableMentions = this.selectHonorableMentions(scoredPlayers, playersWeekStats, teamOfTheWeek);

    // // 5. Return Final Result
    // return { teamOfTheWeek, honorableMentions };
    throw new Error(`TeamOfTheWeekService`);
  }

  private aggregatePlayersWeeklyStats(weekGames: IGame[]): PlayersWeekStatsMap {
    const playersWeekStats: PlayersWeekStatsMap = {};

    for (const game of weekGames) {
      if (!game.homeTeamPlayersPerformance || !game.awayTeamPlayersPerformance) {
        throw new Error(`Game with id ${game.id} players stats not available`);
      }

      const allPlayersPerformance = [...game.homeTeamPlayersPerformance, ...game.awayTeamPlayersPerformance];
      allPlayersPerformance.forEach((performance) => this.aggregatePlayerPerformance(playersWeekStats, performance));
    }

    // Filter out players with fewer than 2 total games
    Object.keys(playersWeekStats).forEach((playerId) => {
      if (playersWeekStats[playerId].totalGames < 2) {
        delete playersWeekStats[playerId];
      }
    });

    return playersWeekStats;
  }

  private aggregatePlayerPerformance(playersWeekStats: PlayersWeekStatsMap, performance: PlayerGamePerformance) {
    const playerId = performance.playerId.toString();
    const position = normalizePosition(performance.positionPlayed);

    if (!position) {
      return; // Skip players without a position
    }

    // Initialize player if not already present
    if (!playersWeekStats[playerId]) {
      playersWeekStats[playerId] = {
        totalGames: 0,
        positions: {},
      };
    }

    // Initialize position-specific stats if not already present
    if (!playersWeekStats[playerId].positions[position]) {
      playersWeekStats[playerId].positions[position] = {
        games: 0,
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        totalRating: 0,
      };
    }

    const positionStats = playersWeekStats[playerId].positions[position];
    positionStats.games++;
    positionStats.goals += performance.goals || 0;
    positionStats.assists += performance.assists || 0;
    positionStats.cleanSheets += performance.cleanSheet ? 1 : 0;
    positionStats.totalRating += performance.rating;

    playersWeekStats[playerId].totalGames++;
  }

  // private selectBestPlayers(playerStats: PlayersWeekStatsMap) {
  //   const formation = { gk: 1, def: 3, mid: 5, st: 2 }; // Example formation
  //   const team = { gk: [], def: [], mid: [], st: [] };
  //   // const honorableMentions: { playerId: string; stats: PlayerStatsByPosition }[] = [];
  //   const honorableMentions: { playerId: string; stats: {} }[] = [];

  //   const playerScoresByPosition: Record<string, { playerId: string; position: string; score: number }[]> = {};
  //   const allPlayerScores: { playerId: string; score: number; position: string }[] = [];

  //   // Step 1: Calculate player scores for each position
  //   for (const playerId in playerStats) {
  //     const positionStats = playerStats[playerId];

  //     for (const position in positionStats) {
  //       const stats = positionStats[position];

  //       if (stats.games < 2) continue; // Filter out ineligible players
  //       const avgRating = stats.totalRating / stats.games;

  //       const playerScore = this.calculateScore(stats, avgRating);

  //       // Add player to position-specific array for sorting
  //       if (!playerScoresByPosition[position]) {
  //         playerScoresByPosition[position] = [];
  //       }
  //       playerScoresByPosition[position].push({ playerId, position, score: playerScore });

  //       // Collect all player scores for future honorable mention check
  //       allPlayerScores.push({ playerId, score: playerScore, position });
  //     }
  //   }

  //   // Step 2: Select the best team based on formation
  //   const teamOfTheWeekPlayerIds = new Set<string>();
  //   for (const position in formation) {
  //     if (!playerScoresByPosition[position]) continue;

  //     playerScoresByPosition[position].sort((a, b) => b.score - a.score);
  //     const topPlayers = playerScoresByPosition[position].slice(0, formation[position]);

  //     team[position] = topPlayers.map((player) => ({
  //       playerId: player.playerId,
  //       stats: playerStats[player.playerId][player.position],
  //     }));

  //     // Add selected players to the team of the week set
  //     topPlayers.forEach((player) => teamOfTheWeekPlayerIds.add(player.playerId));
  //   }

  //   // Step 3: Filter and sort honorable mentions
  //   for (const { playerId, score, position } of allPlayerScores) {
  //     // Skip players already in the team of the week
  //     if (teamOfTheWeekPlayerIds.has(playerId)) continue;

  //     // Check if the player has at least 2 games played in any position
  //     const positionStats = playerStats[playerId];
  //     const totalGamesPlayed = Object.values(positionStats).reduce((sum, stats) => sum + stats.games, 0);

  //     if (totalGamesPlayed < 2) continue;

  //     // Add to honorable mentions only if their score is lower than the best team players
  //     if (score < Math.max(...playerScoresByPosition[position].map((player) => player.score))) {
  //       honorableMentions.push({ playerId, stats: positionStats });
  //     }
  //   }

  //   // Sort honorable mentions by their highest score in any position
  //   honorableMentions.sort((a, b) => {
  //     const aMaxScore = Math.max(...Object.values(a.stats).map((s) => s.totalRating / s.games));
  //     const bMaxScore = Math.max(...Object.values(b.stats).map((s) => s.totalRating / s.games));
  //     return bMaxScore - aMaxScore;
  //   });

  //   return { team, honorableMentions };
  // }

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

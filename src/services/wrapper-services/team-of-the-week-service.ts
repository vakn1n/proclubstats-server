import { inject, injectable } from "tsyringe";
import { ITeamOfTheWeekService } from "../../interfaces/wrapper-services/team-of-the-week-service.interface";
import { IPlayerRepository } from "../../interfaces/player";
import { IGame, PlayerGamePerformance } from "../../models/game/game";
import logger from "../../config/logger";
import { PopulatedPlayerWithTeam } from "../../models/player/player";

type PlayerPositionStats = {
  goals: number;
  games: number;
  assists: number;
  cleanSheets: number;
  avgRating: number;
  playerOfTheMatch: number;
};

type PlayersWeekStatsMap = {
  [playerId: string]: {
    totalGames: number;
    totalScore: number;
    positionsStats: {
      [position: string]: PlayerPositionStats;
    };
  };
};

type TeamOfTheWeek = { playerId: string; position: string; score: number; stats: PlayerPositionStats }[];

type HonorableMentions = {
  playerId: string;
  totalGames: number;
  totalScore: number;
  positionsStats: {
    [position: string]: PlayerPositionStats;
  };
}[];

type EnrichedPlayerInfo = {
  playerId: string;
  name: string;
  imgUrl?: string;
  team: {
    id: string;
    name: string;
    imgUrl?: string;
  };
};

type EnrichedTeamOfTheWeek = {
  player: EnrichedPlayerInfo;
  position: string;
  score: number;
  stats: PlayerPositionStats;
}[];

type EnrichedHonorableMentions = {
  player: EnrichedPlayerInfo;
  totalGames: number;
  totalScore: number;
  positionsStats: {
    [position: string]: PlayerPositionStats;
  };
}[];

type PlayersByPosition = {
  [position: string]: Array<{ playerId: string; score: number; stats: PlayerPositionStats }>;
};

const positionMapping: { [key: string]: string } = {
  CF: "ST",
  CM: "CDM",
  CDM: "CDM",
  RB: "RM",
  RW: "RM",
  RWB: "RM",
  LB: "LM",
  LW: "LM",
  LWB: "LM",
};

// Function to normalize position
function normalizePosition(position: string): string {
  return positionMapping[position] || position; // Default to original position if no mapping exists
}

@injectable()
export class TeamOfTheWeekService implements ITeamOfTheWeekService {
  constructor(@inject("IPlayerRepository") private playerRepository: IPlayerRepository) {}

  async getTeamOfTheWeek(games: IGame[]) {
    logger.info(`TeamOfTheWeekService: calculating team of the week`);

    const playersWeekStats = this.aggregatePlayersWeeklyStats(games);

    const playersScores = this.calculateTotalScores(playersWeekStats);

    const teamOfTheWeek = this.generateTeamOfTheWeek(playersScores);

    const honorableMentions = this.generateHonorableMentions(playersScores, teamOfTheWeek);

    const { enrichedHonorableMentions, enrichedTeamOfTheWeek } = await this.populatePlayersData(teamOfTheWeek, honorableMentions);

    return { teamOfTheWeek: enrichedTeamOfTheWeek, honorableMentions: enrichedHonorableMentions };
  }

  /**
   * Enriches players in the Team of the Week and Honorable Mentions with player and team data.
   */
  async populatePlayersData(teamOfTheWeek: TeamOfTheWeek, honorableMentions: HonorableMentions) {
    const playerIds = this.getUniquePlayerIds(teamOfTheWeek, honorableMentions);

    // Fetch player and team data in one go
    const playersWithTeamData = await this.playerRepository.getPlayersWithTeamData(playerIds);

    const playerTeamMap = this.createPlayerTeamMap(playersWithTeamData);

    return {
      enrichedTeamOfTheWeek: this.enrichTeamOfTheWeek(teamOfTheWeek, playerTeamMap),
      enrichedHonorableMentions: this.enrichHonorableMentions(honorableMentions, playerTeamMap),
    };
  }

  /**
   * Extracts unique player IDs from both Team of the Week and Honorable Mentions.
   */
  private getUniquePlayerIds(teamOfTheWeek: TeamOfTheWeek, honorableMentions: HonorableMentions): string[] {
    return [...new Set([...teamOfTheWeek.map((entry) => entry.playerId), ...honorableMentions.map((entry) => entry.playerId)])];
  }

  /**
   * Creates a map of player IDs to their enriched data.
   */
  private createPlayerTeamMap(playersWithTeamData: PopulatedPlayerWithTeam[]): Map<string, EnrichedPlayerInfo> {
    return new Map(
      playersWithTeamData.map(({ team, id: playerId, name, imgUrl }) => [
        playerId,
        {
          playerId,
          name,
          imgUrl,
          team: {
            id: team.id,
            name: team.name,
            imgUrl: team.imgUrl,
          },
        },
      ])
    );
  }

  /**
   * Enriches the Team of the Week with player and team data.
   */
  private enrichTeamOfTheWeek(teamOfTheWeek: TeamOfTheWeek, playerTeamMap: Map<string, EnrichedPlayerInfo>): EnrichedTeamOfTheWeek {
    return teamOfTheWeek.map((entry) => {
      const playerData = playerTeamMap.get(entry.playerId);

      if (!playerData) {
        throw new Error(`Missing player data for playerId: ${entry.playerId}`);
      }

      return {
        player: playerData,
        position: entry.position,
        score: entry.score,
        stats: entry.stats,
      };
    });
  }

  /**
   * Enriches Honorable Mentions with player and team data.
   */
  private enrichHonorableMentions(honorableMentions: HonorableMentions, playerTeamMap: Map<string, EnrichedPlayerInfo>): EnrichedHonorableMentions {
    return honorableMentions.map((entry) => {
      const playerData = playerTeamMap.get(entry.playerId);
      if (!playerData) {
        throw new Error(`Missing player data for playerId: ${entry.playerId}`);
      }

      return {
        player: playerData,
        totalGames: entry.totalGames,
        totalScore: entry.totalScore,
        positionsStats: entry.positionsStats,
      };
    });
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

  private aggregatePlayerPerformance(playersWeekStats: PlayersWeekStatsMap, playerPerformance: PlayerGamePerformance) {
    const playerId = playerPerformance.playerId.toString();
    const position = normalizePosition(playerPerformance.positionPlayed);

    if (!position) {
      return; // Skip players without a position
    }

    // Initialize player if not already present
    if (!playersWeekStats[playerId]) {
      playersWeekStats[playerId] = {
        totalGames: 0,
        positionsStats: {},
        totalScore: 0,
      };
    }

    // Initialize position-specific stats if not already present
    if (!playersWeekStats[playerId].positionsStats[position]) {
      playersWeekStats[playerId].positionsStats[position] = {
        games: 0,
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        avgRating: 0.0,
        playerOfTheMatch: 0,
      };
    }

    const positionStats = playersWeekStats[playerId].positionsStats[position];
    positionStats.games++;
    positionStats.goals += playerPerformance.goals || 0;
    positionStats.assists += playerPerformance.assists || 0;
    positionStats.cleanSheets += playerPerformance.cleanSheet ? 1 : 0;
    positionStats.avgRating = (positionStats.avgRating * (positionStats.games - 1) + playerPerformance.rating) / positionStats.games;
    positionStats.playerOfTheMatch += playerPerformance.playerOfTheMatch ? 1 : 0;
    playersWeekStats[playerId].totalGames++;
  }

  private calculateTotalScores(playersStats: PlayersWeekStatsMap): PlayersWeekStatsMap {
    const playerScores: PlayersWeekStatsMap = {};

    for (const playerId in playersStats) {
      const playerStats = playersStats[playerId];
      let totalScore = 0;

      for (const position in playerStats.positionsStats) {
        const stats = playerStats.positionsStats[position];
        totalScore += this.calculatePositionScore(position, stats);
      }

      playerScores[playerId] = {
        totalScore,
        totalGames: playerStats.totalGames,
        positionsStats: playerStats.positionsStats,
      };
    }

    return playerScores;
  }

  private generateTeamOfTheWeek(playersWeekStats: PlayersWeekStatsMap) {
    const playersByPosition = this.groupPlayersByPosition(playersWeekStats);

    // Sort players within each position by score
    this.sortPlayersByScore(playersByPosition);

    // Select the Team of the Week based on the formation
    const formation = {
      GK: 1,
      CB: 3,
      CDM: 2,
      LM: 1,
      RM: 1,
      CAM: 1,
      ST: 2,
    };
    return this.selectTeamOfTheWeek(playersByPosition, formation);
  }

  private groupPlayersByPosition(playersWeekStats: PlayersWeekStatsMap): PlayersByPosition {
    const playersByPosition: PlayersByPosition = {};

    for (const [playerId, playerStats] of Object.entries(playersWeekStats)) {
      for (const [position, stats] of Object.entries(playerStats.positionsStats)) {
        if (stats.games < 2) continue;

        if (!playersByPosition[position]) {
          playersByPosition[position] = [];
        }
        playersByPosition[position].push({
          playerId,
          score: playerStats.totalScore,
          stats,
        });
      }
    }

    return playersByPosition;
  }

  private sortPlayersByScore(playersByPosition: PlayersByPosition) {
    for (const position in playersByPosition) {
      playersByPosition[position].sort((a, b) => b.score - a.score);
    }
  }

  private selectTeamOfTheWeek(bestPlayersByPosition: PlayersByPosition, formation: { [position: string]: number }): TeamOfTheWeek {
    const teamOfTheWeek: TeamOfTheWeek = [];

    for (const [position, count] of Object.entries(formation)) {
      const positionPlayers = bestPlayersByPosition[position] || [];
      teamOfTheWeek.push(
        ...positionPlayers.slice(0, count).map((playerStatsData) => ({
          position,
          ...playerStatsData,
        }))
      );
    }

    return teamOfTheWeek;
  }

  private generateHonorableMentions(playersScores: PlayersWeekStatsMap, teamOfTheWeek: TeamOfTheWeek, count: number = 5) {
    const teamOfTheWeekIds = new Set(teamOfTheWeek.map((player) => player.playerId));

    const playersNotInTeamOfTheWeek = Object.entries(playersScores)
      .filter(([playerId]) => !teamOfTheWeekIds.has(playerId)) // Exclude players already in Team of the Week
      .map(([playerId, stats]) => ({
        ...stats,
        playerId,
      }));

    // Sort remaining players by total score and select the top 5
    return playersNotInTeamOfTheWeek.sort((a, b) => b.totalScore - a.totalScore).slice(0, count);
  }

  private calculatePositionScore(position: string, stats: PlayerPositionStats): number {
    let bonusPoints = 0.1 * stats.playerOfTheMatch; // start with bonus points for man of the match
    const { avgRating } = stats;
    switch (position) {
      case "GK":
        return avgRating * 0.7 + stats.cleanSheets * 0.3;

      case "CB":
        const baseScore = avgRating * 0.7 + stats.cleanSheets * 0.3;
        bonusPoints = ((stats.goals + stats.assists) / stats.games) * 0.2; // Bonus points for attacking contributions
        return baseScore + bonusPoints;

      case "CDM": // CM, CDM
        bonusPoints = (stats.goals / stats.games) * 0.2; // Bonus points for attacking contributions
        return avgRating * 0.7 + (stats.assists / stats.games) * 0.2 + stats.cleanSheets * 0.1 + bonusPoints;

      case "RM": // (RB, RM, RW, RWB)
      case "LM": //  (LB, LM, LW, LWB)
        return avgRating * 0.5 + (stats.goals / stats.games) * 0.25 + (stats.assists / stats.games) * 0.25;

      case "CAM": // Central Attacking Midfield
        return avgRating * 0.4 + (stats.goals / stats.games) * 0.2 + (stats.assists / stats.games) * 0.4;

      case "ST": // ST, CF
        return avgRating * 0.3 + (stats.goals / stats.games) * 0.6 + (stats.assists / stats.games) * 0.1;

      default:
        throw new Error(`Unknown poistion ${position}`);
    }
  }
}

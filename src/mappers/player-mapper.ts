import { PlayerDTO } from "@pro-clubs-manager/shared-dtos";
import { IPlayer, IPlayerStats } from "../models/player";
import { ITeam } from "../models/team";

export class PlayerMapper {
  static async mapToDto(player: IPlayer): Promise<PlayerDTO> {
    if (!player) {
      throw new Error("Player object is null or undefined");
    }

    const { team } = await player.populate<{ team: ITeam }>({ path: "team", select: "id name imgUrl" });

    const playerStats = this.calculatePlayerStats(player);
    return {
      id: player.id,
      name: player.name,
      imgUrl: player.imgUrl,
      age: player.age,
      position: player.position,
      playablePositions: player.playablePositions,
      stats: playerStats,
      team: team
        ? {
            id: team.id,
            name: team.name,
            imgUrl: team.imgUrl,
          }
        : undefined,
    };
  }

  static async mapToDtos(players: IPlayer[]): Promise<PlayerDTO[]> {
    if (!players) {
      throw new Error("Players object is null or undefined");
    }
    return await Promise.all(players.map((player) => this.mapToDto(player)));
  }

  private static calculatePlayerStats(player: IPlayer): IPlayerStats {
    const { seasonsHistory, currentSeason } = player;

    const stats: IPlayerStats = {
      games: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      playerOfTheMatch: 0,
      avgRating: 0,
    };

    if (!currentSeason) return stats;

    let totalRating = 0;
    let totalGames = 0;

    // Add current season stats
    if (currentSeason.stats.games > 0) {
      stats.games += currentSeason.stats.games;
      stats.goals += currentSeason.stats.goals;
      stats.assists += currentSeason.stats.assists;
      stats.cleanSheets += currentSeason.stats.cleanSheets;
      stats.playerOfTheMatch += currentSeason.stats.playerOfTheMatch;

      totalRating += currentSeason.stats.avgRating * currentSeason.stats.games;
      totalGames += currentSeason.stats.games;
    }

    // Add historical season stats
    seasonsHistory
      .filter((season) => season.league.equals(currentSeason.league) && season.seasonNumber === currentSeason.seasonNumber)
      .forEach((season) => {
        if (season.stats.games > 0) {
          stats.games += season.stats.games;
          stats.goals += season.stats.goals;
          stats.assists += season.stats.assists;
          stats.cleanSheets += season.stats.cleanSheets;
          stats.playerOfTheMatch += season.stats.playerOfTheMatch;

          totalRating += season.stats.avgRating * season.stats.games;
          totalGames += season.stats.games;
        }
      });

    // Calculate average rating
    if (totalGames > 0) {
      stats.avgRating = totalRating / totalGames;
    }

    return stats;
  }
}

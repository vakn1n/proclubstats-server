import { inject, injectable } from "tsyringe";
import { IGameRepository } from "../../interfaces/game";
import { ITeamRepository } from "../../interfaces/team";
import { ITeamStatsService } from "../../interfaces/wrapper-services/team-stats-service.interface";
import { IGame } from "../../models/game";
import logger from "../../config/logger";
import { Types, ClientSession } from "mongoose";
import { TeamWithPlayers } from "../../models/team";
import { AdvancedPlayersStats, TopScorer, TopAssister, TopAvgRating, AdvancedTeamStats } from "@pro-clubs-manager/shared-dtos";

@injectable()
export class TeamStatsService implements ITeamStatsService {
  private gameRepository: IGameRepository;
  private teamRepository: ITeamRepository;

  constructor(@inject("IGameRepository") gameRepository: IGameRepository, @inject("ITeamRepository") teamRepository: ITeamRepository) {
    this.gameRepository = gameRepository;
    this.teamRepository = teamRepository;
  }

  async getTeamPlayersStats(teamId: string | Types.ObjectId, limit?: number, session?: ClientSession): Promise<AdvancedPlayersStats> {
    logger.info(`TeamStatsService: getting team ${teamId} advanced players stats`);
    const team = await this.teamRepository.getTeamWithPlayers(teamId, session);
    let { topScorers, topAssisters, topAvgRating } = this.getTopPlayersStats(team);
    if (limit) {
      topScorers = topScorers.slice(0, limit);
      topAssisters = topAssisters.slice(0, limit);
      topAvgRating = topAvgRating.slice(0, limit);
    }
    return { topScorers, topAssisters, topAvgRating };
  }
  private getTopPlayersStats(team: TeamWithPlayers): { topScorers: TopScorer[]; topAssisters: TopAssister[]; topAvgRating: TopAvgRating[] } {
    const topScorers: TopScorer[] = [];
    const topAssisters: TopAssister[] = [];
    const topAvgRating: TopAvgRating[] = [];
    team.players.forEach((player) => {
      const playerData = {
        playerId: player.id,
        playerName: player.name,
        position: player.position,
        teamId: team.id,
        teamName: team.name,
        playerImgUrl: player.imgUrl,
        games: player.stats.games,
      };
      topScorers.push({
        ...playerData,
        goals: player.stats.goals,
        goalsPerGame: player.stats.games ? player.stats.goals / player.stats.games : 0,
      });
      topAssisters.push({
        assists: player.stats.assists,
        assistsPerGame: player.stats.games ? player.stats.assists / player.stats.games : 0,
        ...playerData,
      });
      topAvgRating.push({
        avgRating: player.stats.avgRating,
        ...playerData,
      });
    });

    topScorers.sort((playerA, playerB) => playerB.goals - playerA.goals);
    topAssisters.sort((playerA, playerB) => playerB.assists - playerA.assists);
    topAvgRating.sort((playerA, playerB) => playerB.avgRating - playerA.avgRating);

    return { topAssisters, topScorers, topAvgRating };
  }

  async getAdvancedTeamStats(teamId: string): Promise<AdvancedTeamStats> {
    logger.info(`TeamStatsService: getting team ${teamId} advanced stats`);

    const { longestWinStreak, longestLoseStreak, longestUnbeatenStreak } = await this.getAllTeamStreaks(teamId);
    return {
      longestUnbeatenStreak,
      longestWinStreak,
      longestLoseStreak,
    };
  }

  async getTeamLongestWinningStreak(teamId: string): Promise<number> {
    logger.info(`TeamStatsService: getting team ${teamId} longest winning streak for`);
    return await this.getTeamLongestStreak(teamId, this.isWinning);
  }

  async getTeamLongestUnbeatenStreak(teamId: string): Promise<number> {
    logger.info(`TeamStatsService: getting team ${teamId} longest unbeaten streak for`);

    return await this.getTeamLongestStreak(teamId, this.isUnbeaten);
  }
  async getTeamLongestLosingStreak(teamId: string): Promise<number> {
    logger.info(`TeamStatsService: getting team ${teamId} longest losing streak for`);

    return await this.getTeamLongestStreak(teamId, this.isLosing);
  }

  private async getAllTeamStreaks(teamId: string): Promise<{ longestWinStreak: number; longestLoseStreak: number; longestUnbeatenStreak: number }> {
    let teamGames = await this.gameRepository.getPlayedTeamGames(teamId);

    let currentWinStreak = 0;
    let currentLoseStreak = 0;
    let currentUnbeatenStreak = 0;

    let longestWinStreak = 0;
    let longestLoseStreak = 0;
    let longestUnbeatenStreak = 0;

    teamGames.forEach((game) => {
      if (this.isLosing(teamId, game)) {
        currentLoseStreak++;
        currentUnbeatenStreak = 0;
        currentWinStreak = 0;
      } else if (this.isWinning(teamId, game)) {
        currentLoseStreak = 0;
        currentUnbeatenStreak++;
        currentWinStreak++;
      } else {
        // draw
        currentLoseStreak = 0;
        currentWinStreak = 0;
        currentUnbeatenStreak++;
      }

      longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
      longestLoseStreak = Math.max(longestLoseStreak, currentLoseStreak);
      longestUnbeatenStreak = Math.max(longestUnbeatenStreak, currentUnbeatenStreak);
    });

    return {
      longestLoseStreak,
      longestWinStreak,
      longestUnbeatenStreak,
    };
  }

  private async getTeamLongestStreak(teamId: string, conditionFn: (teamId: string, game: IGame) => boolean): Promise<number> {
    let teamGames = await this.gameRepository.getPlayedTeamGames(teamId);

    let longestStreak = 0;
    let currentStreak = 0;

    for (const game of teamGames) {
      if (conditionFn(teamId, game)) {
        currentStreak++;
      } else {
        currentStreak = 0;
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    }

    return longestStreak;
  }

  private isLosing(teamId: string, game: IGame): boolean {
    return (
      (game.homeTeam.equals(teamId) && game.result!.homeTeamGoals < game.result!.awayTeamGoals) ||
      (game.awayTeam.equals(teamId) && game.result!.awayTeamGoals < game.result!.homeTeamGoals)
    );
  }
  private isWinning(teamId: string, game: IGame): boolean {
    return (
      (game.homeTeam.equals(teamId) && game.result!.homeTeamGoals > game.result!.awayTeamGoals) ||
      (game.awayTeam.equals(teamId) && game.result!.awayTeamGoals > game.result!.homeTeamGoals)
    );
  }

  private isUnbeaten(teamId: string, game: IGame): boolean {
    return (
      (game.homeTeam.equals(teamId) && game.result!.homeTeamGoals >= game.result!.awayTeamGoals) ||
      (game.awayTeam.equals(teamId) && game.result!.awayTeamGoals >= game.result!.homeTeamGoals)
    );
  }
}

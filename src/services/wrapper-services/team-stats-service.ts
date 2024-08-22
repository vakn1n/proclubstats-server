import { inject, injectable } from "tsyringe";
import { IGameRepository } from "../../interfaces/game";
import { ITeamRepository } from "../../interfaces/team";
import { ITeamStatsService } from "../../interfaces/wrapper-services/team-stats-service.interface";
import { IGame } from "../../models/game/game";
import logger from "../../config/logger";
import { Types, ClientSession } from "mongoose";
import { TeamWithPlayers } from "../../models/team";
import { AdvancedPlayersStats, TopScorer, TopAssister, TopAvgRating, AdvancedTeamStats } from "@pro-clubs-manager/shared-dtos";
import { BadRequestError } from "../../errors";

type AllTeamStreaks = {
  longestWinStreak: number;
  longestUnbeatenStreak: number;
  longestLoseStreak: number;
  longestWithoutScoringStreak: number;
};

@injectable()
export class TeamStatsService implements ITeamStatsService {
  private gameRepository: IGameRepository;
  private teamRepository: ITeamRepository;

  constructor(@inject("IGameRepository") gameRepository: IGameRepository, @inject("ITeamRepository") teamRepository: ITeamRepository) {
    this.gameRepository = gameRepository;
    this.teamRepository = teamRepository;
  }

  async getCurrentSeasonTeamPlayersStats(teamId: string | Types.ObjectId, limit?: number, session?: ClientSession): Promise<AdvancedPlayersStats> {
    logger.info(`TeamStatsService: getting team ${teamId} advanced players stats`);
    const team = await this.teamRepository.getTeamWithPlayers(teamId, session);

    if (!team.currentSeason) {
      throw new BadRequestError(`Team with id ${teamId} is not in an active season`);
    }

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
        games: player.currentSeason!.stats.games,
      };
      topScorers.push({
        ...playerData,
        goals: player.currentSeason!.stats.goals,
        goalsPerGame: player.currentSeason!.stats.games ? player.currentSeason!.stats.goals / player.currentSeason!.stats.games : 0,
      });
      topAssisters.push({
        assists: player.currentSeason!.stats.assists,
        assistsPerGame: player.currentSeason!.stats.games ? player.currentSeason!.stats.assists / player.currentSeason!.stats.games : 0,
        ...playerData,
      });
      topAvgRating.push({
        avgRating: player.currentSeason!.stats.avgRating,
        ...playerData,
      });
    });

    topScorers.sort((playerA, playerB) => playerB.goals - playerA.goals);
    topAssisters.sort((playerA, playerB) => playerB.assists - playerA.assists);
    topAvgRating.sort((playerA, playerB) => playerB.avgRating - playerA.avgRating);

    return { topAssisters, topScorers, topAvgRating };
  }

  async getCurrentSeasonAdvancedTeamStats(teamId: string): Promise<AdvancedTeamStats> {
    logger.info(`TeamStatsService: getting team ${teamId} advanced stats`);
    const team = await this.teamRepository.getTeamById(teamId);

    if (!team.currentSeason) {
      throw new BadRequestError(`Team with id ${teamId} is not currently in an active season`);
    }
    const { longestWinStreak, longestLoseStreak, longestUnbeatenStreak, longestWithoutScoringStreak } = await this.getAllTeamStreaks(
      teamId,
      team.currentSeason.league,
      team.currentSeason.seasonNumber
    );
    return {
      longestUnbeatenStreak,
      longestWinStreak,
      longestLoseStreak,
      longestWithoutScoringStreak,
    };
  }

  private async getAllTeamStreaks(teamId: string, leagueId: string | Types.ObjectId, seasonNumber: number): Promise<AllTeamStreaks> {
    let teamGames = await this.gameRepository.getPlayedLeagueSeasonTeamGames(teamId, leagueId, seasonNumber);

    let currentWinStreak = 0;
    let currentLoseStreak = 0;
    let currentUnbeatenStreak = 0;
    let currentWithoutScoringStreak = 0;

    let longestWinStreak = 0;
    let longestLoseStreak = 0;
    let longestUnbeatenStreak = 0;
    let longestWithoutScoringStreak = 0;

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

      if (this.didNotScore(teamId, game)) {
        currentWithoutScoringStreak++;
      } else {
        currentWithoutScoringStreak = 0;
      }

      longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
      longestLoseStreak = Math.max(longestLoseStreak, currentLoseStreak);
      longestUnbeatenStreak = Math.max(longestUnbeatenStreak, currentUnbeatenStreak);
      longestWithoutScoringStreak = Math.max(longestWithoutScoringStreak, currentWithoutScoringStreak);
    });

    return {
      longestLoseStreak,
      longestWinStreak,
      longestUnbeatenStreak,
      longestWithoutScoringStreak,
    };
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

  private didNotScore(teamId: string, game: IGame): boolean {
    return (game.homeTeam.equals(teamId) && game.result!.homeTeamGoals === 0) || (game.awayTeam.equals(teamId) && game.result!.awayTeamGoals === 0);
  }
}

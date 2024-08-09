import { AdvancedPlayersStats, TopAssister, TopAvgRating, TopScorer } from "@pro-clubs-manager/shared-dtos";
import { Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import logger from "../../config/logger";
import { IPlayerRepository } from "../../interfaces/player";
import { ITeamRepository } from "../../interfaces/team";
import { ILeagueStatsService } from "../../interfaces/wrapper-services/league-stats-service.interface";

@injectable()
export class LeagueStatsService implements ILeagueStatsService {
  private playerRepository: IPlayerRepository;
  private teamRepository: ITeamRepository;

  constructor(@inject("IPlayerRepository") playerRepository: IPlayerRepository, @inject("ITeamRepository") teamRepository: ITeamRepository) {
    this.playerRepository = playerRepository;
    this.teamRepository = teamRepository;
  }

  async getLeagueTopScorers(leagueId: string | Types.ObjectId, limit: number = 10): Promise<TopScorer[]> {
    logger.info(`LeagueStatsService: getting top scorers for league ${leagueId}`);
    const players = await this.playerRepository.getPlayersByLeague(leagueId);

    const topScorers: TopScorer[] = [];
    const seasonNumber = players[0]?.currentSeason!.seasonNumber;

    players.forEach((player) => {
      let totalGoals = 0;
      let totalGames = 0;

      // Check current season
      if (player.currentSeason?.league.equals(leagueId) && player.currentSeason.seasonNumber === seasonNumber) {
        totalGoals += player.currentSeason.stats.goals;
        totalGames += player.currentSeason.stats.games;
      }

      // Check season history
      player.seasonsHistory
        .filter((season) => season.league.equals(leagueId) && season.seasonNumber === seasonNumber)
        .forEach((season) => {
          totalGoals += season.stats.goals;
          totalGames += season.stats.games;
        });

      if (totalGames > 0) {
        topScorers.push({
          playerId: player.id,
          playerName: player.name,
          position: player.position,
          teamId: player.currentSeason!.team.toString(),
          teamName: "",
          playerImgUrl: player.imgUrl,
          goals: totalGoals,
          goalsPerGame: totalGoals / totalGames,
          games: totalGames,
        });
      }
    });
    topScorers.sort((playerA, playerB) => playerB.goals - playerA.goals);

    if (limit) {
      topScorers.length = limit;
    }

    await this.populateTeamNamesForTopPlayers(topScorers);

    return topScorers;
  }

  async getLeagueTopAssisters(leagueId: string | Types.ObjectId, limit: number = 10): Promise<TopAssister[]> {
    logger.info(`LeagueStatsService: getting top assisters for league ${leagueId}`);
    const players = await this.playerRepository.getPlayersByLeague(leagueId);

    const topAssisters: TopAssister[] = [];
    const seasonNumber = players[0]?.currentSeason!.seasonNumber;

    players.forEach((player) => {
      let totalAssists = 0;
      let totalGames = 0;

      // Check current season
      if (player.currentSeason?.league.equals(leagueId) && player.currentSeason.seasonNumber === seasonNumber) {
        totalAssists += player.currentSeason.stats.assists;
        totalGames += player.currentSeason.stats.games;
      }

      // Check season history
      player.seasonsHistory
        .filter((season) => season.league.equals(leagueId) && season.seasonNumber === seasonNumber)
        .forEach((season) => {
          totalAssists += season.stats.assists;
          totalGames += season.stats.games;
        });

      if (totalGames > 0) {
        topAssisters.push({
          playerId: player.id,
          playerName: player.name,
          position: player.position,
          teamId: player.currentSeason!.team.toString(),
          teamName: "",
          playerImgUrl: player.imgUrl,
          assists: totalAssists,
          assistsPerGame: totalAssists / totalGames,
          games: totalGames,
        });
      }
    });
    topAssisters.sort((playerA, playerB) => playerB.assists - playerA.assists);

    if (limit) {
      topAssisters.length = limit;
    }

    await this.populateTeamNamesForTopPlayers(topAssisters);

    return topAssisters;
  }

  async getLeagueTopAvgRatingPlayers(leagueId: string | Types.ObjectId, limit: number = 10): Promise<TopAvgRating[]> {
    logger.info(`LeagueStatsService: getting top average rating for league ${leagueId}`);
    const players = await this.playerRepository.getPlayersByLeague(leagueId);

    const topAvgRating: TopAvgRating[] = [];
    const seasonNumber = players[0]?.currentSeason!.seasonNumber;

    players.forEach((player) => {
      let totalRating = 0;
      let totalGames = 0;

      // Check current season
      if (player.currentSeason?.league.equals(leagueId) && player.currentSeason.seasonNumber === seasonNumber) {
        totalRating += player.currentSeason.stats.avgRating * player.currentSeason.stats.games;
        totalGames += player.currentSeason.stats.games;
      }

      // Check season history
      player.seasonsHistory
        .filter((season) => season.league.equals(leagueId) && season.seasonNumber === seasonNumber)
        .forEach((season) => {
          totalRating += season.stats.avgRating * season.stats.games;
          totalGames += season.stats.games;
        });

      if (totalGames > 0) {
        topAvgRating.push({
          playerId: player.id,
          playerName: player.name,
          position: player.position,
          teamId: player.currentSeason!.team.toString(),
          teamName: "",
          playerImgUrl: player.imgUrl,
          avgRating: totalGames > 0 ? totalRating / totalGames : 0,
          games: totalGames,
        });
      }
    });
    topAvgRating.sort((playerA, playerB) => playerB.avgRating - playerA.avgRating);

    if (limit) {
      topAvgRating.length = limit;
    }

    await this.populateTeamNamesForTopPlayers(topAvgRating);

    return topAvgRating;
  }

  async getAdvancedLeaguePlayersStats(leagueId: string | Types.ObjectId, limit: number = 10): Promise<AdvancedPlayersStats> {
    logger.info(`LeagueStatsService: getting advanced stats for league ${leagueId}`);
    const players = await this.playerRepository.getPlayersByLeague(leagueId);

    const topScorers: TopScorer[] = [];
    const topAssisters: TopAssister[] = [];
    const topAvgRating: TopAvgRating[] = [];
    const seasonNumber = players[0]?.currentSeason!.seasonNumber;

    players.forEach((player) => {
      let totalGoals = 0;
      let totalAssists = 0;
      let totalRating = 0;
      let totalGames = 0;

      // Check current season
      if (player.currentSeason?.league.equals(leagueId) && player.currentSeason.seasonNumber === seasonNumber) {
        totalGoals += player.currentSeason.stats.goals;
        totalAssists += player.currentSeason.stats.assists;
        totalRating += player.currentSeason.stats.avgRating * player.currentSeason.stats.games;
        totalGames += player.currentSeason.stats.games;
      }

      // Check season history
      player.seasonsHistory
        .filter((season) => season.league.equals(leagueId) && season.seasonNumber === seasonNumber)
        .forEach((season) => {
          totalGoals += season.stats.goals;
          totalAssists += season.stats.assists;
          totalRating += season.stats.avgRating * season.stats.games;
          totalGames += season.stats.games;
        });

      if (totalGames > 0) {
        topScorers.push({
          playerId: player.id,
          playerName: player.name,
          position: player.position,
          teamId: player.currentSeason!.team.toString(),
          teamName: "",
          playerImgUrl: player.imgUrl,
          goals: totalGoals,
          goalsPerGame: totalGoals / totalGames,
          games: totalGames,
        });

        topAssisters.push({
          playerId: player.id,
          playerName: player.name,
          position: player.position,
          teamId: player.currentSeason!.team.toString(),
          teamName: "",
          playerImgUrl: player.imgUrl,
          assists: totalAssists,
          assistsPerGame: totalAssists / totalGames,
          games: totalGames,
        });

        topAvgRating.push({
          playerId: player.id,
          playerName: player.name,
          position: player.position,
          teamId: player.currentSeason!.team.toString(),
          teamName: "",
          playerImgUrl: player.imgUrl,
          avgRating: totalGames > 0 ? totalRating / totalGames : 0,
          games: totalGames,
        });
      }
    });

    topScorers.sort((playerA, playerB) => playerB.goals - playerA.goals);
    topAssisters.sort((playerA, playerB) => playerB.assists - playerA.assists);
    topAvgRating.sort((playerA, playerB) => playerB.avgRating - playerA.avgRating);

    if (limit) {
      topScorers.length = limit;
      topAssisters.length = limit;
      topAvgRating.length = limit;
    }

    await Promise.all([
      this.populateTeamNamesForTopPlayers(topScorers),
      this.populateTeamNamesForTopPlayers(topAssisters),
      this.populateTeamNamesForTopPlayers(topAvgRating),
    ]);

    return { topScorers, topAssisters, topAvgRating };
  }

  async getAdvancedLeagueTeamStats(leagueId: string | Types.ObjectId): Promise<any> {
    logger.info(`LeagueStatsService: getting advanced team stats for league with id ${leagueId}`);
  }

  private async populateTeamNamesForTopPlayers(topPlayers: { teamId: string; teamName: string }[]): Promise<void> {
    const teamsIds = topPlayers.map((player) => player.teamId).filter((id) => id);
    const teams = await this.teamRepository.getTeamsByIds(teamsIds);

    const teamMap = new Map(teams.map((team) => [team.id, team.name]));

    topPlayers.forEach((topPlayer) => {
      if (topPlayer.teamId) {
        topPlayer.teamName = teamMap.get(topPlayer.teamId) || "";
      }
    });
  }
}

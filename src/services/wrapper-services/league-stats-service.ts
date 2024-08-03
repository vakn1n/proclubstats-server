import { AdvancedPlayersStats, AdvancedTeamStats, TopAssister, TopAvgRating, TopScorer } from "@pro-clubs-manager/shared-dtos";
import { Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import logger from "../../config/logger";
import { IPlayerRepository } from "../../interfaces/player";
import { ITeamRepository } from "../../interfaces/team";
import { ILeagueStatsService } from "../../interfaces/wrapper-services/league-stats-service.interface";
import { ILeagueRepository } from "../../interfaces/league";

@injectable()
export class LeagueStatsService implements ILeagueStatsService {
  private playerRepository: IPlayerRepository;
  private teamRepository: ITeamRepository;
  private leagueRepository: ITeamRepository;

  constructor(
    @inject("IPlayerRepository") playerRepository: IPlayerRepository,
    @inject("ITeamRepository") teamRepository: ITeamRepository,
    @inject("ILeagueRepository") leagueRepository: ILeagueRepository
  ) {
    this.playerRepository = playerRepository;
    this.teamRepository = teamRepository;
    this.leagueRepository = teamRepository;
  }
  async getAdvancedLeaguePlayersStats(leagueId: string | Types.ObjectId, limit?: number): Promise<AdvancedPlayersStats> {
    throw new Error("Method not implemented.");
  }

  async getLeagueTopScorers(leagueId: string | Types.ObjectId, limit: number = 10): Promise<TopScorer[]> {
    logger.info(`LeagueStatsService: getting top scorers for league ${leagueId}`);
    // const players = await this.playerRepository.getPlayersByLeague(leagueId);
    let topScorers: TopScorer[] = [];

    // players.forEach((player) => {
    //   if (player.currentSeason && player.currentSeason.stats) {
    //     topScorers.push({
    //       playerId: player.id,
    //       playerName: player.name,
    //       position: player.position,
    //       teamId: player.team.id,
    //       teamName: player.team.name,
    //       playerImgUrl: player.imgUrl,
    //       games: player.currentSeason.stats.games,
    //       goals: player.currentSeason.stats.goals,
    //       goalsPerGame: player.currentSeason.stats.games ? player.currentSeason.stats.goals / player.currentSeason.stats.games : 0,
    //     });
    //   }
    // });

    topScorers.sort((a, b) => b.goals - a.goals);
    return topScorers.slice(0, limit);
  }

  async getLeagueTopAssisters(leagueId: string | Types.ObjectId, limit: number = 10): Promise<TopAssister[]> {
    logger.info(`LeagueStatsService: getting top assisters for league ${leagueId}`);
    // const players = await this.playerRepository.getPlayersByLeague(leagueId);
    let topAssisters: TopAssister[] = [];

    // players.forEach((player) => {
    //   if (player.currentSeason && player.currentSeason.stats) {
    //     topAssisters.push({
    //       playerId: player.id,
    //       playerName: player.name,
    //       position: player.position,
    //       teamId: player.team.id,
    //       teamName: player.team.name,
    //       playerImgUrl: player.imgUrl,
    //       games: player.currentSeason.stats.games,
    //       assists: player.currentSeason.stats.assists,
    //       assistsPerGame: player.currentSeason.stats.games ? player.currentSeason.stats.assists / player.currentSeason.stats.games : 0,
    //     });
    //   }
    // });

    topAssisters.sort((a, b) => b.assists - a.assists);
    return topAssisters.slice(0, limit);
  }

  async getLeagueTopAvgRatingPlayers(leagueId: string | Types.ObjectId, limit: number = 10): Promise<TopAvgRating[]> {
    logger.info(`LeagueStatsService: getting top average rating players for league ${leagueId}`);
    // const players = await this.playerRepository.getPlayersByLeague(leagueId);
    let topAvgRating: TopAvgRating[] = [];

    // players.forEach((player) => {
    //   if (player.currentSeason && player.currentSeason.stats) {
    //     topAvgRating.push({
    //       playerId: player.id,
    //       playerName: player.name,
    //       position: player.position,
    //       teamId: player.team.id,
    //       teamName: player.team.name,
    //       playerImgUrl: player.imgUrl,
    //       games: player.currentSeason.stats.games,
    //       avgRating: player.currentSeason.stats.avgRating,
    //     });
    //   }
    // });

    topAvgRating.sort((a, b) => b.avgRating - a.avgRating);
    return topAvgRating.slice(0, limit);
  }

  async getAdvancedLeagueTeamStats(leagueId: string | Types.ObjectId): Promise<any> {
    logger.info(`LeagueStatsService: getting advanced team stats for league ${leagueId}`);
    // // const teams = await this.teamRepository.getTeamsByLeague(leagueId);
    // let mostGoals = 0;
    // let mostCleanSheets = 0;
    // let teamWithMostGoals: any = null;
    // let teamWithMostCleanSheets: any = null;

    // // for (const team of teams) {
    // //   const teamStats = await this.teamRepository.getTeamSeasonStats(team.id, seasonNumber);
    // //   if (teamStats.goals > mostGoals) {
    // //     mostGoals = teamStats.goals;
    // //     teamWithMostGoals = team;
    // //   }
    // //   if (teamStats.cleanSheets > mostCleanSheets) {
    // //     mostCleanSheets = teamStats.cleanSheets;
    // //     teamWithMostCleanSheets = team;
    // //   }
    // // }

    // return {
    //   teamWithMostGoals: {
    //     teamId: teamWithMostGoals.id,
    //     teamName: teamWithMostGoals.name,
    //     goals: mostGoals,
    //   },
    //   teamWithMostCleanSheets: {
    //     teamId: teamWithMostCleanSheets.id,
    //     teamName: teamWithMostCleanSheets.name,
    //     cleanSheets: mostCleanSheets,
    //   },
    // };
  }
}

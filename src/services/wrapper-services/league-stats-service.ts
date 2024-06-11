import { TopScorer, AdvancedPlayersStats } from "../../types-changeToNPM/shared-DTOs";
import { ILeagueStatsService } from "../../interfaces/wrapper-services/league-stats-service.interface";

export class LeagueStatsService implements ILeagueStatsService {
  async getTopScorers(leagueId: string, limit: number = 20): Promise<TopScorer[]> {
    throw new Error("Method not implemented.");
  }
  async getTopAssisters(leagueId: string, limit: number = 20): Promise<TopScorer[]> {
    throw new Error("Method not implemented.");
  }
  async getAdvancedPlayersStats(leagueId: string, limit: number = 20): Promise<AdvancedPlayersStats[]> {
    throw new Error("Method not implemented.");
  }
  async getTopAvgRating(leagueId: string, limit: number = 20): Promise<TopScorer[]> {
    throw new Error("Method not implemented.");
  }
}

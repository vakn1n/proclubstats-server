import { AdvancedPlayersStats, TopScorer } from "../../types-changeToNPM/shared-DTOs";

export interface ILeagueStatsService {
  getTopScorers(leagueId: string, limit?: number): Promise<TopScorer[]>;
  getTopAssisters(leagueId: string, limit?: number): Promise<TopScorer[]>;

  getAdvancedPlayersStats(leagueId: string, limit?: number): Promise<AdvancedPlayersStats[]>;
  getTopAvgRating(leagueId: string, limit?: number): Promise<TopScorer[]>;
}

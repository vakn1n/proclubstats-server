import { AdvancedPlayersStats, TopAssister, TopAvgRating, TopScorer } from "@pro-clubs-manager/shared-dtos";
import { Types } from "mongoose";

export interface ILeagueStatsService {
  getLeagueTopScorers(leagueId: string | Types.ObjectId, limit?: number): Promise<TopScorer[]>;
  getLeagueTopAssisters(leagueId: string | Types.ObjectId, limit?: number): Promise<TopAssister[]>;
  getLeagueTopAvgRatingPlayers(leagueId: string | Types.ObjectId, limit?: number): Promise<TopAvgRating[]>;
  getAdvancedLeaguePlayersStats(leagueId: string | Types.ObjectId, limit?: number): Promise<AdvancedPlayersStats>;
  getAdvancedLeagueTeamStats(leagueId: string | Types.ObjectId): Promise<any>;
}

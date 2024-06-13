import { AdvancedTeamStats, AdvancedPlayersStats } from "@pro-clubs-manager/shared-dtos";
import { ClientSession, Types } from "mongoose";

export interface ITeamStatsService {
  getTeamLongestWinningStreak(teamId: string | Types.ObjectId, session?: ClientSession): Promise<number>;
  getTeamLongestUnbeatenStreak(teamId: string | Types.ObjectId, session?: ClientSession): Promise<number>;
  getTeamLongestLosingStreak(teamId: string | Types.ObjectId, session?: ClientSession): Promise<number>;

  getAdvancedTeamStats(teamId: string | Types.ObjectId, session?: ClientSession): Promise<AdvancedTeamStats>;
  getTeamPlayersStats(teamId: string | Types.ObjectId, limit?: number, session?: ClientSession): Promise<AdvancedPlayersStats>;
}

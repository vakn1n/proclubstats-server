import { ClientSession, Types } from "mongoose";
import { AdvancedTeamStats } from "../../../types-changeToNPM/shared-DTOs";

export interface ITeamStatsService {
  getTeamLongestWinningStreak(teamId: string | Types.ObjectId, session?: ClientSession): Promise<number>;
  getTeamLongestUnbeatenStreak(teamId: string | Types.ObjectId, session?: ClientSession): Promise<number>;
  getTeamLongestLosingStreak(teamId: string | Types.ObjectId, session?: ClientSession): Promise<number>;

  getAdvancedTeamStats(teamId: string | Types.ObjectId, session?: ClientSession): Promise<AdvancedTeamStats>;
}

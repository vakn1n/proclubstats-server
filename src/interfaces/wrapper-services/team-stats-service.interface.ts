import { AdvancedTeamStats, AdvancedPlayersStats } from "@pro-clubs-manager/shared-dtos";
import { ClientSession, Types } from "mongoose";

export interface ITeamStatsService {
  getCurrentSeasonAdvancedTeamStats(teamId: string, session?: ClientSession): Promise<AdvancedTeamStats>;
  getCurrentSeasonTeamPlayersStats(teamId: string, limit?: number, session?: ClientSession): Promise<AdvancedPlayersStats>;
}

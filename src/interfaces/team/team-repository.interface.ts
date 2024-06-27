import { ClientSession, Types } from "mongoose";
import { ITeam, TeamWithPlayers } from "../../models/team";

export interface ITeamRepository {
  isTeamNameExists(newName: string): Promise<boolean>;
  getTeamById(id: string | Types.ObjectId, session?: ClientSession): Promise<ITeam>;

  getTeamWithPlayers(id: string | Types.ObjectId, session?: ClientSession): Promise<TeamWithPlayers>;

  getTeams(): Promise<ITeam[]>;
  getTeamsByLeagueId(leagueId: string | Types.ObjectId, session?: ClientSession): Promise<ITeam[]>;

  deleteTeamById(id: string | Types.ObjectId, session?: ClientSession): Promise<void>;

  removePlayerFromTeam(teamId: string | Types.ObjectId, playerId: string | Types.ObjectId, session?: ClientSession): Promise<void>;

  createTeam(name: string, session?: ClientSession): Promise<ITeam>;

  startNewLeagueSeason(leagueId: Types.ObjectId, seasonNumber: number, session?: ClientSession): Promise<void>;

  renameTeam(teamId: string, newName: string, session?: ClientSession): Promise<void>;
  setTeamLeague(teamId: Types.ObjectId, leagueId: Types.ObjectId | null, session?: ClientSession): Promise<void>;
}

import { ClientSession, Types } from "mongoose";
import { ITeam } from "../../models/team";
import { TeamDTO, PlayerDTO, LeagueTableRow } from "@pro-clubs-manager/shared-dtos";

export interface ITeamService {
  getTeamById(teamId: string): Promise<TeamDTO>;
  getAllTeams(): Promise<TeamDTO[]>;

  getTeamPlayers(teamId: string): Promise<PlayerDTO[]>;

  getTeamsStatsByLeague(leagueId: string | Types.ObjectId, session?: ClientSession): Promise<LeagueTableRow[]>;

  createTeam(name: string): Promise<TeamDTO>;

  // deleteTeam(team: ITeam, session?: ClientSession): Promise<void>;

  removePlayerFromTeam(teamId: Types.ObjectId, playerId: Types.ObjectId, session: ClientSession): Promise<void>;

  renameTeam(teamId: string, name: any): Promise<void>;
  setTeamImage(teamId: string, imageFile: Express.Multer.File): Promise<string>;
  setTeamCaptain(teamId: string, captainId: string): Promise<void>;

  revertTeamGameStats(teamId: Types.ObjectId, goalsScored: number, goalsConceded: number, session: ClientSession): Promise<void>;
  updateTeamGameStats(teamId: Types.ObjectId, goalsScored: number, goalsConceded: number, session: ClientSession): Promise<void>;
}

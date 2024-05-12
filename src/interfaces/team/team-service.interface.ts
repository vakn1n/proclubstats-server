import { ClientSession, Types } from "mongoose";
import { PlayerDTO, TeamDTO } from "../../../types-changeToNPM/shared-DTOs";
import { ITeam } from "../../models/team";

export default interface ITeamService {
  getTeamById(teamId: string): Promise<TeamDTO>;
  getAllTeams(): Promise<TeamDTO[]>;

  getTeamPlayers(teamId: string): Promise<PlayerDTO[]>;

  createTeam(name: string): Promise<TeamDTO>;

  deleteTeam(team: ITeam, session?: ClientSession): Promise<void>;

  removePlayerFromTeam(teamId: Types.ObjectId, playerId: Types.ObjectId, session: ClientSession): Promise<void>;

  setTeamImage(teamId: string, imageFile: Express.Multer.File): Promise<string>;
  setTeamCaptain(teamId: string, captainId: string): Promise<void>;

  revertTeamGameStats(teamId: Types.ObjectId, goalsScored: number, goalsConceded: number, session: ClientSession): Promise<void>;
  updateTeamGameStats(teamId: Types.ObjectId, goalsScored: number, goalsConceded: number, session: ClientSession): Promise<void>;
}

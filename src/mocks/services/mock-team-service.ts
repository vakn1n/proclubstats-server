import { ClientSession, Types } from "mongoose";
import { TeamDTO, PlayerDTO, LeagueTableRow } from "../../../types-changeToNPM/shared-DTOs";
import { ITeamService } from "../../interfaces/team";
import { ITeam } from "../../models/team";

export class MockTeamService implements ITeamService {
  renameTeam(teamId: string, name: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getTeamById(teamId: string): Promise<TeamDTO> {
    throw new Error("Method not implemented.");
  }
  getAllTeams(): Promise<TeamDTO[]> {
    throw new Error("Method not implemented.");
  }
  getTeamPlayers(teamId: string): Promise<PlayerDTO[]> {
    throw new Error("Method not implemented.");
  }
  getTeamsStatsByLeague(leagueId: string | Types.ObjectId, session?: ClientSession | undefined): Promise<LeagueTableRow[]> {
    throw new Error("Method not implemented.");
  }
  createTeam(name: string): Promise<TeamDTO> {
    throw new Error("Method not implemented.");
  }
  deleteTeam(team: ITeam, session?: ClientSession | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }
  removePlayerFromTeam(teamId: Types.ObjectId, playerId: Types.ObjectId, session: ClientSession): Promise<void> {
    throw new Error("Method not implemented.");
  }
  setTeamImage(teamId: string, imageFile: Express.Multer.File): Promise<string> {
    throw new Error("Method not implemented.");
  }
  setTeamCaptain(teamId: string, captainId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  revertTeamGameStats(teamId: Types.ObjectId, goalsScored: number, goalsConceded: number, session: ClientSession): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateTeamGameStats(teamId: Types.ObjectId, goalsScored: number, goalsConceded: number, session: ClientSession): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

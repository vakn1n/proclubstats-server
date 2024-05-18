import { ClientSession, Types } from "mongoose";
import { ITeam, TeamWithPlayers } from "../../models/team";
import { IPlayer } from "../../models/player";

export default interface ITeamRepository {
  getTeamById(id: string | Types.ObjectId, session?: ClientSession): Promise<ITeam>;
  getTeamWithPlayers(id: string | Types.ObjectId, session?: ClientSession): Promise<TeamWithPlayers>;
  getTeams(): Promise<ITeam[]>;
  getTeamsByLeagueId(leagueId: string | Types.ObjectId, session?: ClientSession): Promise<ITeam[]>;

  deleteTeamById(id: string | Types.ObjectId, session?: ClientSession): Promise<void>;

  createTeam(name: string, session?: ClientSession): Promise<ITeam>;
}

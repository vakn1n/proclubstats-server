import mongoose, { ClientSession, Types } from "mongoose";
import { ITeamRepository } from "../../interfaces/team";
import { ITeam, ITeamStats, TeamWithPlayers } from "../../models/team";
import { IPlayer } from "../../models/player";

export class MockTeamRepository implements ITeamRepository {
  isTeamNameExists(newName: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  renameTeam(teamId: string, newName: string, session?: mongoose.mongo.ClientSession | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getTeamById(id: string | mongoose.Types.ObjectId, session?: ClientSession): Promise<ITeam> {
    throw new Error("Method not implemented.");
  }
  getTeamWithPlayers(teamId: string | mongoose.Types.ObjectId, session?: ClientSession): Promise<TeamWithPlayers> {
    throw new Error("Method not implemented.");
  }
  getTeams(): Promise<ITeam[]> {
    throw new Error("Method not implemented.");
  }
  getTeamsByLeagueId(leagueId: string | mongoose.Types.ObjectId, session?: ClientSession): Promise<ITeam[]> {
    throw new Error("Method not implemented.");
  }
  deleteTeamById(id: string | mongoose.Types.ObjectId, session?: ClientSession): Promise<void> {
    throw new Error("Method not implemented.");
  }
  removePlayerFromTeam(teamId: string | mongoose.Types.ObjectId, playerId: string | mongoose.Types.ObjectId, session?: ClientSession): Promise<void> {
    throw new Error("Method not implemented.");
  }
  createTeam(name: string, session?: ClientSession): Promise<ITeam> {
    return Promise.resolve({
      id: new Types.ObjectId().toString(),
      name,
      league: new Types.ObjectId(),
      players: [],
      captain: new Types.ObjectId(),
      stats: {} as ITeamStats, // Adjust this if there are required fields
    } as unknown as ITeam);
  }
  setTeamLeague(teamId: mongoose.Types.ObjectId, leagueId: mongoose.Types.ObjectId | null, session?: ClientSession): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

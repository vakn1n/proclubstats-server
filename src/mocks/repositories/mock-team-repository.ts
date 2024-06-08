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
    const mockTeam = {
      id: teamId,
      name: "Team A",
      league: new Types.ObjectId(),
      players: [
        {
          id: new Types.ObjectId().toString(),
          name: "Player 1",
          position: "Forward",
          stats: { games: 10, goals: 8, assists: 5, avgRating: 7.5 },
        },
        {
          id: new Types.ObjectId().toString(),
          name: "Player 2",
          position: "Midfielder",
          stats: { games: 10, goals: 4, assists: 6, avgRating: 7.0 },
        },
        {
          id: new Types.ObjectId().toString(),
          name: "Player 3",
          position: "Defender",
          stats: { games: 10, goals: 2, assists: 3, avgRating: 6.5 },
        },
      ] as IPlayer[],
      captain: new Types.ObjectId(),
      stats: {} as ITeamStats, // Adjust this if there are required fields
    } as TeamWithPlayers;

    return Promise.resolve(mockTeam);
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
    throw new Error("Method not implemented.");
  }
  setTeamLeague(teamId: mongoose.Types.ObjectId, leagueId: mongoose.Types.ObjectId | null, session?: ClientSession): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

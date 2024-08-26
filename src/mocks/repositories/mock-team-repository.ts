import { ClientSession, Types } from "mongoose";
import { ITeamRepository } from "../../interfaces/team";
import { ITeam, TeamWithPlayers } from "../../models/team";

export class MockTeamRepository implements ITeamRepository {
  getTeamsByIds = jest.fn<Promise<ITeam[]>, [(string | Types.ObjectId)[]]>();
  isTeamNameExists = jest.fn<Promise<boolean>, [string]>();
  renameTeam = jest.fn<Promise<void>, [string, string, ClientSession?]>();
  getTeamById = jest.fn<Promise<ITeam>, [string | Types.ObjectId, ClientSession?]>();
  getTeamWithPlayers = jest.fn<Promise<TeamWithPlayers>, [string | Types.ObjectId, ClientSession?]>();
  getTeams = jest.fn<Promise<ITeam[]>, []>();
  getTeamsByLeagueId = jest.fn<Promise<ITeam[]>, [string | Types.ObjectId, ClientSession?]>();
  deleteTeamById = jest.fn<Promise<void>, [string | Types.ObjectId, ClientSession?]>();
  removePlayerFromTeam = jest.fn<Promise<void>, [string | Types.ObjectId, string | Types.ObjectId, ClientSession?]>();
  createTeam = jest.fn<Promise<ITeam>, [string, ClientSession?]>();
  setTeamLeague = jest.fn<Promise<void>, [Types.ObjectId, Types.ObjectId | null, ClientSession?]>();
}

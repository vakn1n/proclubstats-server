import { ClientSession, Types } from "mongoose";
import { ITeamService } from "../../interfaces/team";
import { ITeam } from "../../models/team";
import { TeamDTO, PlayerDTO, LeagueTableRow } from "@pro-clubs-manager/shared-dtos";

export class MockTeamService implements ITeamService {
  getTeamEntityById = jest.fn<Promise<ITeam>, [string]>();
  startNewLeagueSeason = jest.fn<Promise<void>, [Types.ObjectId, number, ClientSession]>();
  renameTeam = jest.fn<Promise<void>, [string, any]>();
  getTeamById = jest.fn<Promise<TeamDTO>, [string]>();
  getAllTeams = jest.fn<Promise<TeamDTO[]>, []>();
  getTeamPlayers = jest.fn<Promise<PlayerDTO[]>, [string]>();
  getTeamsStatsByLeague = jest.fn<Promise<LeagueTableRow[]>, [string | Types.ObjectId, ClientSession?]>();
  createTeam = jest.fn<Promise<TeamDTO>, [string]>();
  deleteTeam = jest.fn<Promise<void>, [ITeam, ClientSession?]>();
  removePlayerFromTeam = jest.fn<Promise<void>, [Types.ObjectId, Types.ObjectId, ClientSession]>();
  setTeamImage = jest.fn<Promise<string>, [string, Express.Multer.File]>();
  setTeamCaptain = jest.fn<Promise<void>, [string, string]>();
  revertTeamGameStats = jest.fn<Promise<void>, [Types.ObjectId, number, number, ClientSession]>();
  updateTeamGameStats = jest.fn<Promise<void>, [Types.ObjectId, number, number, ClientSession]>();
}

import mongoose, { ClientSession, Types } from "mongoose";
import { AddTeamRequest, PlayerDTO, TeamDTO } from "../../types-changeToNPM/shared-DTOs";
import BadRequestError from "../errors/bad-request-error";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";
import { PlayerMapper } from "../mappers/player-mapper";
import { TeamMapper } from "../mappers/team-mapper";
import { IFixtureTeamStats } from "../models/fixture";
import Player, { IPlayer } from "../models/player";
import Team, { ITeam } from "../models/team";
import LeagueService from "./league-service";
import { transactionService } from "./transaction-service";

class TeamService {
  private static instance: TeamService;

  private constructor() {}

  static getInstance(): TeamService {
    if (!TeamService.instance) {
      TeamService.instance = new TeamService();
    }
    return TeamService.instance;
  }

  async getTeamPlayers(teamId: string): Promise<PlayerDTO[]> {
    logger.info(`TeamService: getting players for team ${teamId}`);

    const team = await Team.findById(teamId).populate<{ players: IPlayer[] }>("players");

    if (!team) {
      throw new NotFoundError(`Team ${teamId} not found`);
    }

    return await PlayerMapper.mapToDtos(team.players);
  }

  async createAndAddTeamToLeague(teamData: AddTeamRequest): Promise<ITeam> {
    const { name, leagueId, imgUrl } = teamData;

    logger.info(`TeamService: Creating team with name ${name} for league with id ${leagueId}`);

    return await transactionService.withTransaction(async (session) => {
      const leagueObjectId = new mongoose.Types.ObjectId(leagueId);

      const existingTeam = await Team.findOne({ name, league: leagueObjectId });
      if (existingTeam) {
        throw new Error(`Team with name ${name} already exists in league with id ${leagueId}`);
      }

      const newTeam = await Team.create({ name, league: leagueId, imgUrl });

      await LeagueService.getInstance().addTeamToLeague(newTeam._id, leagueId, session);
      return newTeam;
    });
  }

  async getTeamById(id: string): Promise<TeamDTO> {
    logger.info(`TeamService: getting team ${id}`);

    const team = await Team.findById(id);
    if (!team) {
      throw new NotFoundError(`Team with id of: ${id} not found`);
    }
    return await TeamMapper.mapToDto(team);
  }

  async deleteTeam(id: string): Promise<void> {
    logger.info(`deleting team with id ${id}`);
    const res = await Team.findByIdAndDelete(id);
    if (!res) {
      throw new NotFoundError(`Team with id ${id} not found.`);
    }
  }

  async addPlayerToTeam(playerId: Types.ObjectId, teamId: string, session: ClientSession): Promise<void> {
    logger.info(`Team Service: Adding player ${playerId} to team ${teamId}`);
    const team = await Team.findById(teamId).session(session);

    if (!team) {
      throw new Error(`Team with id ${teamId} not found`);
    }
    team.players.push(playerId);
    await team.save({ session });
  }

  async addFixtureStats(
    teamId: Types.ObjectId,
    homeTeamStats: IFixtureTeamStats,
    session: ClientSession
  ): Promise<void> {
    logger.info(`Team Service: Adding fixture stats for team with id ${teamId}`);

    const team = await Team.findById({ id: teamId }, { session });

    if (!team) {
      throw new NotFoundError(`Team with id ${teamId} not found `);
    }

    // TODO: finish this
  }

  async setTeamCaptain(teamId: string, captainId: string): Promise<void> {
    logger.info(`Team Service: Setting team captain to captain with id ${captainId} for team with id ${teamId}`);

    const team = await Team.findById(teamId);

    if (!team) {
      throw new NotFoundError(`Team with id ${teamId} not found `);
    }

    const captain = await Player.findById(captainId);

    if (!captain) {
      throw new NotFoundError(`Captain with id ${captainId} not found `);
    }

    if (captain.team._id.toString() != team.id) {
      throw new BadRequestError(`Captain with id ${captainId} does not belong to team with id ${team.id}`);
    }

    team.captain = new Types.ObjectId(captainId);
    await team.save();
  }
}

export default TeamService;

import mongoose, { ClientSession, Types } from "mongoose";
import { AddTeamRequest, IGameTeamStats, PlayerDTO, TeamDTO } from "../../types-changeToNPM/shared-DTOs";
import BadRequestError from "../errors/bad-request-error";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";
import { PlayerMapper } from "../mappers/player-mapper";
import { TeamMapper } from "../mappers/team-mapper";
import Player, { IPlayer } from "../models/player";
import Team, { ITeam } from "../models/team";
import LeagueService from "./league-service";
import { transactionService } from "./transaction-service";
import ImageService from "./images-service";

class TeamService {
  private static instance: TeamService;
  private imageService: ImageService;
  private leagueService: LeagueService;

  private constructor() {
    this.imageService = ImageService.getInstance();
    this.leagueService = LeagueService.getInstance();
  }

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
    const { name, leagueId } = teamData;

    logger.info(`TeamService: Creating team with name ${name} for league with id ${leagueId}`);

    return await transactionService.withTransaction(async (session) => {
      const leagueObjectId = new mongoose.Types.ObjectId(leagueId);

      const existingTeam = await Team.findOne({ name, league: leagueObjectId });
      if (existingTeam) {
        throw new Error(`Team with name ${name} already exists in league with id ${leagueId}`);
      }

      const newTeam = await Team.create({ name, league: leagueId });

      await LeagueService.getInstance().addTeamToLeague(newTeam._id, leagueId, session);
      return newTeam;
    });
  }

  async setTeamLogoImage(teamId: string, file: Express.Multer.File): Promise<string> {
    logger.info(`TeamService: setting logo image for team with ${teamId}`);

    const team = await Team.findById(teamId);
    if (!team) {
      throw new NotFoundError(`Team with id ${teamId} not found`);
    }

    if (team.imgUrl) {
      // remove current image from cloud
      await this.imageService.deleteImageFromCloudinary(team.imgUrl);
    }
    const imageUrl = await this.imageService.uploadImage(file);

    team.imgUrl = imageUrl;
    await team.save();
    return imageUrl;
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
    const team = await Team.findById(id);
    if (!team) {
      throw new NotFoundError(`Team with id ${id} not found.`);
    }

    await transactionService.withTransaction(async (session) => {
      await this.leagueService.removeTeamFromLeague(team.league._id, team._id, session);

      await Team.findByIdAndDelete(id, { session });

      if (team.imgUrl) {
        await this.imageService.deleteImageFromCloudinary(team.imgUrl);
      }
    });
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

  async removePlayerFromTeam(teamId: Types.ObjectId, playerId: Types.ObjectId, session: ClientSession) {
    logger.info(`Team Service: Removing player ${playerId} from team ${teamId}`);
    const team = await Team.findById(teamId).session(session);
    if (!team) {
      throw new Error(`Team with id ${teamId} not found`);
    }

    const playerIndex = team.players.indexOf(playerId);
    if (playerIndex === -1) {
      throw new NotFoundError(`Player with id ${playerId} not found in team with id ${teamId}`);
    }

    team.players.splice(playerIndex, 1);
    await team.save({ session });
  }

  async addGameStats(teamId: Types.ObjectId, homeTeamStats: IGameTeamStats, session: ClientSession): Promise<void> {
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

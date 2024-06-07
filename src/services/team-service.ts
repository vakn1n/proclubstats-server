import { ClientSession, Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import { LeagueTableRow, PlayerDTO, TeamDTO } from "../../types-changeToNPM/shared-DTOs";
import logger from "../config/logger";
import { BadRequestError, NotFoundError } from "../errors";
import { IPlayerService } from "../interfaces/player";
import { ImageService } from "../interfaces/util-services/image-service.interface";
import { PlayerMapper } from "../mappers/player-mapper";
import { TeamMapper } from "../mappers/team-mapper";
import Player from "../models/player";
import { ITeam } from "../models/team";
import { ITeamService, ITeamRepository } from "../interfaces/team";

@injectable()
export class TeamService implements ITeamService {
  private imageService: ImageService;
  private playerService: IPlayerService;
  private teamRepository: ITeamRepository;

  constructor(
    @inject("ITeamRepository") teamRepository: ITeamRepository,
    @inject("ImageService") imageService: ImageService,
    @inject("IPlayerService") playerService: IPlayerService
  ) {
    this.teamRepository = teamRepository;
    this.imageService = imageService;
    this.playerService = playerService;
  }
  async renameTeam(teamId: string, newName: string): Promise<void> {
    logger.info(`TeamService: renaming team ${teamId} to ${newName}`);

    const isTeamNameExists = await this.teamRepository.isTeamNameExists(newName);

    if (isTeamNameExists) {
      throw new BadRequestError(`Team with name ${newName} already exists`);
    }

    await this.teamRepository.renameTeam(teamId, newName);
  }

  async getAllTeams(): Promise<TeamDTO[]> {
    const teams = await this.teamRepository.getTeams();
    return await TeamMapper.mapToDtos(teams);
  }

  async getTeamPlayers(teamId: string): Promise<PlayerDTO[]> {
    logger.info(`TeamService: getting players for team ${teamId}`);

    const team = await this.teamRepository.getTeamWithPlayers(teamId);

    return await PlayerMapper.mapToDtos(team.players);
  }

  async createTeam(name: string): Promise<TeamDTO> {
    logger.info(`TeamService: Creating team with name ${name} `);

    const team = await this.teamRepository.createTeam(name);
    return await TeamMapper.mapToDto(team);
  }

  async setTeamImage(teamId: string, file: Express.Multer.File): Promise<string> {
    logger.info(`TeamService: setting logo image for team with ${teamId}`);

    const team = await this.teamRepository.getTeamById(teamId);

    if (team.imgUrl) {
      // remove current image from cloud
      await this.imageService.removeImage(team.imgUrl);
    }
    const imageUrl = await this.imageService.uploadImage(file);

    team.imgUrl = imageUrl;
    await team.save();
    return imageUrl;
  }

  async getTeamById(id: string): Promise<TeamDTO> {
    logger.info(`TeamService: getting team ${id}`);

    const team = await this.teamRepository.getTeamById(id);
    return await TeamMapper.mapToDto(team);
  }

  async deleteTeam(team: ITeam, session: ClientSession): Promise<void> {
    logger.info(`deleting team with id ${team.id}`);

    if (team.imgUrl) {
      await this.imageService.removeImage(team.imgUrl);
    }

    if (team.players.length) {
      await this.playerService.removePlayersFromTeam(team.players, session);
    }

    await this.teamRepository.deleteTeamById(team.id, session);
  }

  async updateTeamGameStats(teamId: Types.ObjectId, goalsScored: number, goalsConceded: number, session: ClientSession): Promise<void> {
    logger.info(`TeamService: Updating stats for team ${teamId}`);

    const team = await this.teamRepository.getTeamById(teamId, session);

    team.stats.goalsScored += goalsScored;
    team.stats.goalsConceded += goalsConceded;

    if (!goalsConceded) {
      team.stats.cleanSheets += 1;
    }

    if (goalsScored > goalsConceded) {
      team.stats.wins += 1;
    } else if (goalsScored < goalsConceded) {
      team.stats.losses += 1;
    } else {
      team.stats.draws += 1;
    }

    await team.save({ session });
  }

  async revertTeamGameStats(teamId: Types.ObjectId, goalsScored: number, goalsConceded: number, session: ClientSession): Promise<void> {
    logger.info(`TeamService: Reverting stats for team ${teamId}`);

    const team = await this.teamRepository.getTeamById(teamId, session);

    // Update team stats
    team.stats.goalsScored -= goalsScored;
    team.stats.goalsConceded -= goalsConceded;
    if (!goalsConceded) {
      team.stats.cleanSheets -= 1;
    }
    if (goalsScored > goalsConceded) {
      team.stats.wins -= 1;
    } else if (goalsScored < goalsConceded) {
      team.stats.losses -= 1;
    } else {
      team.stats.draws -= 1;
    }
    await team.save({ session });
  }

  async setTeamCaptain(teamId: string, captainId: string): Promise<void> {
    logger.info(`Team Service: Setting team captain to captain with id ${captainId} for team with id ${teamId}`);

    const team = await this.teamRepository.getTeamById(teamId);

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

  async removePlayerFromTeam(teamId: Types.ObjectId, playerId: Types.ObjectId, session: ClientSession) {
    logger.info(`Team Service: Removing player ${playerId} from team ${teamId}`);
    const team = await this.teamRepository.getTeamById(teamId, session);

    const playerIndex = team.players.indexOf(playerId);
    if (playerIndex === -1) {
      throw new NotFoundError(`Player with id ${playerId} not found in team with id ${teamId}`);
    }

    team.players.splice(playerIndex, 1);
    await team.save({ session });
  }

  async getTeamsStatsByLeague(leagueId: string): Promise<LeagueTableRow[]> {
    const teams = await this.teamRepository.getTeamsByLeagueId(leagueId);
    if (!teams) {
      throw new NotFoundError(`No teams found for league with id ${leagueId}`);
    }

    return teams.map(this.calculateTeamTableRow);
  }

  private calculateTeamTableRow(team: ITeam): LeagueTableRow {
    const stats = team.stats;
    const gamesPlayed = stats.wins + stats.losses + stats.draws;
    const goalDifference = stats.goalsScored - stats.goalsConceded;
    const points = stats.wins * 3 + stats.draws;

    return {
      teamId: team.id,
      teamName: team.name,
      imgUrl: team.imgUrl,
      gamesPlayed,
      gamesWon: stats.wins,
      gamesLost: stats.losses,
      draws: stats.draws,
      goalDifference,
      points,
      goalsConceded: stats.goalsConceded,
      goalsScored: stats.goalsScored,
      cleanSheets: stats.cleanSheets,
    };
  }
}

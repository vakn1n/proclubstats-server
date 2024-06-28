import { ClientSession, Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import logger from "../config/logger";
import { BadRequestError, NotFoundError } from "../errors";
import { IPlayerService } from "../interfaces/player";
import { ImageService } from "../interfaces/util-services/image-service.interface";
import { PlayerMapper } from "../mappers/player-mapper";
import { TeamMapper } from "../mappers/team-mapper";
import Player from "../models/player";
import { ITeam, ITeamSeason } from "../models/team";
import { ITeamService, ITeamRepository } from "../interfaces/team";
import { TeamDTO, PlayerDTO, LeagueTableRow } from "@pro-clubs-manager/shared-dtos";

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

  async startNewLeagueSeason(leagueId: Types.ObjectId, seasonNumber: number, session?: ClientSession): Promise<void> {
    logger.info(`TeamService: Starting new league season for all teams in league ${leagueId}`);
    await this.teamRepository.startNewLeagueSeason(leagueId, seasonNumber, session);
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

  async updateTeamGameStats(teamId: Types.ObjectId, goalsScored: number, goalsConceded: number, session: ClientSession): Promise<void> {
    logger.info(`TeamService: Updating stats for team ${teamId}`);

    const team = await this.teamRepository.getTeamById(teamId, session);

    const latestSeasonStats = team.seasons.filter((season) => season.league === team.league)[team.seasons.length - 1].stats;

    latestSeasonStats.goalsScored += goalsScored;
    latestSeasonStats.goalsConceded += goalsConceded;

    if (!goalsConceded) {
      latestSeasonStats.cleanSheets += 1;
    }

    if (goalsScored > goalsConceded) {
      latestSeasonStats.wins += 1;
    } else if (goalsScored < goalsConceded) {
      latestSeasonStats.losses += 1;
    } else {
      latestSeasonStats.draws += 1;
    }

    await team.save({ session });
  }

  async revertTeamGameStats(teamId: Types.ObjectId, goalsScored: number, goalsConceded: number, session: ClientSession): Promise<void> {
    logger.info(`TeamService: Reverting stats for team ${teamId}`);
    const team = await this.teamRepository.getTeamById(teamId, session);

    const latestSeasonStats = team.seasons.filter((season) => season.league === team.league)[team.seasons.length - 1].stats;

    latestSeasonStats.goalsScored -= goalsScored;
    latestSeasonStats.goalsConceded -= goalsConceded;

    if (!goalsConceded) {
      latestSeasonStats.cleanSheets -= 1;
    }

    if (goalsScored > goalsConceded) {
      latestSeasonStats.wins -= 1;
    } else if (goalsScored < goalsConceded) {
      latestSeasonStats.losses -= 1;
    } else {
      latestSeasonStats.draws -= 1;
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

    if (captain.team?._id.toString() != team.id) {
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
    const latestSeasonStats = team.seasons.filter((season) => season.league.equals(team.league)).pop()!.stats;

    const gamesPlayed = latestSeasonStats.wins + latestSeasonStats.losses + latestSeasonStats.draws;
    const goalDifference = latestSeasonStats.goalsScored - latestSeasonStats.goalsConceded;
    const points = latestSeasonStats.wins * 3 + latestSeasonStats.draws;

    return {
      teamId: team.id,
      teamName: team.name,
      imgUrl: team.imgUrl,
      gamesPlayed,
      gamesWon: latestSeasonStats.wins,
      gamesLost: latestSeasonStats.losses,
      draws: latestSeasonStats.draws,
      goalDifference,
      points,
      goalsConceded: latestSeasonStats.goalsConceded,
      goalsScored: latestSeasonStats.goalsScored,
      cleanSheets: latestSeasonStats.cleanSheets,
    };
  }
}

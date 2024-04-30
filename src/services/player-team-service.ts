import { autoInjectable } from "tsyringe";
import { PlayerService, TeamService } from ".";
import NotFoundError from "../errors/not-found-error";
import Player from "../models/player";
import { transactionService } from "./transaction-service";
import logger from "../logger";
import Team from "../models/team";
import BadRequestError from "../errors/bad-request-error";

@autoInjectable()
export default class PlayerTeamService {
  private playerService: PlayerService;
  private teamService: TeamService;

  constructor(playerService: PlayerService, teamService: TeamService) {
    this.playerService = playerService;
    this.teamService = teamService;
  }

  async addPlayerToTeam(playerId: string, teamId: string): Promise<void> {
    const player = await Player.findById(playerId);
    if (!player) {
      throw new NotFoundError(`Player with id ${playerId} not found.`);
    }

    if (player.team) {
      throw new BadRequestError(`Player is already in team ${player.team}`);
    }

    const team = await Team.findById(teamId);
    if (!team) {
      throw new NotFoundError(`Team with id ${teamId} not found.`);
    }

    if (team.players.includes(player._id)) {
      throw new BadRequestError(`Player ${player.id} is already in team ${teamId}`);
    }

    player.team = team._id;
    team.players.push(player._id);

    await transactionService.withTransaction(async (session) => {
      await player.save({ session });
      await team.save({ session });
    });
  }

  async removePlayerFromTeam(playerId: string, teamId: string): Promise<void> {
    const player = await Player.findById(playerId);
    if (!player) {
      throw new NotFoundError(`Player with id ${playerId} not found.`);
    }
    const team = await Team.findById(teamId);
    if (!team) {
      throw new NotFoundError(`Team with id ${teamId} not found.`);
    }

    if (player.team !== team._id) {
      throw new BadRequestError(`Player ${player.id} is not in team ${teamId}`);
    }

    await transactionService.withTransaction(async (session) => {
      logger.info(`PlayerTeamService:  removing player ${playerId} from team ${teamId}`);
      await Player.updateOne({ _id: player._id }, { $set: { team: null } }, { session });
      await Team.updateOne({ _id: team._id }, { $pull: { players: player._id } }, { session });
      logger.info(`Successfully removed player ${player.id} from team ${team.id}`);
    });
  }

  async deletePlayer(playerId: string) {
    const player = await Player.findById(playerId);
    if (!player) {
      throw new NotFoundError(`Player with id ${playerId} not found.`);
    }
    await transactionService.withTransaction(async (session) => {
      if (player.team) {
        await this.teamService.removePlayerFromTeam(player.team, player.id, session);
      }

      await this.playerService.deletePlayer(player, session);
    });
  }
}

import { inject, injectable } from "tsyringe";
import logger from "../../config/logger";
import { BadRequestError } from "../../errors";
import { IPlayerRepository } from "../../interfaces/player";
import { ITeamRepository } from "../../interfaces/team";
import { IPlayerTeamService } from "../../interfaces/wrapper-services/player-team-service.interface";
import { transactionService } from "../util-services/transaction-service";

@injectable()
export class PlayerTeamService implements IPlayerTeamService {
  private playerRepository: IPlayerRepository;
  private teamRepository: ITeamRepository;

  constructor(@inject("ITeamRepository") teamService: ITeamRepository, @inject("IPlayerRepository") playerRepository: IPlayerRepository) {
    this.teamRepository = teamService;
    this.playerRepository = playerRepository;
  }

  async addPlayerToTeam(playerId: string, teamId: string): Promise<void> {
    logger.info(`PlayerTeamService: adding player ${playerId} to team ${teamId}`);
    const player = await this.playerRepository.getPlayerById(playerId);

    if (player.team) {
      throw new BadRequestError(`Player is already in a different team ${player.team}`);
    }

    const team = await this.teamRepository.getTeamById(teamId);

    if (team.players.includes(player._id)) {
      throw new BadRequestError(`Player ${player.id} is already in team ${teamId}`);
    }

    player.team = team._id;
    if (team.currentSeason) {
      player.currentSeason = {
        league: team.league!,
        seasonNumber: team.currentSeason.seasonNumber,
        team: team._id,
        stats: {
          assists: 0,
          goals: 0,
          avgRating: 0,
          cleanSheets: 0,
          playerOfTheMatch: 0,
          games: 0,
        },
      };
    }
    team.players.push(player._id);

    await transactionService.withTransaction(async (session) => {
      await player.save({ session });
      await team.save({ session });
    });
  }

  async removePlayerFromTeam(playerId: string, teamId: string): Promise<void> {
    logger.info(`PlayerTeamService:  removing player ${playerId} from team ${teamId}`);

    const [player, team] = await Promise.all([this.playerRepository.getPlayerById(playerId), this.teamRepository.getTeamById(teamId)]);

    if (!player.team?.equals(team._id)) {
      throw new BadRequestError(`Player ${player.id} is not in team ${teamId}`);
    }

    player.team = null;
    if (player.currentSeason) {
      player.seasonsHistory.push(player.currentSeason);
      player.currentSeason = undefined;
    }

    team.players = team.players.filter((id) => !id.equals(player._id));

    await transactionService.withTransaction(async (session) => {
      await player.save({ session });
      await team.save({ session });
    });
  }

  async deletePlayer(playerId: string) {
    // logger.info(`PlayerTeamService: deleting player ${playerId}`);
    // const player = await this.playerRepository.getPlayerById(playerId);
    // await transactionService.withTransaction(async (session) => {
    //   if (player.team) {
    //     await this.teamRepository.removePlayerFromTeam(player.team, player.id, session);
    //   }
    //   await this.playerRepository.deletePlayer(player.id, session);
    // });
  }
}

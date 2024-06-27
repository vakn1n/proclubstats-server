import { inject, injectable } from "tsyringe";
import { BadRequestError } from "../../errors";
import { ILeagueRepository } from "../../interfaces/league";
import { ITeamRepository } from "../../interfaces/team";
import { ITeamLeagueService } from "../../interfaces/wrapper-services/team-league-service.interface";
import { transactionService } from "../util-services/transaction-service";

@injectable()
export class TeamLeagueService implements ITeamLeagueService {
  private teamRepository: ITeamRepository;
  private leagueRepository: ILeagueRepository;

  constructor(@inject("ITeamRepository") teamRepository: ITeamRepository, @inject("ILeagueRepository") leagueRepository: ILeagueRepository) {
    this.teamRepository = teamRepository;
    this.leagueRepository = leagueRepository;
  }

  async addTeamToLeague(leagueId: string, teamId: string): Promise<void> {
    const league = await this.leagueRepository.getLeagueById(leagueId);

    const team = await this.teamRepository.getTeamById(teamId);

    if (league.teams.includes(team._id)) {
      throw new BadRequestError(`Team ${teamId} is already in league ${leagueId}`);
    }

    league.teams.push(team._id);
    team.league = league._id;
    team.seasons.push({
      league: league._id,
      seasonNumber: league.seasons.length,
      stats: { cleanSheets: 0, goalsConceded: 0, draws: 0, goalsScored: 0, losses: 0, wins: 0 },
    });

    await transactionService.withTransaction(async (session) => {
      await league.save({ session });
      await team.save({ session });
    });
  }

  async removeTeamFromLeague(leagueId: string, teamId: string): Promise<void> {
    const league = await this.leagueRepository.getLeagueById(leagueId);
    const team = await this.teamRepository.getTeamById(teamId);

    if (!league.teams.includes(team._id)) {
      throw new BadRequestError(`Team ${teamId} is not in league ${leagueId}`);
    }

    await transactionService.withTransaction(async (session) => {
      await this.leagueRepository.removeTeamFromLeague(league._id, team._id, session);
      await this.teamRepository.setTeamLeague(team._id, null, session);
    });
  }
}

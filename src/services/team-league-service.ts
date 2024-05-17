import { injectable } from "tsyringe";
import { LeagueService, TeamService } from ".";
import BadRequestError from "../errors/bad-request-error";
import League from "../models/league";
import Team from "../models/team";
import { transactionService } from "./transaction-service";

@injectable()
export default class TeamLeagueService {
  private teamService: TeamService;
  private leagueService: LeagueService;

  constructor(teamService: TeamService, leagueService: LeagueService) {
    this.teamService = teamService;
    this.leagueService = leagueService;
  }

  async addTeamToLeague(leagueId: string, teamId: string): Promise<void> {
    const league = await League.findById(leagueId);

    if (!league) {
      throw new BadRequestError(`Cant find league ${leagueId}`);
    }

    const team = await Team.findById(teamId);

    if (!team) {
      throw new BadRequestError(`Cant find team ${teamId}`);
    }

    if (league.teams.includes(team._id)) {
      throw new BadRequestError(`Team ${teamId} is already in league ${leagueId}`);
    }

    league.teams.push(team._id);
    team.league = league._id;

    await transactionService.withTransaction(async (session) => {
      await league.save({ session });
      await team.save({ session });
    });
  }

  async deleteTeam(teamId: string): Promise<void> {
    const team = await Team.findById(teamId);

    if (!team) {
      throw new BadRequestError(`Cant find team ${teamId} to delete`);
    }
    return await transactionService.withTransaction(async (session) => {
      if (team.league) {
        await this.leagueService.removeTeamFromLeague(team.league, team._id, session);
      }
      await this.teamService.deleteTeam(team, session);
    });
  }
}

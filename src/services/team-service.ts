import NotFoundError from "../errors/not-found-error";
import Team, { ITeam } from "../models/team";

class TeamService {
  private static instance: TeamService;

  private constructor() {}

  static getInstance(): TeamService {
    if (!TeamService.instance) {
      TeamService.instance = new TeamService();
    }
    return TeamService.instance;
  }

  async createTeam(name: string, leagueId: string, logoUrl: string): Promise<ITeam> {
    const newTeam = await Team.create({ name, leagueId, logoUrl });
    return newTeam;
  }

  async getTeamById(id: string): Promise<ITeam> {
    const team = await Team.findById(id);
    if (!team) {
      throw new NotFoundError(`Team with id of: ${id} not found`);
    }
    return team;
  }

  async getAllTeams(): Promise<ITeam[]> {
    const teams = await Team.find({});
    return teams;
  }
}

export default TeamService;

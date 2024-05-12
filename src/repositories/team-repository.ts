import NotFoundError from "../errors/not-found-error";
import ITeamRepository from "../interfaces/team/team-repository.interface";
import Team, { ITeam } from "../models/team";

export default class TeamRepository implements ITeamRepository {
  getTeams(): Promise<ITeam[]> {
    return Team.find();
  }

  async getTeamById(id: string): Promise<ITeam> {
    const team = await Team.findById(id);
    if (!team) {
      throw new NotFoundError(`Team with id of: ${id} not found`);
    }

    return team;
  }
}

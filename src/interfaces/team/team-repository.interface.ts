import { ITeam } from "../../models/team";

export default interface ITeamRepository {
  getTeamById(id: string): Promise<ITeam>;
  getTeams(): Promise<ITeam[]>;
}

import { ILeague } from "../../models/league";

export default interface ILeagueRepository {
  getAllLeagues(): Promise<ILeague[]>;
  getLeagueById(id: string): Promise<ILeague>;

  isLeagueNameExists(name: string): Promise<boolean>;

  createLeague(name: string, imgUrl?: string): Promise<ILeague>;
}

import { ClientSession, Types } from "mongoose";
import { ILeague } from "../../models/league";

export default interface ILeagueRepository {
  getAllLeagues(): Promise<ILeague[]>;
  getLeagueById(id: string | Types.ObjectId, session?: ClientSession): Promise<ILeague>;

  getLeagueWithTeams(id: string | Types.ObjectId, params: string[] = [], session?: ClientSession): Promise<ILeague>;

  isLeagueNameExists(name: string): Promise<boolean>;

  createLeague(name: string, imgUrl?: string): Promise<ILeague>;
  deleteLeague(id: string | Types.ObjectId, session?: ClientSession): Promise<void>;
}

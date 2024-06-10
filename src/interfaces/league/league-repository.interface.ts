import { ClientSession, Types } from "mongoose";
import { ILeague } from "../../models/league";
import { TopAssister, TopScorer } from "../../types-changeToNPM/shared-DTOs";

export interface ILeagueRepository {
  getAllLeagues(): Promise<ILeague[]>;
  getLeagueById(id: string | Types.ObjectId, session?: ClientSession): Promise<ILeague>;

  isLeagueNameExists(name: string): Promise<boolean>;

  createLeague(name: string, imgUrl?: string): Promise<ILeague>;
  deleteLeague(id: string | Types.ObjectId, session?: ClientSession): Promise<void>;

  removeTeamFromLeague(leagueId: Types.ObjectId, teamId: Types.ObjectId, session?: ClientSession): Promise<void>;

  calculateLeagueTopScorers(leagueId: string | Types.ObjectId, limit: number, session?: ClientSession): Promise<TopScorer[]>;
  calculateLeagueTopAssisters(leagueId: string | Types.ObjectId, limit: number, session?: ClientSession): Promise<TopAssister[]>;
}

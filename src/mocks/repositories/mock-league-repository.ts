import { Types } from "mongoose";
import { TopAssister, TopScorer } from "../../types-changeToNPM/shared-DTOs";
import { NotFoundError } from "../../errors";
import { ILeagueRepository } from "../../interfaces/league";
import League, { ILeague } from "../../models/league";

export class MockLeagueRepository implements ILeagueRepository {
  async getAllLeagues(): Promise<ILeague[]> {
    return await League.find({});
  }
  async getLeagueById(id: string | Types.ObjectId): Promise<ILeague> {
    const league = await League.findById(id);
    if (!league) {
      throw new NotFoundError(`League with id ${id} not found`);
    }
    return league;
  }
  async isLeagueNameExists(name: string): Promise<boolean> {
    return !!(await League.exists({ name }));
  }
  async createLeague(name: string, imgUrl?: string): Promise<ILeague> {
    const newLeague = await League.create({ name, imgUrl });
    return newLeague;
  }

  async deleteLeague(id: string | Types.ObjectId): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async removeTeamFromLeague(leagueId: Types.ObjectId, teamId: Types.ObjectId): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async calculateLeagueTopScorers(leagueId: string | Types.ObjectId, limit: number): Promise<TopScorer[]> {
    throw new Error("Method not implemented.");
  }
  async calculateLeagueTopAssisters(leagueId: string | Types.ObjectId, limit: number): Promise<TopAssister[]> {
    throw new Error("Method not implemented.");
  }
}

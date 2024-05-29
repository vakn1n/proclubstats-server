import { Types, ClientSession } from "mongoose";
import { IFixture } from "../../models/fixture";

export interface IFixtureRepository {
  createFixture(leagueId: string | Types.ObjectId, startDate: Date, endDate: Date, round: number, session?: ClientSession): Promise<IFixture>;

  deleteFixtureById(id: string | Types.ObjectId, session?: ClientSession): Promise<void>;
  deleteFixtures(fixturesIds: string[] | Types.ObjectId[], session?: ClientSession): Promise<void>;

  getFixtureById(id: string | Types.ObjectId, session?: ClientSession): Promise<IFixture>;
  getAllFixturesByLeagueId(leagueId: string | Types.ObjectId, session?: ClientSession): Promise<IFixture[]>;
  getLeagueFixture(leagueId: string | Types.ObjectId, round: number, session?: ClientSession): Promise<IFixture>;

  getFixturesByLeagueWithPagination(leagueId: string, page: number, pageSize: number): Promise<IFixture[]>;

  countFixturesByLeague(leagueId: string): Promise<number>;
}

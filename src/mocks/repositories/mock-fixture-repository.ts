import { Types, ClientSession } from "mongoose";
import { IFixtureRepository } from "../../interfaces/fixture";
import { IFixture } from "../../models/fixture";

export class MockFixtureRepository implements IFixtureRepository {
  createFixture = jest.fn<Promise<IFixture>, [string | Types.ObjectId, number, Date, Date, number, ClientSession?]>();
  deleteFixtureById = jest.fn<Promise<void>, [string | Types.ObjectId, ClientSession?]>();
  deleteFixtures = jest.fn<Promise<void>, [string[] | Types.ObjectId[], ClientSession?]>();
  getFixtureById = jest.fn<Promise<IFixture>, [string | Types.ObjectId, ClientSession?]>();
  getAllFixturesByLeagueId = jest.fn<Promise<IFixture[]>, [string | Types.ObjectId, ClientSession?]>();
  getLeagueFixture = jest.fn<Promise<IFixture>, [string | Types.ObjectId, number, ClientSession?]>();
  getFixturesByLeagueWithPagination = jest.fn<Promise<IFixture[]>, [string, number, number]>();
  countFixturesByLeague = jest.fn<Promise<number>, [string]>();
}

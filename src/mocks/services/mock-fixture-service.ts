import { ClientSession, Types } from "mongoose";
import { IFixtureService } from "../../interfaces/fixture";
import { AddFixtureData, IFixture } from "../../models/fixture";
import { FixtureDTO, GameDTO, PaginatedFixtureDTO } from "@pro-clubs-manager/shared-dtos";

export class MockFixtureService implements IFixtureService {
  getFixtureById = jest.fn<Promise<FixtureDTO>, [string]>();
  getPaginatedLeagueFixturesGames = jest.fn<Promise<PaginatedFixtureDTO>, [string, number, number]>();
  generateFixture = jest.fn<Promise<IFixture>, [AddFixtureData, ClientSession]>();
  getLeagueFixtureGames = jest.fn<Promise<GameDTO[]>, [string, number]>();
  deleteFixtures = jest.fn<Promise<void>, [Types.ObjectId[], ClientSession]>();
}

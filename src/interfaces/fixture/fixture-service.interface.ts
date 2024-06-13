import { ClientSession, Types } from "mongoose";
import { AddFixtureData, IFixture } from "../../models/fixture";
import { FixtureDTO, PaginatedFixtureDTO, GameDTO } from "@pro-clubs-manager/shared-dtos";

export interface IFixtureService {
  getFixtureById(id: string): Promise<FixtureDTO>;

  getPaginatedLeagueFixturesGames(leagueId: string, page: number, pageSize: number): Promise<PaginatedFixtureDTO>;

  generateFixture(fixtureData: AddFixtureData, session: ClientSession): Promise<IFixture>;

  getLeagueFixtureGames(leagueId: string, round: number): Promise<GameDTO[]>;

  deleteFixtures(fixturesIds: Types.ObjectId[], session: ClientSession): Promise<void>;
}

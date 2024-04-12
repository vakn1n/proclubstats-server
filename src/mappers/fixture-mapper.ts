import { FixtureDto as FixtureDTO } from "../../types-changeToNPM/shared-DTOs";
import { IFixture } from "../models/fixture";
import { IGame } from "../models/game";

export class FixtureMapper {
  static async mapToDto(fixture: IFixture): Promise<FixtureDTO> {
    if (!fixture) {
      throw new Error("fixture object is null or undefined");
    }

    return {
        id: fixture.id,
        round: fixture.round,
        leagueId: fixture.league.id.toString(),
        startDate: fixture.startDate,
        endDate: fixture.endDate,
        games: 
    }
  }

  static async mapToDtos(fixtures: IFixture[]): Promise<FixtureDTO[]> {
    return await Promise.all(fixtures.map((fixture) => this.mapToDto(fixture)));
  }
}

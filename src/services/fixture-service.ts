import { ClientSession, Types } from "mongoose";
import { FixtureDTO } from "../../types-changeToNPM/shared-DTOs";
import logger from "../logger";
import { FixtureMapper } from "../mappers/fixture-mapper";
import Fixture, { AddFixtureData, IFixture } from "../models/fixture";
import GameService from "./game-service";
import NotFoundError from "../errors/not-found-error";
import { injectable } from "tsyringe";

@injectable()
export default class FixtureService {
  private gameService: GameService;

  constructor(gameService: GameService) {
    console.log("game");

    this.gameService = gameService;
  }

  async getFixtureById(id: string): Promise<FixtureDTO> {
    logger.info(`FixtureService: getting fixture with id ${id}`);

    const fixture = await Fixture.findById(id);
    if (!fixture) {
      throw new NotFoundError(`cant find fixture with id ${id}`);
    }

    return await FixtureMapper.mapToDto(fixture);
  }

  async getPaginatedLeagueFixturesGames(leagueId: string, page: number, pageSize: number): Promise<FixtureDTO[]> {
    logger.info(`FixtureService: getting fixture with league with id ${leagueId} for page ${page} and page size ${pageSize}`);

    const fixtures = await Fixture.find({ league: leagueId })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    if (!fixtures?.length) {
      throw new NotFoundError(`cant find fixtures`);
    }

    return await FixtureMapper.mapToDtos(fixtures);
  }

  async generateFixture(fixtureData: AddFixtureData, session: ClientSession): Promise<IFixture> {
    const { leagueId, round, startDate, endDate, gamesData } = fixtureData;

    logger.info(`FixtureService: generating fixture for round ${round} `);

    const fixture = new Fixture({ league: leagueId, startDate, endDate, round });

    const games = await this.gameService.createFixtureGames(gamesData, fixture._id, session);

    fixture.games = games.map((game) => game._id);
    await fixture.save({ session });
    return fixture;
  }

  async getLeagueFixtureGames(leagueId: string, round: number) {
    logger.info(`FixtureService: getting fixture games for league ${leagueId} for round ${round}`);

    const fixture = await Fixture.findOne({ league: leagueId, round });
    if (!fixture) {
      throw new NotFoundError(`cant find fixture`);
    }
    return await this.gameService.getGamesByIds(fixture.games);
  }

  async deleteFixtures(fixturesIds: Types.ObjectId[], session: ClientSession) {
    logger.info(`FixtureService: deleting ${fixturesIds.length} fixtures`);

    await this.gameService.deleteFixturesGames(fixturesIds, session);

    try {
      await Fixture.deleteMany({ _id: { $in: fixturesIds } }, { session });
    } catch (e) {
      logger.error(e);
      throw new Error(`Failed to delete fixtures`);
    }
  }
}

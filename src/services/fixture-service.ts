import { ClientSession, Types } from "mongoose";
import { FixtureDTO } from "../../types-changeToNPM/shared-DTOs";
import logger from "../logger";
import { FixtureMapper } from "../mappers/fixture-mapper";
import Fixture, { AddFixtureData, IFixture } from "../models/fixture";
import GameService from "./game-service";

export default class FixtureService {
  private static instance: FixtureService;
  private gameService: GameService;

  private constructor() {
    this.gameService = GameService.getInstance();
  }

  static getInstance(): FixtureService {
    if (!this.instance) {
      this.instance = new FixtureService();
    }
    return this.instance;
  }

  async generateFixture(fixtureData: AddFixtureData, session: ClientSession): Promise<IFixture> {
    const { leagueId, round, startDate, endDate, gamesData } = fixtureData;

    logger.info(`FixtureService: generating fixture for round ${round} `);

    const fixture = new Fixture({ league: leagueId, startDate, endDate, round });

    const games = await Promise.all(
      gamesData.map(async (gameData) => {
        gameData.fixtureId = fixture.id;
        return await this.gameService.createGame(gameData, session);
      })
    );

    fixture.games = games.map((game) => game._id);
    await fixture.save({ session });
    return fixture;
  }

  async getLeagueFixtures(leagueId: Types.ObjectId): Promise<FixtureDTO[]> {
    logger.info(`FixtureService: getting fixtures for league ${leagueId}`);

    const fixtures = await Fixture.find({ league: leagueId }).sort({ round: 1 });

    return await FixtureMapper.mapToDtos(fixtures);
  }

  async deleteFixtures(fixturesIds: Types.ObjectId[], session: ClientSession) {
    logger.info(`FixtureService: deleting ${fixturesIds.length} fixtures`);

    await Promise.all(fixturesIds.map(async (fixtureId) => await this.gameService.deleteFixtureGames(fixtureId, session)));

    try {
      await Fixture.deleteMany({ _id: { $in: fixturesIds } }).session(session);
    } catch (e) {
      logger.error(e);
      throw new Error(`Failed to delete fixtures`);
    }
  }
}

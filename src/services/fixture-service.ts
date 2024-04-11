import { ClientSession, Types } from "mongoose";
import Fixture, { AddFixtureData, IFixture } from "../models/fixture";
import GameService from "./game-service";
import { AddGameData } from "../models/game";

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

  private async createFixture(leagueId: Types.ObjectId, startDate: Date, endDate: Date, round: number, session: ClientSession): Promise<IFixture> {
    const fixture = new Fixture({ league: leagueId, startDate, endDate, round });
    await fixture.save({ session });
    return fixture;
  }

  async generateFixture(fixtureData: AddFixtureData, session: ClientSession): Promise<IFixture> {
    const { leagueId, round, startDate, endDate, gamesData } = fixtureData;
    const fixture = await this.createFixture(leagueId, startDate, endDate, round, session);

    await Promise.all(
      gamesData.map(async (gameData) => {
        const game = await this.gameService.createGame(gameData, session);
      })
    );

    return fixture;
  }
}

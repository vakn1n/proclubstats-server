import NotFoundError from "../errors/not-found-error";
import Fixture, { IFixture } from "../models/fixture";
import LeagueService from "./league-service";

class FixtureService {
  private static instance: FixtureService;
  private leagueService: LeagueService;

  private constructor() {
    this.leagueService = LeagueService.getInstance();
  }

  static getInstance(): FixtureService {
    if (!this.instance) {
      this.instance = new FixtureService();
    }
    return this.instance;
  }

  async addFixtureToLeague(leagueId: string, fixtureData: any) {
    const fixture = new Fixture({ leagueId, ...fixtureData });
    await fixture.save();

    await this.leagueService.addFixtureToLeague(leagueId, fixture._id);

    return fixture;
  }

  async deleteFixture(id: string): Promise<IFixture> {
    const fixture = await Fixture.findByIdAndDelete(id);
    if (!fixture) {
      throw new NotFoundError(`Fixture with id ${id} not found`);
    }
    return fixture;
  }

  async getFixtureById(id: string): Promise<IFixture> {
    const fixture = await Fixture.findById(id);
    if (!fixture) {
      throw new NotFoundError(`fixture with id ${id} not found`);
    }
    return fixture;
  }

  async getAllFixtures(): Promise<IFixture[]> {
    return await Fixture.find();
  }
}

export default FixtureService;

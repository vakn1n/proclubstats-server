import { ClientSession } from "mongoose";
import NotFoundError from "../errors/not-found-error";
import logger from "../logger";
import Fixture, { IFixture, IFixtureTeamStats } from "../models/fixture";
import LeagueService from "./league-service";
import TeamService from "./team-service";
import { transactionService } from "./transaction-service";

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

  async createFixture(fixtureData: any, session: ClientSession): Promise<IFixture> {}

  async addFixture(fixtureData: any): Promise<IFixture> {
    logger.info(`Adding fixture ${fixtureData}`);
    const { awayTeamId, homeTeamId, leagueId, round } = fixtureData;
    return await transactionService.withTransaction(async (session) => {
      const fixture = await Fixture.create({
        awayTeam: awayTeamId,
        homeTeam: homeTeamId,
        league: leagueId,
        round,
        session,
      });

      await this.leagueService.addFixtureToLeague(leagueId, fixture.id, session);
      return fixture;
    });
  }

  async generateLeagueFixtures(leagueId: string) {
    // TODO: implement this
  }

  async updateFixtureResult(
    fixtureId: string,
    result: { homeTeamGoals: number; awayTeamGoals: number }
  ): Promise<void> {
    logger.info(`updating fixture ${fixtureId} result`);

    const fixture = await Fixture.findById(fixtureId);

    if (!fixture) {
      throw new NotFoundError(`fixture ${fixtureId} not found`);
    }

    fixture.result = result;
    fixture.played = true;

    await fixture.save();
  }

  async updateFixtureStats(fixtureId: string, homeTeamStats: IFixtureTeamStats, awayTeamStats: IFixtureTeamStats) {
    logger.info(`updating fixture ${fixtureId} stats`);

    const fixture = await Fixture.findById(fixtureId);

    if (!fixture) {
      throw new NotFoundError(`fixture ${fixtureId} not found`);
    }

    if (!fixture.played) {
      throw new Error(`can't update fixture stats before updating its result`);
    }

    await transactionService.withTransaction(async (session) => {
      fixture.homeTeamStats = homeTeamStats;
      fixture.awayTeamStats = awayTeamStats;

      await Promise.all([
        TeamService.getInstance().addFixtureStats(fixture.homeTeam, homeTeamStats, session),
        TeamService.getInstance().addFixtureStats(fixture.awayTeam, awayTeamStats, session),
      ]);

      await fixture.save({ session });
    });
  }

  async addFixtureResultAndStats(fixtureId: string, fixtureData: any) {
    // TODO: create type for the fixture data
    logger.info(`updating fixture ${fixtureId} result and stats`);

    const fixture = await Fixture.findById(fixtureId);

    if (!fixture) {
      throw new NotFoundError(`fixture ${fixtureId} not found`);
    }
    await transactionService.withTransaction(async (session) => {
      fixture.homeTeamStats = fixtureData.homeTeamStats;
      fixture.awayTeamStats = fixtureData.awayTeamStats;
      fixture.result = fixtureData.result;
      fixture.played = true;

      await Promise.all([
        TeamService.getInstance().addFixtureStats(fixture.homeTeam, fixtureData.homeTeamStats, session),
        TeamService.getInstance().addFixtureStats(fixture.awayTeam, fixtureData.awayTeamStats, session),
      ]);

      await fixture.save({ session });
    });
  }

  async deleteFixture(id: string): Promise<IFixture> {
    logger.info(`deleting fixture ${id}`);

    const fixture = await Fixture.findByIdAndDelete(id);
    if (!fixture) {
      throw new NotFoundError(`Fixture with id ${id} not found`);
    }
    return fixture;
  }

  async getFixtureById(id: string): Promise<IFixture> {
    logger.info(`getting fixture ${id}`);

    const fixture = await Fixture.findById(id);
    if (!fixture) {
      throw new NotFoundError(`fixture with id ${id} not found`);
    }
    return fixture;
  }

  async getAllFixtures(): Promise<IFixture[]> {
    logger.info(`getting all fixtures`);
    return await Fixture.find();
  }
}

export default FixtureService;

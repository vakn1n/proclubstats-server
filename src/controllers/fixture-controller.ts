import { NextFunction, Request, Response } from "express";
import FixtureService from "../services/fixture-service";

export default class FixtureController {
  private fixtureService: FixtureService;
  private static instance: FixtureController;

  private constructor() {
    this.fixtureService = FixtureService.getInstance();
  }

  static getInstance(): FixtureController {
    if (!this.instance) {
      this.instance = new FixtureController();
    }
    return this.instance;
  }

  async addFixture(req: Request, res: Response, next: NextFunction): Promise<void> {
    const fixtureData = req.body;
    try {
      const fixture = await this.fixtureService.addFixture(fixtureData);

      res.status(201).json(fixture);
    } catch (error: any) {
      next(error);
    }
  }

  async getFixtureById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    try {
      const fixture = await this.fixtureService.getFixtureById(id);
      res.json(fixture);
    } catch (error: any) {
      next(error);
    }
  }

  async getAllFixtures(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fixtures = await this.fixtureService.getAllFixtures();
      res.json(fixtures);
    } catch (error: any) {
      next(error);
    }
  }

  async updateFixtureResult(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const { result } = req.body;
    console.log(result);

    if (!result) {
      res.status(400).send({ message: "No result provided" });
      return;
    }

    try {
      await this.fixtureService.updateFixtureResult(id, result);
      res.sendStatus(200);
    } catch (error: any) {
      next(error);
    }
  }

  async updateFixtureStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: leagueId } = req.params;
    const { homeTeamStats, awayTeamStats } = req.body;

    if (!leagueId || !homeTeamStats || !awayTeamStats) {
      res.status(400).send({ message: "No home/away stats provided" });
      return;
    }

    try {
      await this.fixtureService.updateFixtureStats(leagueId, homeTeamStats, awayTeamStats);
      res.sendStatus(200);
    } catch (error: any) {
      next(error);
    }
  }

  async deleteFixture(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: leagueId } = req.params;

    if (!leagueId) {
      res.status(400).send({ message: "No leagueId provided" });
      return;
    }
    try {
      await this.fixtureService.deleteFixture(leagueId);
      res.sendStatus(204);
    } catch (error: any) {
      next(error);
    }
  }
}

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

  async createFixture(req: Request, res: Response, next: NextFunction): Promise<void> {
    const fixtureData = req.body;
    try {
      const fixture = await this.fixtureService.createFixture(fixtureData);
      res.json(fixture);
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

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fixtures = await this.fixtureService.getAllFixtures();
      res.json(fixtures);
    } catch (error: any) {
      next(error);
    }
  }
}

import { NextFunction, Request, Response } from "express";
import FixtureService from "../services/fixture-service";
import { FixtureDTO, GameDTO } from "../../types-changeToNPM/shared-DTOs";

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

  async getFixtureById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const fixture = await this.fixtureService.getFixtureById(id);
      res.json(fixture);
    } catch (error: any) {
      next(error);
    }
  }

  async getFixtureGames(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const fixture = await this.fixtureService.getFixtureGames(id);
      res.json(fixture);
    } catch (error: any) {
      next(error);
    }
  }
}

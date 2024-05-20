import { NextFunction, Request, Response } from "express";

export default interface IFixtureController {
  getFixtureById(req: Request, res: Response, next: NextFunction): Promise<void>;

  getPaginatedLeagueFixturesGames(req: Request, res: Response, next: NextFunction): Promise<void>;

  getLeagueFixtureGames(req: Request, res: Response, next: NextFunction): Promise<void>;
}

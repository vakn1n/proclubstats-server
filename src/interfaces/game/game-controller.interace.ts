import { NextFunction, Request, Response } from "express";

export interface IGameController {
  getGameById(req: Request, res: Response, next: NextFunction): Promise<void>;

  getTeamGames(req: Request, res: Response, next: NextFunction): Promise<void>;

  updateGameResult(req: Request, res: Response, next: NextFunction): Promise<void>;

  updateTeamPlayersPerformance(req: Request, res: Response, next: NextFunction): Promise<void>;

  deleteGame(req: Request, res: Response, next: NextFunction): Promise<void>;
}

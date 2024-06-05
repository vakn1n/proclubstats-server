import { NextFunction, Request, Response } from "express";

export interface IPlayerController {
  createPlayer(req: Request, res: Response, next: NextFunction): Promise<void>;

  renamePlayer(req: Request, res: Response, next: NextFunction): Promise<void>;
  setPlayerImage(req: Request, res: Response, next: NextFunction): Promise<void>;

  getPlayerById(req: Request, res: Response, next: NextFunction): Promise<void>;

  deletePlayer(req: Request, res: Response, next: NextFunction): Promise<void>;
}

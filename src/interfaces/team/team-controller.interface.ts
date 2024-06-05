import { NextFunction, Response, Request } from "express";

export interface ITeamController {
  getTeamById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  setTeamCaptain: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  renameTeam: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  createTeam: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  getAdvancedTeamStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  getTeamPlayers: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  addPlayerToTeam: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

import { NextFunction, Request, Response } from "express";

export interface ILeagueController {
  getLeagueById: (req: Request, res: Response, next: NextFunction) => void;
  getAllLeagues: (req: Request, res: Response, next: NextFunction) => void;
  getTopScorers: (req: Request, res: Response, next: NextFunction) => void;
  getTopAssists: (req: Request, res: Response, next: NextFunction) => void;
  getLeagueTable: (req: Request, res: Response, next: NextFunction) => void;
  getTopPlayers: (req: Request, res: Response, next: NextFunction) => void;
  addTeamToLeague: (req: Request, res: Response, next: NextFunction) => void;
  createLeague: (req: Request, res: Response, next: NextFunction) => void;
}

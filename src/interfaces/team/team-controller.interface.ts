import { NextFunction, Response, Request } from "express";

export default interface ITeamController {
  getTeamById: (req: Request, res: Response, next: NextFunction) => void;
  setTeamCaptain: (req: Request, res: Response, next: NextFunction) => void;
  createTeam: (req: Request, res: Response, next: NextFunction) => void;
  deleteTeam: (req: Request, res: Response, next: NextFunction) => void;
  getTeamPlayers: (req: Request, res: Response, next: NextFunction) => void;
  addPlayerToTeam: (req: Request, res: Response, next: NextFunction) => void;
}

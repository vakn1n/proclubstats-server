import { NextFunction, Request, Response } from "express";
import TeamService from "../services/team-service";

class TeamController {
  private teamService: TeamService;
  private static instance: TeamController;

  private constructor() {
    this.teamService = TeamService.getInstance();
  }

  static getInstance(): TeamController {
    if (!this.instance) {
      this.instance = new TeamController();
    }
    return this.instance;
  }

  async addTeamToLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // await this.teamService.addTeamToLeague(teamId, leagueId)
    } catch (error: any) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Implement team update
    } catch (error: any) {
      next(error);
    }
  }

  async removeTeamFromLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    try {
      await this.teamService.removeTeamLeague(id);
      res.sendStatus(200);
    } catch (error: any) {
      next(error);
    }
  }

  async getTeamById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    try {
      const team = await this.teamService.getTeamById(id);
      res.json(team);
    } catch (error: any) {
      next(error);
    }
  }

  async getAllTeams(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teams = await this.teamService.getAllTeams();
      res.json(teams);
    } catch (error: any) {
      next(error);
    }
  }
}

export default TeamController;

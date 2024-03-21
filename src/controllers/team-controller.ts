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

  async createTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { name, logoUrl, leagueId } = req.body;

    try {
      const team = await this.teamService.createTeam(name, leagueId, logoUrl);
      res.json(team);
    } catch (error: any) {
      next(error);
    }
  }
  async deleteTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: teamId } = req.params;
    try {
      await this.teamService.deleteTeam(teamId);
      res.sendStatus(204);
    } catch (error: any) {
      next(error);
    }
  }

  async getTeamById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: teamId } = req.params;
    try {
      const team = await this.teamService.getTeamById(teamId);
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

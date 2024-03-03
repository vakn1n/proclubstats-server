import { NextFunction, Request, Response } from "express";
import LeagueService from "../services/league-service";

class LeagueController {
  private leagueService: LeagueService;
  private static instance: LeagueController;

  private constructor() {
    this.leagueService = LeagueService.getInstance();
  }

  static getInstance(): LeagueController {
    if (!this.instance) {
      this.instance = new LeagueController();
    }
    return this.instance;
  }

  async addLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { leagueData } = req.body;
    try {
      // Implement league creation
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Implement league deletion
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLeagueById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    try {
      const league = await this.leagueService.getLeagueById(id);
      res.json(league);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllLeagues(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fixtures = await this.leagueService.getAllLeagues();
      res.json(fixtures);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTopcScorers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topScorers = await this.leagueService.getTopScorers();
      res.json(topScorers);
    } catch (e) {
      next(e);
    }
  }
  async getTopAssists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topAssists = await this.leagueService.getTopAssists();
      res.json(topAssists);
    } catch (e) {
      next(e);
    }
  }
}

export default LeagueController;

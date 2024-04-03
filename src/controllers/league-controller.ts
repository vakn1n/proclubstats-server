import { NextFunction, Request, Response } from "express";
import LeagueService from "../services/league-service";
import logger from "../logger";
import ImageService from "../services/images-service";

class LeagueController {
  private leagueService: LeagueService;
  private static instance: LeagueController;

  private imageService: ImageService;

  private constructor() {
    this.leagueService = LeagueService.getInstance();
    this.imageService = ImageService.getInstance();
  }

  static getInstance(): LeagueController {
    if (!LeagueController.instance) {
      LeagueController.instance = new LeagueController();
    }
    return LeagueController.instance;
  }

  async addLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const file = req.file;

    let imgUrl = undefined;

    try {
      if (file) {
        imgUrl = await this.imageService.uploadImage(file);
      } else {
        res.sendStatus(200);
        return;
      }
      const league = await this.leagueService.addLeague(name, imgUrl);
      res.status(201).json(league);
    } catch (error: any) {
      next(error);
    }
  }

  async removeLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    try {
      await this.leagueService.removeLeague(id);
      res.sendStatus(204);
    } catch (error: any) {
      next(error);
    }
  }

  async getLeagueById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    try {
      const league = await this.leagueService.getLeagueById(id);
      res.json(league);
    } catch (error: any) {
      next(error);
    }
  }

  async getAllLeagues(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fixtures = await this.leagueService.getAllLeagues();
      res.json(fixtures);
    } catch (error: any) {
      next(error);
    }
  }

  async getLeagueTable(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: leagueId } = req.params;

    if (!leagueId) {
      res.status(404).send({ message: "No league id provided" });
      return;
    }

    try {
      const leagueTable = await this.leagueService.getLeagueTable(leagueId);
      res.json(leagueTable);
    } catch (error: any) {
      next(error);
    }
  }

  async getTopScorers(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: leagueId } = req.params;

    if (!leagueId) {
      res.status(404).send({ message: "No league id provided" });
      return;
    }

    try {
      const topScorers = await this.leagueService.getTopScorers(leagueId);
      res.json(topScorers);
    } catch (error) {
      next(error);
    }
  }
  async getTopAssists(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: leagueId } = req.params;

    if (!leagueId) {
      res.status(404).send({ message: "No league id provided" });
      return;
    }

    try {
      const topAssists = await this.leagueService.getTopAssists(leagueId);
      res.json(topAssists);
    } catch (error) {
      next(error);
    }
  }
}

export default LeagueController;

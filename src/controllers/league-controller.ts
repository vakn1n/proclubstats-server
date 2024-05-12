import { NextFunction, Request, Response } from "express";
import LeagueService from "../services/league-service";
import logger from "../logger";
import ImageService from "../services/images-service";
import { AddSingleFixtureData } from "../../types-changeToNPM/shared-DTOs";
import { autoInjectable } from "tsyringe";
import { TeamLeagueService } from "../services";
import ILeagueController from "../interfaces/league/league-controller.interace";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import ILeagueService from "../interfaces/league/league-service.interface";

@autoInjectable()
export default class LeagueController implements ILeagueController {
  private leagueService: ILeagueService;
  private teamLeagueService: TeamLeagueService;
  private imageService: ImageService;

  constructor(leagueService: ILeagueService, teamLeagueService: TeamLeagueService, imageService: ImageService) {
    this.leagueService = leagueService;
    this.imageService = imageService;
    this.teamLeagueService = teamLeagueService;
  }
  async getTopPlayers(req: Request, res: Response, next: NextFunction) {
    // const { leagueId } = req.params;
    // try {
    //   const topPlayers = await this.leagueService.getTopPlayers(leagueId);
    //   res.json(topPlayers);
    // } catch (error: any) {
    //   next(error);
    // }
  }
  async createLeague(req: Request, res: Response, next: NextFunction) {
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

  async deleteLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    try {
      await this.leagueService.deleteLeague(id);
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

  async addTeamToLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: leagueId } = req.params;
    const { teamId } = req.body;

    if (!leagueId || !teamId) {
      res.status(404).send({ message: "Missing data" });
      return;
    }

    try {
      await this.teamLeagueService.addTeamToLeague(leagueId, teamId);
      res.sendStatus(204);
    } catch (error: any) {
      next(error);
    }
  }

  async createLeagueFixture(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: leagueId } = req.params;

    if (!leagueId) {
      res.status(404).send({ message: "No league id provided" });
      return;
    }

    const fixtureData = req.body as AddSingleFixtureData;

    try {
      const fixture = await this.leagueService.createFixture(leagueId, fixtureData);
      res.status(201).json(fixture);
    } catch (error) {
      next(error);
    }
  }

  async generateLeagueFixtures(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: leagueId } = req.params;

    const { startDate, fixturesPerWeek }: { startDate: string; fixturesPerWeek: number } = req.body;

    if (!leagueId || !startDate || !fixturesPerWeek) {
      res.status(404).send({ message: "missing date for generate fixtures" });
      return;
    }

    try {
      const fixtures = await this.leagueService.generateLeagueFixtures(leagueId, startDate, fixturesPerWeek);
      res.status(201).json(fixtures);
    } catch (error) {
      next(error);
    }
  }

  async deleteAllLeagueFixtures(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: leagueId } = req.params;

    if (!leagueId) {
      res.status(404).send({ message: "No league id provided" });
      return;
    }

    try {
      await this.leagueService.deleteAllLeagueFixtures(leagueId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
}

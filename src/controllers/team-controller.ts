import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { ITeamController, ITeamService } from "../interfaces/team/";
import { IPlayerTeamService } from "../interfaces/wrapper-services/player-team-service.interface";
import { ITeamStatsService } from "../interfaces/wrapper-services/team-stats-service.interface";

@injectable()
export default class TeamController implements ITeamController {
  private teamService: ITeamService;
  private playerTeamService: IPlayerTeamService;
  private teamStatsService: ITeamStatsService;

  constructor(
    @inject("ITeamService") teamService: ITeamService,
    @inject("IPlayerTeamService") playerTeamService: IPlayerTeamService,
    @inject("ITeamStatsService") teamStatsService: ITeamStatsService
  ) {
    this.teamService = teamService;
    this.playerTeamService = playerTeamService;
    this.teamStatsService = teamStatsService;
  }

  async createTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: "Team Name is required" });
      return;
    }

    try {
      const team = await this.teamService.createTeam(name);
      const file = req.file;

      // if (file) {
      //   const imgUrl = await this.teamService.setTeamImage(team.id, file);
      //   team.imgUrl = imgUrl;
      // }
      res.status(201).json(team);
    } catch (error: any) {
      next(error);
    }
  }

  async renameTeam(req: Request, res: Response, next: NextFunction) {
    const { id: teamId } = req.params;
    const { name } = req.body;
    if (!teamId || !name) {
      res.status(400).json({ error: "bad data" });
      return;
    }

    try {
      await this.teamService.renameTeam(teamId, name);
      res.sendStatus(200);
    } catch (error: any) {
      next(error);
    }
  }

  async addPlayerToTeam(req: Request, res: Response, next: NextFunction) {
    const { id: teamId } = req.params;
    const { playerId } = req.body;

    if (!teamId || !playerId) {
      res.status(404).send({ message: "Missing data" });
      return;
    }

    try {
      await this.playerTeamService.addPlayerToTeam(playerId, teamId);
      res.sendStatus(200);
    } catch (error: any) {
      next(error);
    }
  }
  async removePlayerFromTeam(req: Request, res: Response, next: NextFunction) {
    const { id: teamId } = req.params;
    const { playerId } = req.body;

    if (!teamId || !playerId) {
      res.status(404).send({ message: "Missing data" });
      return;
    }

    try {
      await this.playerTeamService.removePlayerFromTeam(playerId, teamId);
      res.sendStatus(200);
    } catch (error: any) {
      next(error);
    }
  }

  async setTeamImage(req: Request, res: Response, next: NextFunction) {
    const { id: teamId } = req.params;

    const file = req.file;

    if (!file || !teamId) {
      return res.status(400).json({
        message: "No teamId or file provided",
      });
    }

    try {
      const imgUrl = await this.teamService.setTeamImage(teamId, file);
      res.json(imgUrl);
    } catch (err) {
      next(err);
    }
  }

  async getTeamPlayers(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: teamId } = req.params;

    if (!teamId) {
      res.status(400).send({ message: "No teamId provided" });
      return;
    }

    try {
      const team = await this.teamService.getTeamPlayers(teamId);
      res.json(team);
    } catch (error: any) {
      next(error);
    }
  }

  async getTeamPlayersStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: teamId } = req.params;

    if (!teamId) {
      res.status(400).send({ message: "Required parameters: teamId, leagueId, seasonNumber" });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    try {
      const teamStats = await this.teamStatsService.getCurrentSeasonTeamPlayersStats(teamId, limit);
      res.json(teamStats);
    } catch (error: any) {
      next(error);
    }
  }
  async getTeamById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: teamId } = req.params;

    if (!teamId) {
      res.status(400).send({ message: "No teamId provided" });
      return;
    }

    try {
      const team = await this.teamService.getTeamById(teamId);
      res.json(team);
    } catch (error: any) {
      next(error);
    }
  }

  async getAdvancedTeamStats(req: Request, res: Response, next: NextFunction) {
    const { id: teamId } = req.params;
    if (!teamId) {
      res.status(400).send({ message: "No teamId provided" });
      return;
    }

    try {
      const teamStats = await this.teamStatsService.getCurrentSeasonTeamStats(teamId);
      res.json(teamStats);
    } catch (error: any) {
      next(error);
    }
  }

  async setTeamCaptain(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: teamId } = req.params;
    const { captainId } = req.body;

    try {
      await this.teamService.setTeamCaptain(teamId, captainId);
      res.sendStatus(204);
    } catch (error: any) {
      next(error);
    }
  }
}

import { NextFunction, Request, Response } from "express";
import { AddTeamRequest } from "../../types-changeToNPM/shared-DTOs";
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

  async createAndAddTeamToLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
    const teamData = req.body as AddTeamRequest;

    try {
      const team = await this.teamService.createAndAddTeamToLeague(teamData);
      const file = req.file;

      if (file) {
        const imgUrl = await this.teamService.setTeamLogoImage(team.id, file);
        team.imgUrl = imgUrl;
      }
      res.status(201).json(team);
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
      await this.teamService.setTeamLogoImage(teamId, file);
      res.sendStatus(200);
    } catch (err) {
      next(err);
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

export default TeamController;

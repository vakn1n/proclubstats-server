import { NextFunction, Request, Response } from "express";
import TeamService from "../services/team-service";
import ImageService from "../services/images-service";
import { AddTeamRequest } from "../../types-changeToNPM/shared-DTOs";

class TeamController {
  private teamService: TeamService;
  private static instance: TeamController;

  private imageService: ImageService;

  private constructor() {
    this.teamService = TeamService.getInstance();
    this.imageService = ImageService.getInstance();
  }

  static getInstance(): TeamController {
    if (!this.instance) {
      this.instance = new TeamController();
    }
    return this.instance;
  }

  async createAndAddTeamToLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
    const teamData = req.body as AddTeamRequest;

    const file = req.file;

    try {
      if (file) {
        const imgUrl = await this.imageService.uploadImage(file);
        teamData.imgUrl = imgUrl;
      }
      const team = await this.teamService.createAndAddTeamToLeague(teamData);
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

import { NextFunction, Request, Response } from "express";
import { PlayerTeamService, TeamLeagueService, TeamService } from "../services";

class TeamController {
  private teamService: TeamService;
  private teamLeagueService: TeamLeagueService;
  private playerTeamService: PlayerTeamService;

  constructor(teamService: TeamService, teamLeagueService: TeamLeagueService, playerTeamService: PlayerTeamService) {
    console.log(`team controller initialized`);

    this.teamService = teamService;
    this.teamLeagueService = teamLeagueService;
    this.playerTeamService = playerTeamService;
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

      if (file) {
        const imgUrl = await this.teamService.setTeamLogoImage(team.id, file);
        team.imgUrl = imgUrl;
      }
      res.status(201).json(team);
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
      await this.playerTeamService.addPlayerToTeam(teamId, playerId);
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
      await this.teamService.setTeamLogoImage(teamId, file);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }

  async deleteTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: teamId } = req.params;
    try {
      await this.teamLeagueService.deleteTeam(teamId);
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

import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";
import { CreatePlayerDataRequest } from "../../types-changeToNPM/shared-DTOs";
import PlayerService from "../services/player-service";
import PlayerTeamService from "../services/player-team-service";

@injectable()
export default class PlayerController {
  private playerService: PlayerService;
  private playerTeamService: PlayerTeamService;

  constructor(playerService: PlayerService, playerTeamService: PlayerTeamService) {
    this.playerService = playerService;
    this.playerTeamService = playerTeamService;
  }

  async createPlayer(req: Request, res: Response, next: NextFunction): Promise<void> {
    // TODO: add validation
    const playerData = req.body as CreatePlayerDataRequest;

    const file = req.file;

    try {
      const player = await this.playerService.createPlayer(playerData);
      if (file) {
        const imgUrl = await this.playerService.setPlayerImage(player.id, file);
        player.imgUrl = imgUrl;
      }

      res.status(201).json(player);
    } catch (error: any) {
      next(error);
    }
  }

  async setPlayerImage(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const file = req.file;

    if (!file || !id) {
      return res.status(400).json({
        message: "Bad request",
      });
    }

    try {
      const imgUrl = await this.playerService.setPlayerImage(id, file);
      res.status(200).json(imgUrl);
    } catch (error: any) {
      next(error);
    }
  }

  async getPlayerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).send({ message: "no id provided" });
      return;
    }

    try {
      const player = await this.playerService.getPlayerById(id);
      res.json(player);
    } catch (error: any) {
      next(error);
    }
  }

  async getAllPlayers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const players = await this.playerService.getAllPlayers();
      res.json(players);
    } catch (error: any) {
      next(error);
    }
  }

  async deletePlayer(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).send({ message: "no id provided" });
      return;
    }
    try {
      await this.playerTeamService.deletePlayer(id);
      res.sendStatus(204);
    } catch (error: any) {
      next(error);
    }
  }
}

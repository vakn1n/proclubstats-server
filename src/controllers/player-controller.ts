import { NextFunction, Request, Response } from "express";
import PlayerService from "../services/player-service";
import logger from "../logger";

export type AddPlayerDataRequest = {
  name: string;
  phone?: string;
  imgUrl?: string;
  age: number;
  teamId: string;
  position: string;
  playablePositions: string[];
};

export default class PlayerController {
  private static instance: PlayerController;
  private playerService: PlayerService;

  private constructor() {
    this.playerService = PlayerService.getInstance();
  }

  static getInstance(): PlayerController {
    if (!this.instance) {
      this.instance = new PlayerController();
    }
    return this.instance;
  }

  async addPlayer(req: Request, res: Response, next: NextFunction): Promise<void> {
    const playerData = req.body as AddPlayerDataRequest;

    // TODO: get image file, upload it to cloudinary, get imgUrl, save it into AddPlayerDataRequest

    try {
      const player = await this.playerService.addPlayer(playerData);
      res.status(201).json(player);
    } catch (error: any) {
      next(error);
    }
  }

  async getPlayerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    logger.info(`getting player with id ${id}`);

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

    try {
      await this.playerService.deletePlayer(id);
      res.status(204).send(); // 204 No Content
    } catch (error: any) {
      next(error);
    }
  }
}

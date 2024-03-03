import { NextFunction, Request, Response } from "express";
import PlayerService from "../services/player-service";

class PlayerController {
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
    try {
      const { playerData } = req.body;

      // TODO: validate data
      const player = await this.playerService.addPlayer(playerData);
      res.status(201).json(player);
    } catch (error: any) {
      next(error);
    }
  }

  async getPlayerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    console.log(`getting player with id ${id}`); //TODO: switch to logger

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
}

export default PlayerController;

import { NextFunction, Request, Response } from "express";
import PlayerService from "../services/player-service";
import logger from "../logger";
import { AddPlayerDataRequest } from "../../types-changeToNPM/shared-DTOs";
import ImageService from "../services/images-service";
import BadRequestError from "../errors/bad-request-error";

export default class PlayerController {
  private static instance: PlayerController;
  private playerService: PlayerService;
  private imageService: ImageService;

  private constructor() {
    this.playerService = PlayerService.getInstance();
    this.imageService = ImageService.getInstance();
  }

  static getInstance(): PlayerController {
    if (!this.instance) {
      this.instance = new PlayerController();
    }
    return this.instance;
  }

  async addPlayer(req: Request, res: Response, next: NextFunction): Promise<void> {
    // TODO: add validation
    const playerData = req.body as AddPlayerDataRequest;

    if (!req.file) {
      throw new BadRequestError(`no file`);
    }
    const file = req.file;

    // TODO: get image file, upload it to cloudinary, get imgUrl, save it into AddPlayerDataRequest

    try {
      const imgUrl = await this.imageService.uploadImage(file);
      // Add the imgUrl to playerData
      playerData.imgUrl = imgUrl;
      // const player = await this.playerService.addPlayer(playerData);
      await this.playerService.addPlayer(playerData);
      // res.status(201).json(player);
      res.sendStatus(201);
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

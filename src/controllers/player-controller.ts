import { CreatePlayerDataRequest } from "@pro-clubs-manager/shared-dtos";
import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IPlayerController } from "../interfaces/player";
import { IPlayerService } from "../interfaces/player/player-service.interface";
import { IPlayerTeamService } from "../interfaces/wrapper-services/player-team-service.interface";
import Player, { IPlayerSeason } from "../models/player";
import Team from "../models/team";
import { Types } from "mongoose";

@injectable()
export default class PlayerController implements IPlayerController {
  private playerService: IPlayerService;
  private playerTeamService: IPlayerTeamService;

  constructor(@inject("IPlayerService") playerService: IPlayerService, @inject("IPlayerTeamService") playerTeamService: IPlayerTeamService) {
    this.playerService = playerService;
    this.playerTeamService = playerTeamService;
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

  async getFreeAgents(req: Request, res: Response, next: NextFunction): Promise<void> {
    const league = new Types.ObjectId("65ecb1eb2f272e434483a821");
    // const leagueTeams = await Team.find({ league: league });
    const players = await Player.find({ team: null });

    await Promise.all(
      players.map(async (player) => {
        player.seasonsHistory = [];
        player.stats = undefined;
        player.save();
      })
    );

    try {
      const freeAgents = await this.playerService.getFreeAgents();
      res.send(freeAgents);
    } catch (e: any) {
      next(e);
    }
  }

  async createPlayer(req: Request, res: Response, next: NextFunction): Promise<void> {
    // TODO: add validation
    const playerData = req.body as CreatePlayerDataRequest;

    const file = req.file;

    try {
      const player = await this.playerService.createPlayer(playerData);
      // if (file) {
      //   const imgUrl = await this.playerService.setPlayerImage(player.id, file);
      //   player.imgUrl = imgUrl;
      // }

      res.status(201).json(player);
    } catch (error: any) {
      next(error);
    }
  }

  async setPlayerImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const file = req.file;

    if (!file || !id) {
      res.status(400).json({
        message: "Bad request",
      });
      return;
    }

    try {
      const imgUrl = await this.playerService.setPlayerImage(id, file);
      res.status(200).json(imgUrl);
    } catch (error: any) {
      next(error);
    }
  }

  async renamePlayer(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    const { newName } = req.body;
    if (!id || !newName || !newName.length) {
      res.status(400).send({ message: "bad data" });
      return;
    }

    try {
      await this.playerService.renamePlayer(id, newName);
      res.status(200);
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

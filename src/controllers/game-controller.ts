import { NextFunction, Request, Response } from "express";
import GameService from "../services/game-service";

export default class GameController {
  private gameService: GameService;
  private static instance: GameController;

  private constructor() {
    this.gameService = GameService.getInstance();
  }

  static getInstance(): GameController {
    if (!this.instance) {
      this.instance = new GameController();
    }
    return this.instance;
  }

  async getGameById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(404).send({ message: "Game not found" });
      return;
    }

    try {
      const game = await this.gameService.getGameById(id);
      res.json(game);
    } catch (error: any) {
      next(error);
    }
  }

  async getAllGames(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const games = await this.gameService.getAllGames();
      res.json(games);
    } catch (error: any) {
      next(error);
    }
  }

  async updateGameResult(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const { result } = req.body;

    if (!result) {
      res.status(400).send({ message: "No result provided" });
      return;
    }

    try {
      await this.gameService.updateGameResult(id, result);
      res.sendStatus(200);
    } catch (error: any) {
      next(error);
    }
  }

  async updateGameStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: leagueId } = req.params;
    const { homeTeamStats, awayTeamStats } = req.body;

    if (!leagueId || !homeTeamStats || !awayTeamStats) {
      res.status(400).send({ message: "No home/away stats provided" });
      return;
    }

    try {
      await this.gameService.updateGameStats(leagueId, homeTeamStats, awayTeamStats);
      res.sendStatus(200);
    } catch (error: any) {
      next(error);
    }
  }

  async deleteGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: leagueId } = req.params;

    if (!leagueId) {
      res.status(400).send({ message: "No leagueId provided" });
      return;
    }
    try {
      await this.gameService.deleteGame(leagueId);
      res.sendStatus(204);
    } catch (error: any) {
      next(error);
    }
  }
}

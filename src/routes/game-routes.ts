import { Router } from "express";
import GameController from "../controllers/game-controller";

import { container } from "../config/container.config";

const router = Router();
const gameController = container.resolve(GameController);

router.get("/:id", (req, res, next) => gameController.getGameById(req, res, next));
router.get("/team/:teamId", (req, res, next) => gameController.getCurrentSeasonTeamGames(req, res, next));

router.put("/:id/updateResult", (req, res, next) => gameController.updateGameResult(req, res, next));
router.put("/:id/technical-loss", (req, res, next) => gameController.setTechincalResult(req, res, next));
router.put("/:id/teamPlayersPerformance", (req, res, next) => gameController.updateTeamPlayersPerformance(req, res, next));

router.delete("/:id", (req, res, next) => gameController.deleteGame(req, res, next));

export default router;

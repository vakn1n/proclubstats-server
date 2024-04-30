import { Router } from "express";
import GameController from "../controllers/game-controller";
import { container } from "tsyringe";

const router = Router();
const gameController = container.resolve(GameController);

router.get("/:id", gameController.getGameById);
router.get("/team/:teamId", gameController.getTeamGames);

router.put("/:id/updateResult", gameController.updateGameResult);
router.put("/:id/teamPlayersPerformance", gameController.updateTeamPlayersPerformance);

router.delete("/:id", gameController.deleteGame);

export default router;

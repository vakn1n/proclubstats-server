import { Router } from "express";
import GameController from "../controllers/game-controller";

const router = Router();
const gameController = GameController.getInstance();

router.get("/:id", gameController.getGameById.bind(gameController));

router.put("/:id/updateResult", gameController.updateGameResult.bind(gameController));
router.put("/:id/teamPlayersPerformance", gameController.updateTeamPlayersPerformance.bind(gameController));

router.delete("/:id", gameController.deleteGame.bind(gameController));

export default router;

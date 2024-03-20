import { Router } from "express";
import PlayerController from "../controllers/player-controller";

const router = Router();
const playerController = PlayerController.getInstance();

router.post("/", playerController.addPlayer.bind(playerController));
router.get("/:id", playerController.getPlayerById.bind(playerController));
router.get("/", playerController.getAllPlayers.bind(playerController));
router.delete("/:id", playerController.deletePlayer.bind(playerController));
export default router;

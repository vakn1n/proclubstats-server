import { Router } from "express";
import PlayerController from "../controllers/player-controller";

const router = Router();
const playerController = PlayerController.getInstance();

router.post("/", playerController.addPlayer);
router.get("/:id", playerController.getPlayerById);
router.get("/", playerController.getAllPlayers);

export default router;

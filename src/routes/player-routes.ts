import { Router } from "express";
import PlayerController from "../controllers/player-controller";
import upload from "../multer-config";

const router = Router();
const playerController = PlayerController.getInstance();

router.post("/", upload.single("file"), playerController.addPlayer.bind(playerController));

router.put("/:id/setImage", upload.single("file"), playerController.setPlayerImage.bind(playerController));

router.get("/:id", playerController.getPlayerById.bind(playerController));
router.get("/", playerController.getAllPlayers.bind(playerController));
router.delete("/:id", playerController.deletePlayer.bind(playerController));

export default router;

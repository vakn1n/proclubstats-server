import { Router } from "express";
import PlayerController from "../controllers/player-controller";
import upload from "../multer-config";
import { container } from "tsyringe";
import { PlayerService } from "../services";

const router = Router();

const playerController = container.resolve(PlayerController);

router.post("/", upload.single("file"), playerController.createPlayer);

router.patch("/:id/setImage", upload.single("file"), playerController.setPlayerImage);

router.get("/:id", playerController.getPlayerById);
router.delete("/:id", playerController.deletePlayer);

export default router;

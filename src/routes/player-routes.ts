import { Router } from "express";
import PlayerController from "../controllers/player-controller";
import upload from "../config/multer-config";
import { container } from "../config/container.config";

const router = Router();

const playerController = container.resolve(PlayerController);

router.post("/", upload.single("file"), playerController.createPlayer);

router.patch("/:id/setImage", upload.single("file"), playerController.setPlayerImage);

router.get("/:id", playerController.getPlayerById);
router.delete("/:id", playerController.deletePlayer);

export default router;

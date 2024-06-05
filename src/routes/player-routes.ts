import { Router } from "express";
import PlayerController from "../controllers/player-controller";
import upload from "../config/multer-config";
import { container } from "../config/container.config";

const router = Router();

const playerController = container.resolve(PlayerController);

router.post("/", upload.single("file"), (req, res, next) => playerController.createPlayer(req, res, next));

router.patch("/:id/setImage", upload.single("file"), (req, res, next) => playerController.setPlayerImage(req, res, next));

router.get("/:id", (req, res, next) => playerController.getPlayerById(req, res, next));
router.delete("/:id", (req, res, next) => playerController.deletePlayer(req, res, next));

export default router;

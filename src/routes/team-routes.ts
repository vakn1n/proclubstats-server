import { Router } from "express";
import TeamController from "../controllers/team-controller";
import upload from "../config/multer-config";
import { container } from "../config/container.config";

const router = Router();
const teamController = container.resolve(TeamController);

router.post("/", upload.single("file"), teamController.createTeam);

router.put("/:id/addPlayer", teamController.addPlayerToTeam);

router.patch("/:id/setImage", upload.single("file"), teamController.setTeamImage);
router.patch("/:id/setCaptain", teamController.setTeamCaptain);

router.get("/:id/players", teamController.getTeamPlayers);
router.get("/:id", teamController.getTeamById);

// router.delete("/:id", teamController.deleteTeam);

export default router;

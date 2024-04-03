import { Router } from "express";
import TeamController from "../controllers/team-controller";
import upload from "../multer-config";

const router = Router();
const teamController = TeamController.getInstance();

router.post("/", upload.single("file"), teamController.createAndAddTeamToLeague.bind(teamController));
router.post("/:id/setCaptain", teamController.setTeamCaptain.bind(teamController));

router.get("/:id/players", teamController.getTeamPlayers.bind(teamController));
router.get("/:id", teamController.getTeamById.bind(teamController));

router.delete("/:id", teamController.deleteTeam.bind(teamController));

export default router;

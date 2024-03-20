import { Router } from "express";
import TeamController from "../controllers/team-controller";

const router = Router();
const teamController = TeamController.getInstance();

router.post("/", teamController.createTeam.bind(teamController));
router.get("/:id", teamController.getTeamById.bind(teamController));
router.get("/", teamController.getAllTeams.bind(teamController));
router.delete("/:id", teamController.deleteTeam.bind(teamController));

export default router;

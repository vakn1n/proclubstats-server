import { Router } from "express";
import TeamController from "../controllers/team-controller";

const router = Router();
const teamController = TeamController.getInstance();

router.post("/", teamController.addTeamToLeague);
router.put("/:id", teamController.update);
router.delete("/:id", teamController.removeTeamFromLeague);
router.get("/:id", teamController.getTeamById);
router.get("/", teamController.getAllTeams);

export default router;

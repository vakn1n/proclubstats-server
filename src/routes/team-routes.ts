import { Router } from "express";
import TeamController from "../controllers/team-controller";
import upload from "../config/multer-config";
import { container } from "../config/container.config";

const router = Router();
const teamController = container.resolve(TeamController);

router.post("/", upload.single("file"), (req, res, next) => teamController.createTeam(req, res, next));

router.put("/:id/addPlayer", (req, res, next) => teamController.addPlayerToTeam(req, res, next));

router.patch("/:id/setImage", upload.single("file"), (req, res, next) => teamController.setTeamImage(req, res, next));
router.patch("/:id/setCaptain", (req, res, next) => teamController.setTeamCaptain(req, res, next));
router.patch("/:id/rename", (req, res, next) => teamController.renameTeam(req, res, next));

router.get("/:id/advancedStats", (req, res, next) => teamController.getAdvancedTeamStats(req, res, next));
router.get("/:id/players", (req, res, next) => teamController.getTeamPlayers(req, res, next));
router.get("/:id", (req, res, next) => teamController.getTeamById(req, res, next));

// router.delete("/:id", teamController.deleteTeam);

export default router;

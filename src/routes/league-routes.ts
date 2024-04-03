import { Router } from "express";
import LeagueController from "../controllers/league-controller";
import upload from "../multer-config";

const router = Router();
const leagueController = LeagueController.getInstance();

router.post("/", upload.single("file"), leagueController.addLeague.bind(leagueController));

router.delete("/:id", leagueController.removeLeague.bind(leagueController));

router.get("/:id", leagueController.getLeagueById.bind(leagueController));
router.get("/", leagueController.getAllLeagues.bind(leagueController));
router.get("/:id/topScorers", leagueController.getTopScorers.bind(leagueController));
router.get("/:id/topAssists", leagueController.getTopAssists.bind(leagueController));
router.get("/:id/table", leagueController.getLeagueTable.bind(leagueController));

export default router;

import { Router } from "express";
import LeagueController from "../controllers/league-controller";

const router = Router();
const leagueController = LeagueController.getInstance();

router.post("/", leagueController.addLeague);
router.delete("/:id", leagueController.removeLeague);
router.get("/:id", leagueController.getLeagueById);
router.get("/", leagueController.getAllLeagues);
router.get("/topScorers", leagueController.getTopcScorers);
router.get("/topAssists", leagueController.getTopAssists);

export default router;

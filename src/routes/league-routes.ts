import { Router } from "express";
import LeagueController from "../controllers/league-controller";
import upload from "../config/multer-config";
import { container } from "../config/container.config";

const router = Router();
const leagueController = container.resolve(LeagueController);

router.post("/", upload.single("file"), leagueController.createLeague);
router.post("/:id/generateFixtures", leagueController.generateLeagueFixtures);
router.post("/:id/createFixture", leagueController.createLeagueFixture);

router.put("/:id/addTeam", leagueController.addTeamToLeague);

router.delete("/:id", leagueController.deleteLeague);

router.get("/:id", leagueController.getLeagueById);
router.get("/", leagueController.getAllLeagues);
router.get("/:id/topScorers", leagueController.getTopScorers);
router.get("/:id/topAssists", leagueController.getTopAssists);
router.get("/:id/table", leagueController.getLeagueTable);

export default router;

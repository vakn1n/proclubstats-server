import { Router } from "express";
import LeagueController from "../controllers/league-controller";
import upload from "../config/multer-config";
import { container } from "../config/container.config";

const router = Router();
const leagueController = container.resolve(LeagueController);

router.post("/", upload.single("file"), (req, res, next) => leagueController.createLeague(req, res, next));
router.post("/:id/generateFixtures", (req, res, next) => leagueController.generateLeagueFixtures(req, res, next));
router.post("/:id/createFixture", (req, res, next) => leagueController.createLeagueFixture(req, res, next));
router.post("/:id/newSeason", (req, res, next) => leagueController.startNewSeason(req, res, next));

router.put("/:id/addTeam", (req, res, next) => leagueController.addTeamToLeague(req, res, next));
router.put("/:id/removeTeam", (req, res, next) => leagueController.removeTeamFromLeague(req, res, next));

router.delete("/:id", (req, res, next) => leagueController.deleteLeague(req, res, next));

router.get("/:id", (req, res, next) => leagueController.getLeagueById(req, res, next));
router.get("/", (req, res, next) => leagueController.getAllLeagues(req, res, next));
router.get("/:id/advancedPlayersStats", (req, res, next) => leagueController.getAdvancedPlayersStats(req, res, next));
router.get("/:id/advancedTeamsStats", (req, res, next) => leagueController.getAdvancedTeamsStats(req, res, next));
router.get("/:id/topScorers", (req, res, next) => leagueController.getTopScorers(req, res, next));
router.get("/:id/topAssists", (req, res, next) => leagueController.getTopAssists(req, res, next));
router.get("/:id/topAvgRating", (req, res, next) => leagueController.getTopAvgRating(req, res, next));
router.get("/:id/table", (req, res, next) => leagueController.getLeagueTable(req, res, next));

export default router;

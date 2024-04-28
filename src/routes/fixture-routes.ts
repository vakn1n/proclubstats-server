import { Router } from "express";
import FixtureController from "../controllers/fixture-controller";

const router = Router();
const fixtureController = FixtureController.getInstance();

router.get("/:id", fixtureController.getFixtureById.bind(fixtureController));
router.get("/league/:leagueId/round/:round/games", fixtureController.getLeagueFixtureGames.bind(fixtureController));
router.get("/league/:leagueId/paginatedGames", fixtureController.getPaginatedLeagueFixturesGames.bind(fixtureController));

router.delete("/:leagueId/allFixtures", fixtureController.deleteAllLeagueFixtures.bind(fixtureController));

export default router;

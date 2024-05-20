import { Router } from "express";
import FixtureController from "../controllers/fixture-controller";
import { container } from "tsyringe";

const router = Router();
const fixtureController = container.resolve(FixtureController);

router.get("/:id", fixtureController.getFixtureById);
router.get("/league/:leagueId/round/:round/games", fixtureController.getLeagueFixtureGames);
router.get("/league/:leagueId/paginatedGames", fixtureController.getPaginatedLeagueFixturesGames);

export default router;

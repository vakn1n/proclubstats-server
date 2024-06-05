import { Router } from "express";
import FixtureController from "../controllers/fixture-controller";
import { container } from "../config/container.config";

const router = Router();
const fixtureController = container.resolve(FixtureController);

router.get("/:id", (req, res, next) => fixtureController.getFixtureById(req, res, next));
router.get("/league/:leagueId/round/:round/games", (req, res, next) => fixtureController.getLeagueFixtureGames(req, res, next));
router.get("/league/:leagueId/paginatedGames", (req, res, next) => fixtureController.getPaginatedLeagueFixturesGames(req, res, next));

export default router;

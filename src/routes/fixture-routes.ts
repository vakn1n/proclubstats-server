import { Router } from "express";
import FixtureController from "../controllers/fixture-controller";

const router = Router();
const fixtureController = FixtureController.getInstance();

router.get("/:id", fixtureController.getFixtureById.bind(fixtureController));
router.get("/:id/games", fixtureController.getFixtureGames.bind(fixtureController));

export default router;

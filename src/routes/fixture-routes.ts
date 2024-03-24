import { Router } from "express";
import FixtureController from "../controllers/fixture-controller";

const router = Router();
const fixtureController = FixtureController.getInstance();

router.post("/", fixtureController.addFixture.bind(fixtureController));

router.get("/", fixtureController.getAllFixtures.bind(fixtureController));
router.get("/:id", fixtureController.getFixtureById.bind(fixtureController));

router.put("/:id/updateResult", fixtureController.updateFixtureResult.bind(fixtureController));
router.put("/:id/updateStats", fixtureController.updateFixtureStats.bind(fixtureController));

router.delete("/:id", fixtureController.deleteFixture.bind(fixtureController));

export default router;

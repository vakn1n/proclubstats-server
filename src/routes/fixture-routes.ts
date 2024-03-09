import { Router } from "express";
import FixtureController from "../controllers/fixture-controller";

const router = Router();
const fixtureController = FixtureController.getInstance();

router.post("/", fixtureController.createFixture.bind(fixtureController));
router.get("/:id", fixtureController.getFixtureById).bind(fixtureController);
router.get("/", fixtureController.getAll.bind(fixtureController));

export default router;

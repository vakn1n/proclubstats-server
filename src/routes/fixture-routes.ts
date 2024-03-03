import { Router } from "express";
import FixtureController from "../controllers/fixture-controller";

const router = Router();
const fixtureController = FixtureController.getInstance();

router.post("/", fixtureController.createFixture);
router.get("/:id", fixtureController.getFixtureById);
router.get("/", fixtureController.getAll);

export default router;

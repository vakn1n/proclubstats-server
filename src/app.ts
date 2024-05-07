import "reflect-metadata";
import { json } from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config(); // set env variables
import express, { Request, Response } from "express";
import morgan from "morgan";
import { connectToDatabase } from "./database";
import { playerRoutes, fixtureRoutes, leagueRoutes, teamRoutes, gameRoutes } from "./routes";
import errorHandlerMiddleware from "./middlewares/error-handler";
import logger from "./logger";
import { container } from "tsyringe";
import { FixtureController, GameController, LeagueController, PlayerController, TeamController } from "./controllers";
import {
  CacheService,
  FixtureService,
  GameService,
  ImageService,
  LeagueService,
  PlayerService,
  PlayerTeamService,
  TeamLeagueService,
  TeamService,
} from "./services";

const app = express();

app.use(cors()); // cross origin requests
app.use(json()); // format
app.use(morgan("dev")); // logger

// const cacheService = new CacheService();

console.log("nsjad");

container.registerSingleton(CacheService);
container.registerSingleton(TeamService);

container.registerSingleton(PlayerTeamService);

container.registerSingleton(LeagueService);

container.registerSingleton(TeamLeagueService);

container.registerSingleton(GameService);

container.registerSingleton(FixtureService);
container.registerSingleton(ImageService);

app.use("/league", leagueRoutes);
app.use("/team", teamRoutes);
app.use("/fixture", fixtureRoutes);
app.use("/game", gameRoutes);
app.use("/player", playerRoutes);

app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    message: "Route Not Found",
  });
});

app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  });

import "reflect-metadata";
import { json } from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import morgan from "morgan";
import { connectToDatabase } from "./config/database";
import logger from "./config/logger";
import errorHandlerMiddleware from "./middlewares/error-handler";
import { fixtureRoutes, gameRoutes, leagueRoutes, playerRoutes, teamRoutes } from "./routes";
import "./config/container.config"; // runs the container configuration

dotenv.config(); // set env variables

const app = express();

app.use(cors()); // cross origin requests
app.use(json()); // format
app.use(morgan("dev")); // logger

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

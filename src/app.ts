import { json } from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { connectToDatabase } from "./database";
import { playerRoutes, fixtureRoutes, leagueRoutes, teamRoutes } from "./routes";
import errorHandlerMiddleware from "./middlewares/error-handler";
import loggerMiddleware from "./middlewares/logger";

const app = express();

app.use(cors()); // cross origin requests
app.use(json()); // format
app.use(morgan("dev")); // logger
dotenv.config(); // set env variables

app.use("/player", playerRoutes);
app.use("/fixture", fixtureRoutes);
app.use("/league", leagueRoutes);
app.use("/team", teamRoutes);

app.use(loggerMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

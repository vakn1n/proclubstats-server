import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import { json } from "body-parser";

const app = express();

app.use(cors()); // cross origin requests
app.use(json()); // format
app.use(morgan("dev")); // logger
dotenv.config(); // set env variables

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000, bitch");
});

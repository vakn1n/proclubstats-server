import mongoose from "mongoose";
import { config } from "dotenv";
config();

const dbName = process.env.RUN_MODE === "prod" ? process.env.MONGODB_DB_PROD : process.env.MONGODB_DB_DEV;
// const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${dbName}?retryWrites=true&w=majority`;
const uri = `mongodb://${process.env.RUN_MODE === "prod" ? process.env.MONGO_DB_HOST_PROD : process.env.MONGO_DB_HOST_DEV}:${
  process.env.MONGO_DB_PORT
}/${dbName}`;

async function connectToDatabase() {
  try {
    await mongoose.connect(uri!, { connectTimeoutMS: 5 * 1000 });
    console.log("Connected to MongoDB on db:", dbName);
  } catch (e) {
    console.log("MongoDB connection error:", e);
  }
}

export { connectToDatabase };

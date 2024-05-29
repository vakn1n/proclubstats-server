import mongoose from "mongoose";

async function connectToDatabase() {
  const connectionString = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@proclubsstatscluster.4f64qtf.mongodb.net/?retryWrites=true&w=majority`;
  await mongoose.connect(connectionString, { connectTimeoutMS: 5 * 1000 });
  console.log("Connected to MongoDB");
}

export { connectToDatabase };

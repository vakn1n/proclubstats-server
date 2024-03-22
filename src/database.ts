import mongoose from "mongoose";

async function connectToDatabase() {
  try {
    const connectionString = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@proclubsstatscluster.4f64qtf.mongodb.net/?retryWrites=true&w=majority`;

    await mongoose.connect(connectionString);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
}

export { connectToDatabase };

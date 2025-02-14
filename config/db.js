// db.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

const connectDb = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  }
};

const closeDb = async () => {
  await client.close();
  console.log("Disconnected from MongoDB");
};

export { client, connectDb, closeDb };

import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGODB_URI, {
  tls: true,
  serverSelectionTimeoutMS: 5000 
});

mongoClient.connect()
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.error("Connection error:", err));

export default mongoClient;
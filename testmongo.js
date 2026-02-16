import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";
const mongoClient = new MongoClient(process.env.MONGODB_URI);
mongoClient.connect()
  .then(() => console.log("mongodb connected!"))
  .catch((err) => console.error("Connection error:", err))
export default mongoClient;
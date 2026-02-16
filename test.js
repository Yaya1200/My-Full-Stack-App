import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const client = new pg.Client({
  connectionString: process.env.PG_URI,
  ssl: { rejectUnauthorized: false },
});

client.connect()
  .then(() => console.log("Postgres connected!"))
  .catch((err) => console.error("Connection error:", err))
export default client;
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const client = new pg.Client({
  user: process.env.PG_USERNAME,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: { rejectUnauthorized: false },
});

client.connect()
  .then(() => console.log("Postgres connected!"))
  .catch((err) => console.error("Connection error:", err))
export default client;
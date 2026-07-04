import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_DB = process.env.MONGODB_DB || "smart-study";

const mongoClient = new MongoClient(MONGODB_URI);
let notes;

app.use(
  cors({
    origin: FRONTEND_URL,
  })
);
app.use(express.json());

/* =========================
   LOGGING (optional)
========================= */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});


app.get("/api/notes", async (req, res) => {
  const data = await notes.find().sort({ createdAt: -1 }).toArray();
  res.json(data);
});

app.post("/api/notes", async (req, res) => {
  const { title, subject, content } = req.body;

  if (!title || !subject || !content) {
    return res.status(400).json({ error: "Title, subject, and content are required" });
  }

  const note = {
    title,
    subject,
    content,
    createdAt: new Date(),
  };

  const result = await notes.insertOne(note);
  res.status(201).json({ ...note, _id: result.insertedId });
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const result = await notes.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Invalid note id" });
  }
});

/* =========================
   START SERVER
========================= */
async function start() {
  await mongoClient.connect();

  const db = mongoClient.db(MONGODB_DB);
  notes = db.collection("notes");

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
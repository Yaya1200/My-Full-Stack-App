import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "smart-study";
const SESSION_SECRET = process.env.SESSION_SECRET || "change-me";

const mongoClient = new MongoClient(MONGODB_URI);
let users;
let notes;

app.use(express.json());

/* =========================
   ✅ FIX 1: CORS (IMPORTANT)
========================= */
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

/* =========================
   ✅ FIX 2: TRUST PROXY
========================= */
app.set("trust proxy", 1);

/* =========================
   ✅ FIX 3: SESSION FIXED
========================= */
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      sameSite: "lax",   // IMPORTANT FOR LOCALHOST
      secure: false      // MUST BE FALSE IN DEV
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* =========================
   LOGGING (optional)
========================= */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

/* =========================
   PASSPORT STRATEGY
========================= */
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await users.findOne({ username });
      if (!user) return done(null, false);

      const matched = await bcrypt.compare(password, user.password);
      if (!matched) return done(null, false);

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await users.findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

/* =========================
   AUTH MIDDLEWARE
========================= */
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Unauthorized" });
};

/* =========================
   SIGNUP
========================= */
app.post("/api/auth/signup", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await users.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ error: "User exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await users.insertOne({
    username,
    password: hashedPassword,
    createdAt: new Date(),
  });

  const user = await users.findOne({ _id: result.insertedId });

  req.login(user, (err) => {
    if (err) return res.status(500).json({ error: "Signup failed" });

    req.session.save(() => {
      res.json({ loggedIn: true, user: { username: user.username } });
    });
  });
});

/* =========================
   LOGIN
========================= */
app.post("/api/auth/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Login failed" });

      req.session.save(() => {
        res.json({ loggedIn: true, user: { username: user.username } });
      });
    });
  })(req, res, next);
});

/* =========================
   LOGOUT
========================= */
app.post("/api/auth/logout", (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

/* =========================
   CHECK USER
========================= */
app.get("/api/auth/user", (req, res) => {
  res.json({
    loggedIn: req.isAuthenticated(),
    user: req.user || null,
  });
});

/* =========================
   NOTES ROUTES
========================= */
app.get("/api/notes", requireAuth, async (req, res) => {
  const data = await notes
    .find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .toArray();

  res.json(data);
});

app.post("/api/notes", requireAuth, async (req, res) => {
  const { title, subject, content } = req.body;

  const note = {
    userId: req.user._id,
    title,
    subject,
    content,
    createdAt: new Date(),
  };

  const result = await notes.insertOne(note);
  res.status(201).json({ ...note, _id: result.insertedId });
});

app.delete("/api/notes/:id", requireAuth, async (req, res) => {
  const id = new ObjectId(req.params.id);

  await notes.deleteOne({
    _id: id,
    userId: req.user._id,
  });

  res.json({ success: true });
});

/* =========================
   START SERVER
========================= */
async function start() {
  await mongoClient.connect();

  const db = mongoClient.db(MONGODB_DB);
  users = db.collection("users");
  notes = db.collection("notes");

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
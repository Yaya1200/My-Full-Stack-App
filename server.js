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
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_DB = process.env.MONGODB_DB || "smart-study";
const SESSION_SECRET = process.env.SESSION_SECRET || "change-me";
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = [FRONTEND_URL, "http://127.0.0.1:5173"];

const mongoClient = new MongoClient(MONGODB_URI);
let users;
let notes;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
if (isProduction) {
  app.set("trust proxy", 1);
}
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: isProduction,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "none",
      secure: isProduction,
      httpOnly: true,
      path: "/",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

passport.use(
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    async (username, password, done) => {
      try {
        console.log("LocalStrategy lookup", { username });
        if (!users) {
          throw new Error("Mongo users collection not initialized");
        }
        const user = await users.findOne({ username });
        if (!user) {
          console.log("LocalStrategy no user found", { username });
          return done(null, false);
        }
        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
          console.log("LocalStrategy invalid password", { username });
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        console.error("LocalStrategy error", err);
        return done(err);
      }
    }
  )
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

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};

app.post("/api/auth/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  try {
    const existingUser = await users.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.insertOne({
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });
    const user = await users.findOne({ _id: result.insertedId });
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Signup failed" });
      }
      req.session.save((saveErr) => {
        if (saveErr) {
          return res.status(500).json({ error: "Signup session save failed" });
        }
        res.json({ loggedIn: true, user: { username: user.username } });
      });
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Server error" });
    }
    if (!user) {
      return res.status(401).json({ loggedIn: false, error: "Invalid username or password" });
    }
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Login failed" });
      }
      req.session.save((saveErr) => {
        if (saveErr) {
          return res.status(500).json({ error: "Login session save failed" });
        }
        res.json({ loggedIn: true, user: { username: user.username } });
      });
    });
  })(req, res, next);
});

app.post("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ success: true });
  });
});

app.get("/api/auth/user", (req, res) => {
  res.json({
    loggedIn: req.isAuthenticated(),
    user: req.user ? { username: req.user.username } : null,
  });
});

app.get("/api/notes", requireAuth, async (req, res) => {
  try {
    const userNotes = await notes.find({ userId: req.user._id }).sort({ createdAt: -1 }).toArray();
    res.json(userNotes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/notes", requireAuth, async (req, res) => {
  const { title, subject, content } = req.body;
  if (!title || !subject || !content) {
    return res.status(400).json({ error: "Title, subject, and content are required" });
  }
  try {
    const note = {
      userId: req.user._id,
      title,
      subject,
      content,
      createdAt: new Date(),
    };
    const result = await notes.insertOne(note);
    res.status(201).json({ ...note, _id: result.insertedId.toString() });
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/notes/:id", requireAuth, async (req, res) => {
  try {
    const noteId = new ObjectId(req.params.id);
    const result = await notes.deleteOne({ _id: noteId, userId: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

async function start() {
  try {
    await mongoClient.connect();
    const database = mongoClient.db(MONGODB_DB);
    users = database.collection("users");
    notes = database.collection("notes");
    await users.createIndex({ username: 1 }, { unique: true });
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err);
  }
}

start();

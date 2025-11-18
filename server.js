import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import pg from "pg";
import cors from "cors";
import bcrypt from "bcrypt";
import env from "dotenv";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";

env.config();

const app = express();
const Port = 5000;


const mongoClient = new MongoClient("mongodb://localhost:27017");
let collection;


const account = new pg.Client({
  user: process.env.PG_USERNAME,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
account.connect();


app.use(express.json());
app.use(cors());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

app.use(passport.initialize());
app.use(passport.session());


passport.use(
  new Strategy(async (username, password, cb) => {
    try {
      const result = await account.query(
        "SELECT * FROM myreactapp WHERE username = $1",
        [username]
      );

      if (result.rows.length === 0) {
        return cb(null, false);
      }

      const user = result.rows[0];

      bcrypt.compare(password, user.password, (err, same) => {
        if (err) return cb(err);
        if (!same) return cb(null, false);
        return cb(null, user);
      });
    } catch (err) {
      return cb(err);
    }
  })
);

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));



async function run() {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("mydatabase");
    collection = db.collection("mycollection");

    app.listen(Port, () =>
      console.log(`Server running on http://localhost:${Port}`)
    );
  } catch (err) {
    console.error("DB Connection Error:", err);
  }
}
run();


app.get("/subject", (req, res) => {
  res.json(req.isAuthenticated());
});


app.get("/api/data", async (req, res) => {
  try {
    const response = await collection.find({}).toArray();
    res.json(response);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Server error" });
  }
});


app.post("/api/data", async (req, res) => {
  try {
    const { title, subject, content } = req.body;
    await collection.insertOne({ title, subject, content });
    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error("Error adding data:", error);
    res.status(500).json({ error: "Server error" });
  }
});


app.post("/api/input/account", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await account.query(
      "SELECT * FROM myreactapp WHERE username = $1",
      [username]
    );

    if (result.rows.length > 0) {
      return res.json("Username already exists");
    }

    const hashed = await bcrypt.hash(password, 10);

    const insert = await account.query(
      "INSERT INTO myreactapp (username, password) VALUES ($1, $2) RETURNING *",
      [username, hashed]
    );

    const user = insert.rows[0];

    req.login(user, (err) => {
      if (err) return res.json(false);
      res.json("the user is saved");
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json("Server error");
  }
});


app.post("/api/create/account", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err || !user) return res.json(false);

    req.login(user, (err) => {
      if (err) return res.json(false);
      return res.json(true);
    });
  })(req, res, next);
});


app.delete("/api/data/:id", async (req, res) => {
  try {
    await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

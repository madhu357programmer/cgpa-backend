const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");

const app = express();

/* ---------- BODY PARSER ---------- */
app.use(express.json());

/* ---------- CORS ---------- */
app.use(cors({
  origin: true,
  credentials: true
}));

/* ---------- SESSION ---------- */
app.use(session({
  secret: "jino_secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cgpa_portal"
  }),
  cookie: {
    sameSite: "none",
    secure: true,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

/* ---------- SERVE FRONTEND FILES ---------- */
app.use(express.static(path.join(__dirname, "../cgpafinal")));

/* ---------- DATABASE CONNECTION ---------- */
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cgpa_portal")
.then(() => {
  console.log("MongoDB Connected to:", process.env.MONGO_URI ? "Atlas" : "Local");
})
.catch((err) => {
  console.log("DB Error:", err.message);
});

/* ---------- ROUTES ---------- */
app.use("/auth", require("./routes/authroutes"));
app.use("/batch", require("./routes/batchroutes"));
app.use("/staff", require("./routes/staffroutes"));

/* ---------- SEED ROUTE (DELETE AFTER USE) ---------- */


/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} in use, retrying...`);
    setTimeout(() => server.listen(PORT), 1000);
  }
});
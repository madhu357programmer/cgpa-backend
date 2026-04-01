const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
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
  cookie: {
    sameSite: "lax",
    secure: false,
    httpOnly: true
  }
}));

/* ---------- SERVE FRONTEND FILES ---------- */
app.use(express.static(path.join(__dirname, "../cgpafinal")));

/* ---------- DATABASE CONNECTION ---------- */
mongoose.connect("mongodb://127.0.0.1:27017/cgpa_portal")
.then(() => {
  console.log("MongoDB Connected");
})
.catch((err) => {
  console.log("DB Error:", err);
});

/* ---------- ROUTES ---------- */
app.use("/auth", require("./routes/authroutes"));
app.use("/batch", require("./routes/batchroutes"));
app.use("/staff", require("./routes/staffroutes"));

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
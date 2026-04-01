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
    sameSite: "none",
    secure: true,
    httpOnly: true
  }
}));

/* ---------- SERVE FRONTEND FILES ---------- */
app.use(express.static(path.join(__dirname, "../cgpafinal")));

/* ---------- DATABASE CONNECTION ---------- */
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cgpa_portal")
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

/* ---------- SEED ROUTE (DELETE AFTER USE) ---------- */
app.get('/seed-hods', async (req, res) => {
  const bcrypt = require('bcryptjs');
  const User = require('./models/User');
  const hods = [
    { username: "it_hod", password: "hod123", department: "IT" },
    { username: "cse_hod", password: "hod123", department: "CSE" },
    { username: "ece_hod", password: "hod123", department: "ECE" },
    { username: "eee_hod", password: "hod123", department: "EEE" },
    { username: "mech_hod", password: "hod123", department: "MECH" },
    { username: "civil_hod", password: "hod123", department: "CIVIL" },
    { username: "csecs_hod", password: "hod123", department: "CSECS" },
    { username: "aids_hod", password: "hod123", department: "AIDS" },
    { username: "mba_hod", password: "hod123", department: "MBA" },
    { username: "auto_hod", password: "hod123", department: "AUTOMOBILES" },
    { username: "ei_hod", password: "hod123", department: "E&I" },
  ];
  try {
    for (const hod of hods) {
      const existing = await User.findOne({ username: hod.username });
      if (!existing) {
        const hashed = await bcrypt.hash(hod.password, 10);
        await User.create({ username: hod.username, password: hashed, role: "hod", department: hod.department });
      }
    }
    res.json({ message: "HODs seeded successfully!" });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
app.get('/check-db', (req, res) => {
  const state = mongoose.connection.readyState;
  const states = {0:'disconnected', 1:'connected', 2:'connecting', 3:'disconnecting'};
  res.json({ dbState: states[state] });
});
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
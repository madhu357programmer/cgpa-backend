const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("./models/User");

mongoose.connect("mongodb+srv://cgpa-user:rV.N6NVE3fLf-a2@cluster0.mongodb.net/cgpa", {
  serverSelectionTimeoutMS: 10000
})
.then(async () => {

  const hods = [
    { username: "it_hod",        password: "hod123", department: "IT" },
    { username: "cse_hod",       password: "hod123", department: "CSE" },
    { username: "ece_hod",       password: "hod123", department: "ECE" },
    { username: "eee_hod",       password: "hod123", department: "EEE" },
    { username: "mech_hod",      password: "hod123", department: "MECH" },
    { username: "civil_hod",     password: "hod123", department: "CIVIL" },
    { username: "csecs_hod",     password: "hod123", department: "CSECS" },
    { username: "aids_hod",      password: "hod123", department: "AIDS" },
    { username: "mba_hod",       password: "hod123", department: "MBA" },
    { username: "auto_hod",      password: "hod123", department: "AUTOMOBILES" },
    { username: "ei_hod",        password: "hod123", department: "E&I" },
  ];

  for (const hod of hods) {
    const existing = await User.findOne({ username: hod.username });
    if (existing) {
      console.log(`${hod.username} already exists ✅`);
      continue;
    }
    const hashed = await bcrypt.hash(hod.password, 10);
    await User.create({
      username: hod.username,
      password: hashed,
      role: "hod",
      department: hod.department
    });
    console.log(`${hod.username} created ✅`);
  }

  process.exit();
});
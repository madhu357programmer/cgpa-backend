const express = require("express");
const bcrypt = require("bcryptjs");
const jUser = require("../models/User");

const jRouter = express.Router();

// Create Staff
jRouter.post("/create", async (req, res) => {
  try {
    const { username, password, department } = req.body;

    // ✅ Add this - check if HOD is creating for their own department
    const hodDept = req.session?.user?.department;
    if (hodDept && hodDept !== department) {
      return res.status(403).json({ message: "You can only create staff for your department!" });
    }

    const existing = await jUser.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new jUser({
      username,
      password: hashed,
      role: "staff",
      department
    });

    await user.save();
    res.json({ message: "Staff created" });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
// View Staff
jRouter.get("/view", async (req, res) => {
  try {
    const department = req.session?.user?.department;
    const data = await jUser.find({ 
      role: "staff",
      department: department  // ← filter by HOD's department
    });
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Reset Password
jRouter.post("/reset", async (req, res) => {
  try {
    const { username, password } = req.body;
    const department = req.session?.user?.department;

    // Check if staff belongs to HOD's department
    const staffUser = await jUser.findOne({ username, role: "staff" });
    if (!staffUser) {
      return res.status(404).json({ message: "Staff not found" });
    }
    if (staffUser.department !== department) {
      return res.status(403).json({ message: "You can only reset passwords for your department staff!" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await jUser.updateOne({ username }, { $set: { password: hashed } });
    res.json({ message: "Password updated" });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
// Delete Staff
jRouter.delete("/delete/:username", async (req, res) => {
  try {
    const { username } = req.params;
    await jUser.deleteOne({ username });
    res.json({ message: "Staff deleted" });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = jRouter;
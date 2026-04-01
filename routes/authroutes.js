const express = require("express");
const bcrypt = require("bcryptjs");
const jUser = require("../models/User");

const jRouter = express.Router();

/* ---------- LOGIN ---------- */
jRouter.post("/login", async (req, res) => {
  try {
    const { username, password, role, department } = req.body;

    const user = await jUser.findOne({ username });
    if (!user) return res.status(401).json({ success: false });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false });

    if (user.role !== role) return res.status(401).json({ success: false });

    // Check department for BOTH staff and HOD
    if (user.department !== department) 
      return res.status(401).json({ success: false });

    // Save session
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      department: user.department
    };

    req.session.save(() => {
      res.json({ success: true, user: req.session.user });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ---------- CHECK SESSION ---------- */
jRouter.get("/check-session", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

/* ---------- LOGOUT ---------- */
jRouter.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});
// HOD Reset Own Password
jRouter.post("/reset-own-password", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await jUser.findById(req.session.user.id);

    // Verify current password
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    // Update password
    const hashed = await bcrypt.hash(newPassword, 10);
    await jUser.updateOne({ _id: user._id }, { $set: { password: hashed } });

    res.json({ success: true, message: "Password updated successfully" });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
module.exports = jRouter;
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["staff", "hod"], required: true },
  department: { type: String, required: true }
});

module.exports = mongoose.model("User", userSchema);
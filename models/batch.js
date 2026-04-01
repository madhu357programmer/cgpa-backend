const mongoose = require("mongoose");

const jSem = new mongoose.Schema({
  sem: Number,
  credits: Number
});

const jBatch = new mongoose.Schema({
  batch: { type: String, required: true, unique: true },
  semesters: [jSem],
  students: { type: Array, default: [] } // store full student data including gpas
});

module.exports = mongoose.model("Batch", jBatch);
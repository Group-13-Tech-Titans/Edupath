const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String, // course, project, quiz
  resource: String,

  order: Number,

  isCompleted: { type: Boolean, default: false },
  isUnlocked: { type: Boolean, default: false }
});

const pathwaySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  pathName: String,
  level: String,

  steps: [stepSchema]

}, { timestamps: true });

module.exports = mongoose.model("Pathway", pathwaySchema);
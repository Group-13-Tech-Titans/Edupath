const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String, // course, project, quiz
  resource: String,
  order: Number,

  // User progress trackers (used when assigned to a student)
  isCompleted: { type: Boolean, default: false },
  isUnlocked: { type: Boolean, default: false }
});

const pathwaySchema = new mongoose.Schema({
  // --- ADMIN TEMPLATE FIELDS ---
  isTemplate: { type: Boolean, default: false }, // True if this is an Admin master course
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },

  // --- STUDENT FIELDS (Existing) ---
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pathName: String,
  level: String,

  steps: [stepSchema]
}, { timestamps: true });

module.exports = mongoose.model("Pathway", pathwaySchema);
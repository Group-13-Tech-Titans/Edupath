const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  title: String,
  description: String,
  resources: [
    {
      title: String,
      url: String,
      type: { type: String, default: "video" }
    },
  ],
  order: Number,

  quiz: [{
    question: String,
    options: { type: [String], default: ["", "", "", ""] }, // Always 4 options
    correctAnswerIndex: { type: Number, default: 0 } // 0, 1, 2, or 3
  }],

  // User progress trackers (used when assigned to a student)
  isCompleted: { type: Boolean, default: false },
  isUnlocked: { type: Boolean, default: false },
});

const pathwaySchema = new mongoose.Schema(
  {
    // --- ADMIN TEMPLATE FIELDS ---
    isTemplate: { type: Boolean, default: false }, // True if this is an Admin master course
    originalTemplateId: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["draft", "published", "in-progress", "completed"],
      default: "draft",
    },

    // --- STUDENT FIELDS (Existing) ---
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pathName: String,
    level: String,

    steps: [stepSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Pathway", pathwaySchema);

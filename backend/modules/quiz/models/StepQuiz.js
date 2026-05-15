const mongoose = require("mongoose");

/**
 * StepQuiz Schema
 * Tracks a student's historical attempts at a specific step's quiz.
 */

const stepQuizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pathwayId: { type: mongoose.Schema.Types.ObjectId, ref: "Pathway", required: true },
  stepOrder: { type: Number, required: true },

  // Snapshot of the questions provided during this specific attempt
  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswerIndex: { type: Number, required: true },
    }
  ],

  userAnswers: [Number],

  score: { type: Number, default: 0 },
  isPassed: { type: Boolean, default: false },

  attempt: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model("StepQuiz", stepQuizSchema);
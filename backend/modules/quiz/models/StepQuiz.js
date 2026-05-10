const mongoose = require("mongoose");

/**
 * StepQuiz Schema
 * Tracks a student's historical attempts at a specific step's quiz.
 * Design Pattern: Historical Snapshot (Stores a copy of the questions at the time of the attempt).
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
      // 🟢 FIXED: Changed to Number to align with the Pathway Schema's correctAnswerIndex
      correctAnswerIndex: { type: Number, required: true }, 
    }
  ],

  // 🟢 FIXED: Stores the selected option indices (Numbers) instead of Strings
  userAnswers: [Number], 

  score: { type: Number, default: 0 },
  isPassed: { type: Boolean, default: false },

  attempt: { type: Number, default: 1 }, 
}, { timestamps: true });

module.exports = mongoose.model("StepQuiz", stepQuizSchema);
const mongoose = require("mongoose");

const stepQuizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pathwayId: { type: mongoose.Schema.Types.ObjectId, ref: "Pathway" },

  stepOrder: Number,

  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String,
    }
  ],

  userAnswers: [String],

  score: Number,
  isPassed: { type: Boolean, default: false },

  attempt: { type: Number, default: 1 }, // track retries
}, { timestamps: true });

module.exports = mongoose.model("StepQuiz", stepQuizSchema);
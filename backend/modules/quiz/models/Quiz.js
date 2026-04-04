const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  selectedPath: String, // e.g., "Web Development"

  answers: [
    {
      question: String,
      answer: String,
      score: Number
    }
  ],

  totalScore: Number,

  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"]
  }

}, { timestamps: true });

module.exports = mongoose.model("Quiz", quizSchema);
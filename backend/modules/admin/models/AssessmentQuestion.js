const mongoose = require("mongoose");

const assessmentQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  priority: { type: Number, default: 1 }, 
  answers: [
    { type: String, required: true } 
  ]
}, { timestamps: true });

module.exports = mongoose.model("AssessmentQuestion", assessmentQuestionSchema);
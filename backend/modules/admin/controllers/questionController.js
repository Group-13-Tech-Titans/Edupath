const AssessmentQuestion = require("../models/AssessmentQuestion");

// Get all questions
exports.getQuestions = async (req, res) => {
  try {
    // Sorts by the new 'priority' field instead of 'order'
    const questions = await AssessmentQuestion.find().sort({ priority: 1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch questions", error: error.message });
  }
};

// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const { title, subtitle, priority, answers } = req.body;
    
    const newQuestion = await AssessmentQuestion.create({
      title,
      subtitle,
      priority,
      answers
    });
    
    res.status(201).json({ message: "Question created successfully", question: newQuestion });
  } catch (error) {
    res.status(400).json({ message: "Failed to create question", error: error.message });
  }
};

// Update a question
exports.updateQuestion = async (req, res) => {
  try {
    const { title, subtitle, priority, answers } = req.body;

    const updatedQuestion = await AssessmentQuestion.findByIdAndUpdate(
      req.params.id,
      { title, subtitle, priority, answers },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ message: "Question updated successfully", question: updatedQuestion });
  } catch (error) {
    res.status(400).json({ message: "Failed to update question", error: error.message });
  }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await AssessmentQuestion.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete question", error: error.message });
  }
};
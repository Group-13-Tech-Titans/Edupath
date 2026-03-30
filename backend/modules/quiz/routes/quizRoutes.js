const express = require("express");
const router = express.Router();

const { submitQuiz } = require("../controllers/quizController");
const authMiddleware = require("../../../middleware/authMiddleware");

router.get("/questions", authMiddleware, async (req, res) => {
  // Normally you would fetch these from MongoDB: const questions = await QuestionModel.find();
  // For now, you can just return a hardcoded JSON array here until your DB is seeded.
  res.json([ /* array of questions */ ]);
});

router.post("/submit", authMiddleware, submitQuiz);

module.exports = router;
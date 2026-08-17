const express = require("express");
const router = express.Router();

const {
  generateStepQuiz,
  submitStepQuiz
} = require("../controllers/stepQuizController");

const authMiddleware = require("../../../middleware/authMiddleware");

router.post("/generate", authMiddleware, generateStepQuiz);
router.post("/submit", authMiddleware, submitStepQuiz);

module.exports = router;
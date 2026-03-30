const express = require("express");
const router = express.Router();

const { 
  getQuestions, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion 
} = require("../controllers/questionController");

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// Admin restricted routes for managing questions
router.post("/questions", authMiddleware, roleMiddleware(["admin"]), createQuestion);
router.put("/questions/:id", authMiddleware, roleMiddleware(["admin"]), updateQuestion);
router.delete("/questions/:id", authMiddleware, roleMiddleware(["admin"]), deleteQuestion);

// Get questions (can be used by Admin to view, and we can also use this for the student frontend)
router.get("/questions", authMiddleware, getQuestions);

module.exports = router;
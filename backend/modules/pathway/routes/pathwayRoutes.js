const express = require("express");
const router = express.Router();

const {
  createPathway,
  completeStep,
  getMyPathway,
} = require("../controllers/pathwayController");
const authMiddleware = require("../../../middleware/authMiddleware");

router.post("/generate", authMiddleware, createPathway);

router.post("/complete-step", authMiddleware, completeStep);

router.get("/my", authMiddleware, getMyPathway);

module.exports = router;

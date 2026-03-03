import express from "express";
import Reviewer from "../models/Reviewer.js";

const router = express.Router();

// CREATE reviewer
router.post("/", async (req, res) => {
  try {
    const reviewer = new Reviewer(req.body);
    await reviewer.save();
    res.json({ success: true, reviewer });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET all reviewers
router.get("/", async (req, res) => {
  try {
    const reviewers = await Reviewer.find().sort({ createdAt: -1 });
    res.json(reviewers);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
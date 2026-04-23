const express = require("express");
const bcrypt = require("bcryptjs");
const Reviewer = require("../models/Reviewer");

const router = express.Router();

// GET all reviewers
router.get("/", async (req, res) => {
  try {
    const reviewers = await Reviewer.find().select("-password"); 
    res.json(reviewers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD a reviewer
router.post("/", async (req, res) => {
  try {
    const { name, email, password, expertise } = req.body;

    // Check if email already exists
    const exists = await Reviewer.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newReviewer = await Reviewer.create({ 
      name, 
      email, 
      password: hashedPassword, 
      expertise 
    });
    res.status(201).json(newReviewer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE a reviewer by ID
router.put("/:id", async (req, res) => {
  try {
    const { name, email, password, expertise } = req.body;
    const updateData = { name, email, expertise };

    // If password is provided, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedReviewer = await Reviewer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedReviewer) return res.status(404).json({ message: "Reviewer not found" });

    res.json(updatedReviewer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a reviewer by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedReviewer = await Reviewer.findByIdAndDelete(req.params.id);
    if (!deletedReviewer) return res.status(404).json({ message: "Reviewer not found" });

    res.json({ message: "Reviewer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
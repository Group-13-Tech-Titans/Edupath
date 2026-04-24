const express = require("express");
const Specialization = require("../models/Specialization"); 
const router = express.Router();

// GET all specializations (For Admin to see everything)
router.get("/", async (req, res) => {
  try {
    // Removed { isActive: true } so Admin can see all specializations
    const specializations = await Specialization.find().sort({ name: 1 });
    res.json({ specializations });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch specializations" });
  }
});

// POST a new specialization (For Admin to add new fields)
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Specialization name is required" });

    // Automatically create a slug (e.g., "Graphic Design" -> "graphic-design")
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check if it already exists
    const existing = await Specialization.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "This specialization already exists!" });
    }

    // Save to Database
    const newSpec = await Specialization.create({ 
      name, 
      slug, 
      isActive: true 
    });

    res.status(201).json({ success: true, specialization: newSpec });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create specialization" });
  }
});

module.exports = router;
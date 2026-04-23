const express = require("express");
const Specialization = require("../models/specialization");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const items = await Specialization.find({ isActive: true }).sort({ name: 1 });
    res.json({ specializations: items });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch specializations" });
  }
});

module.exports = router;


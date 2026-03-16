const express = require("express");
const Course = require("../models/course");
const authMiddleware = require("../../auth/middleware/authMiddleware");

const router = express.Router();

// CREATE a course (educator only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const course = await Course.create({
      ...req.body,
      createdByEducatorEmail: req.user.email,
      educatorName: req.user.name,
      status: "pending"
    });
    res.status(201).json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create course" });
  }
});

// GET all courses for the logged-in educator
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find({ createdByEducatorEmail: req.user.email }).sort({ createdAt: -1 });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch courses" });
  }
});

// GET all approved courses (public)
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find({ status: "approved" }).sort({ createdAt: -1 });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch courses" });
  }
});

// GET all courses (admin)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch courses" });
  }
});

// UPDATE course status (admin approve/reject)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update course" });
  }
});

// DELETE a course
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete course" });
  }
});

module.exports = router;

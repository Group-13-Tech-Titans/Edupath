const express = require("express");
const Course = require("../models/course");
const authMiddleware = require("../../auth/middleware/authMiddleware");
const sendEmail = require("../../utils/sendEmail");
const { courseSubmittedEmail, courseReviewedEmail } = require("../../utils/emailTemplates");

const router = express.Router();

// CREATE a course (educator only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const status = req.body.status || "pending";
    const course = await Course.create({
      ...req.body,
      createdByEducatorEmail: req.user.email,
      educatorName: req.user.name,
      status
    });
    res.status(201).json({ course });

    // Send submission email only when published (not when saving a draft)
    if (status === "pending") {
      sendEmail({
        to: req.user.email,
        ...courseSubmittedEmail({
          educatorName: req.user.name,
          educatorEmail: req.user.email,
          courseTitle: course.title,
          category: course.category,
          level: course.level
        })
      }).catch((err) => console.error("Course submitted email failed:", err.message));
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create course" });
  }
});

// UPDATE a course (educator - for editing drafts)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    // Get the old course to check if status is changing to pending
    const oldCourse = await Course.findOne({ _id: req.params.id, createdByEducatorEmail: req.user.email });
    if (!oldCourse) return res.status(404).json({ message: "Course not found" });

    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, createdByEducatorEmail: req.user.email },
      { $set: { ...req.body, educatorName: req.user.name } },
      { new: true }
    );
    res.json({ course });

    // Send submission email if the course is being moved from draft/rejected to pending
    const wasNotPending = oldCourse.status !== "pending";
    if (req.body.status === "pending" && wasNotPending) {
      sendEmail({
        to: req.user.email,
        ...courseSubmittedEmail({
          educatorName: req.user.name,
          educatorEmail: req.user.email,
          courseTitle: course.title,
          category: course.category,
          level: course.level
        })
      }).catch((err) => console.error("Course submitted email failed:", err.message));
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update course" });
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

// UPDATE course status + review (reviewer/admin)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status, decision, rating, notes } = req.body;
    const updateData = { status };
    if (notes || decision || rating) {
      updateData.review = {
        decision: decision || status,
        rating: rating || null,
        notes: notes || "",
        reviewerName: req.user.name,
        reviewerEmail: req.user.email,
        reviewedAt: new Date()
      };
    }
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ course });

    // Send review outcome email to the educator
    if (course.createdByEducatorEmail && (status === "approved" || status === "rejected")) {
      sendEmail({
        to: course.createdByEducatorEmail,
        ...courseReviewedEmail({
          educatorName: course.educatorName,
          educatorEmail: course.createdByEducatorEmail,
          courseTitle: course.title,
          decision: status,
          rating: rating || null,
          notes: notes || "",
          reviewerName: req.user.name
        })
      }).catch((err) => console.error("Course reviewed email failed:", err.message));
    }
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

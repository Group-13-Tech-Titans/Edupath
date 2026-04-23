const express = require("express");
const Course = require("../models/course");
const authMiddleware = require("../../auth/middleware/authMiddleware");
const roleMiddleware = require("../../auth/middleware/roleMiddleware");
const sendEmail = require("../../utils/sendEmail");
const { courseSubmittedEmail, courseReviewedEmail } = require("../../utils/emailTemplates");

const router = express.Router();

function getReviewerSpecializationTags(user) {
  const profile = user.profile || {};
  const values = [
    ...(Array.isArray(user.specializationTags) ? user.specializationTags : []),
    user.specializationTag,
    ...(Array.isArray(profile.specializationTags) ? profile.specializationTags : []),
    ...(Array.isArray(profile.specializations) ? profile.specializations.map((item) => item?.slug || item) : []),
    profile.specialization?.slug
  ];

  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()))];
}

router.post("/", authMiddleware, roleMiddleware(["educator", "admin"]), async (req, res) => {
  try {
    const status = req.body.status || "pending";
    const course = await Course.create({
      ...req.body,
      createdByEducatorEmail: req.user.email,
      educatorName: req.user.name,
      status
    });
    res.status(201).json({ course });

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
      }).catch(() => {});
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create course" });
  }
});

router.put("/:id", authMiddleware, roleMiddleware(["educator", "admin"]), async (req, res) => {
  try {
    const oldCourse = await Course.findOne({ _id: req.params.id, createdByEducatorEmail: req.user.email });
    if (!oldCourse) return res.status(404).json({ message: "Course not found" });

    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, createdByEducatorEmail: req.user.email },
      { $set: { ...req.body, educatorName: req.user.name } },
      { new: true }
    );
    res.json({ course });

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
      }).catch(() => {});
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update course" });
  }
});

router.get("/my", authMiddleware, roleMiddleware(["educator", "admin"]), async (req, res) => {
  try {
    const courses = await Course.find({ createdByEducatorEmail: req.user.email }).sort({ createdAt: -1 });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch courses" });
  }
});

router.get("/reviewer/queue", authMiddleware, roleMiddleware(["reviewer", "admin"]), async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const courses = await Course.find({ status: "pending", trashedAt: null }).sort({ createdAt: -1 });
      return res.json({ courses });
    }

    const specializationTags = getReviewerSpecializationTags(req.user);
    if (specializationTags.length === 0) {
      const allPending = await Course.find({ status: "pending", trashedAt: null }).sort({ createdAt: -1 });
      return res.json({ courses: allPending });
    }

    const tagRegexes = specializationTags.map(
      (tag) => new RegExp(`(^|,\\s*)${tag.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}(\\s*,|$)`, "i")
    );

    const courses = await Course.find({
      status: "pending",
      trashedAt: null,
      $or: [
        ...tagRegexes.map((pattern) => ({ specializationTag: pattern })),
        { category: { $in: specializationTags } }
      ]
    }).sort({ createdAt: -1 });

    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch reviewer queue" });
  }
});

router.get("/", async (req, res) => {
  try {
    const courses = await Course.find({ status: "approved", trashedAt: null }).sort({ createdAt: -1 });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch courses" });
  }
});

router.get("/all", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch courses" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch course" });
  }
});

router.patch("/:id/trash", authMiddleware, roleMiddleware(["educator", "admin"]), async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, createdByEducatorEmail: req.user.email },
      { $set: { trashedAt: new Date() } },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to trash course" });
  }
});

router.patch("/:id/restore", authMiddleware, roleMiddleware(["educator", "admin"]), async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, createdByEducatorEmail: req.user.email },
      { $set: { trashedAt: null } },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to restore course" });
  }
});

router.delete("/trash/empty", authMiddleware, roleMiddleware(["educator", "admin"]), async (req, res) => {
  try {
    const result = await Course.deleteMany({
      createdByEducatorEmail: req.user.email,
      trashedAt: { $ne: null }
    });
    res.json({ success: true, deletedCount: result.deletedCount || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to empty trash" });
  }
});

router.delete("/:id/permanent", authMiddleware, roleMiddleware(["educator", "admin"]), async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      createdByEducatorEmail: req.user.email,
      trashedAt: { $ne: null }
    });
    if (!course) return res.status(404).json({ message: "Trashed course not found" });
    res.json({ success: true, deletedCourseId: course._id });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to permanently delete course" });
  }
});

router.patch("/:id/status", authMiddleware, roleMiddleware(["reviewer", "admin"]), async (req, res) => {
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

    if (status === "approved" || status === "rejected") {
      sendEmail({
        to: course.createdByEducatorEmail,
        ...courseReviewedEmail({
          educatorName: course.educatorName || course.createdByEducatorEmail,
          educatorEmail: course.createdByEducatorEmail,
          courseTitle: course.title,
          decision: status,
          rating: rating || null,
          notes: notes || "",
          reviewerName: req.user.name
        })
      }).catch(() => {});
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update course status" });
  }
});

module.exports = router;


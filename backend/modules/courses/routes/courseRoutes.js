const express = require("express");
const Course = require("../models/course");
const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");
const sendEmail = require("../../../utils/sendEmail");
const { courseSubmittedEmail, courseReviewedEmail } = require("../../../utils/emailTemplates");
const User = require("../../auth/models/User");

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

// GET pending courses matched to the reviewer specializations
router.get("/reviewer/queue", authMiddleware, roleMiddleware(["reviewer", "admin"]), async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const courses = await Course.find({ status: "pending", trashedAt: null }).sort({ createdAt: -1 });
      return res.json({ courses });
    }

    const specializationTags = getReviewerSpecializationTags(req.user);
    // If reviewer has no specialization assigned yet, show all pending courses
    // (so you can still test/review without a tag set in MongoDB)
    if (specializationTags.length === 0) {
      const allPending = await Course.find({ status: "pending", trashedAt: null }).sort({ createdAt: -1 });
      return res.json({ courses: allPending });
    }

    // Courses store specializationTag as a comma-separated string (e.g. "web-development,data-science")
    // so we use regex to check if ANY of the reviewer's tags appear anywhere in that string,
    // rather than doing an exact $in match which would miss multi-tag courses.
    const tagRegexes = specializationTags.map(
      (tag) => new RegExp(`(^|,\\s*)${tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s*,|$)`, "i")
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

// GET all approved courses (public)
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find({ status: "approved", trashedAt: null }).sort({ createdAt: -1 });
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

// GET single course by ID
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch course" });
  }
});

// MOVE course to trash (soft delete)
router.patch("/:id/trash", authMiddleware, async (req, res) => {
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

// RESTORE course from trash
router.patch("/:id/restore", authMiddleware, async (req, res) => {
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

// EMPTY trash (permanently delete all trashed courses for the logged-in educator)
router.delete("/trash/empty", authMiddleware, async (req, res) => {
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

// PERMANENTLY delete one trashed course
router.delete("/:id/permanent", authMiddleware, async (req, res) => {
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

    // Send review result email to educator (non-blocking)
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
      }).catch((err) => console.error("Course reviewed email failed:", err.message));
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update course status" });
  }
});

// ==========================================
// 🟢 NEW: ENROLL IN A COURSE (Student)
// ==========================================
router.post("/enroll/:id", authMiddleware, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    // Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize the array if it doesn't exist yet
    if (!user.enrolledCourses) {
      user.enrolledCourses = [];
    }

    // Check if the student is already enrolled
    const alreadyEnrolled = user.enrolledCourses.find(c => String(c.courseId) === String(courseId));
    
    if (alreadyEnrolled) {
      return res.status(400).json({ message: "You are already enrolled in this course." });
    }

    // Add the course to the user's enrolled list and save
    user.enrolledCourses.push({ courseId });
    await user.save();

    // Strip out the password before sending the updated user back to React
    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({ 
      success: true, 
      user: safeUser, 
      message: "Successfully enrolled!" 
    });
  } catch (err) {
    console.error("Enrollment Error:", err);
    res.status(500).json({ message: err.message || "Failed to enroll in course" });
  }
});

// ==========================================
// 🟢 NEW: ENROLL IN A COURSE (Student)
// ==========================================
router.post("/enroll/:id", authMiddleware, async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // 🟢 FIXED: Safely grab the ID whether it's ._id or .id
    const userId = req.user._id || req.user.id; 

    const User = require("../models/User"); // Ensure this path matches your file structure!
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.enrolledCourses) {
      user.enrolledCourses = [];
    }

    const alreadyEnrolled = user.enrolledCourses.find(c => String(c.courseId) === String(courseId));
    
    if (alreadyEnrolled) {
      return res.status(400).json({ message: "You are already enrolled in this course." });
    }

    user.enrolledCourses.push({ courseId });
    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({ success: true, user: safeUser, message: "Successfully enrolled!" });
  } catch (err) {
    console.error("Enrollment Error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


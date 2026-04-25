const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

const adminController = require("../../admin/controller/adminController");

router.get("/admin", authMiddleware, roleMiddleware(["admin"]), adminController.adminWelcome);
router.post("/admin/create-user", authMiddleware, roleMiddleware(["admin"]), adminController.createAdminUser);

router.get("/admin/reviewers", authMiddleware, roleMiddleware(["admin"]), adminController.getAllReviewers);
router.post("/admin/reviewers", authMiddleware, roleMiddleware(["admin"]), adminController.createReviewer);
router.put("/admin/reviewers/:id", authMiddleware, roleMiddleware(["admin"]), adminController.updateReviewer);
router.delete("/admin/reviewers/:id", authMiddleware, roleMiddleware(["admin"]), adminController.deleteReviewer);

// EDUCATORS
router.get("/admin/educators/pending", authMiddleware, roleMiddleware(["admin"]), adminController.getPendingEducators);
router.patch("/admin/educators/:id/verify", authMiddleware, roleMiddleware(["admin"]), adminController.verifyEducator);
router.patch("/admin/educators/:id/reject", authMiddleware, roleMiddleware(["admin"]), adminController.rejectEducator);

// COURSES
router.get("/admin/courses/pending", authMiddleware, roleMiddleware(["admin"]), adminController.getPendingCourses);
router.get("/admin/courses/stats", authMiddleware, roleMiddleware(["admin"]), adminController.getCourseStats);
router.get("/admin/courses/:id", authMiddleware, roleMiddleware(["admin"]), adminController.getCourseById);
router.patch("/admin/courses/:id/review", authMiddleware, roleMiddleware(["admin"]), adminController.adminReviewCourse);

// DASHBOARD STATS
router.get("/admin/stats/students-growth", authMiddleware, roleMiddleware(["admin"]), adminController.getStudentGrowthStats);

module.exports = router;
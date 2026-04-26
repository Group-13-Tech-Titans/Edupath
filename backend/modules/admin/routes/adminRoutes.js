const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

const adminController = require("../controller/adminController");

router.get("/", authMiddleware, roleMiddleware(["admin"]), adminController.adminWelcome);
router.post("/admin/create-user", authMiddleware, roleMiddleware(["admin"]), adminController.createAdminUser);

router.get("/reviewers", authMiddleware, roleMiddleware(["admin"]), adminController.getAllReviewers);
router.post("/reviewers", authMiddleware, roleMiddleware(["admin"]), adminController.createReviewer);
router.put("/reviewers/:id", authMiddleware, roleMiddleware(["admin"]), adminController.updateReviewer);
router.delete("/reviewers/:id", authMiddleware, roleMiddleware(["admin"]), adminController.deleteReviewer);

// EDUCATORS
router.get("/educators/pending", authMiddleware, roleMiddleware(["admin"]), adminController.getPendingEducators);
router.patch("/educators/:id/verify", authMiddleware, roleMiddleware(["admin"]), adminController.verifyEducator);
router.patch("/educators/:id/reject", authMiddleware, roleMiddleware(["admin"]), adminController.rejectEducator);

// COURSES
router.get("/courses/pending", authMiddleware, roleMiddleware(["admin"]), adminController.getPendingCourses);
router.get("/courses/stats", authMiddleware, roleMiddleware(["admin"]), adminController.getCourseStats);
router.get("/courses/:id", authMiddleware, roleMiddleware(["admin"]), adminController.getCourseById);
router.patch("/courses/:id/review", authMiddleware, roleMiddleware(["admin"]), adminController.adminReviewCourse);

// DASHBOARD STATS
router.get("/stats/students-growth", authMiddleware, roleMiddleware(["admin"]), adminController.getStudentGrowthStats);

module.exports = router;
const express = require("express");
const router = express.Router();

// MIDDLEWARE IMPORTS
const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// CONTROLLER IMPORTS
const authController = require("../controllers/authController");

// PUBLIC ROUTES
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleLogin);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// AUTHENTICATED ROUTES
router.get("/me", authMiddleware, authController.getCurrentUser);
router.patch("/profile", authMiddleware, authController.updateProfile);
router.patch("/change-password", authMiddleware, authController.changePassword);
router.post("/select-role", authMiddleware, authController.selectRole);

// ROLE-SPECIFIC ROUTES
router.get("/educator", authMiddleware, roleMiddleware(["educator"]), authController.educatorWelcome);

router.get("/admin", authMiddleware, roleMiddleware(["admin"]), authController.adminWelcome);
router.post("/admin/create-user", authMiddleware, roleMiddleware(["admin"]), authController.createAdminUser);

// ==========================================
//   ADMIN: REVIEWER MANAGEMENT
// ==========================================
router.get("/admin/reviewers", authMiddleware, roleMiddleware(["admin"]), authController.getAllReviewers);
router.post("/admin/reviewers", authMiddleware, roleMiddleware(["admin"]), authController.createReviewer);
router.put("/admin/reviewers/:id", authMiddleware, roleMiddleware(["admin"]), authController.updateReviewer);
router.delete("/admin/reviewers/:id", authMiddleware, roleMiddleware(["admin"]), authController.deleteReviewer);

// ==========================================
//   ADMIN: EDUCATOR VERIFICATION MANAGEMENT
// ==========================================
router.get("/admin/educators/pending", authMiddleware, roleMiddleware(["admin"]), authController.getPendingEducators);
router.patch("/admin/educators/:id/verify", authMiddleware, roleMiddleware(["admin"]), authController.verifyEducator);
router.patch("/admin/educators/:id/reject", authMiddleware, roleMiddleware(["admin"]), authController.rejectEducator);

// ==========================================
//   ADMIN: COURSE MANAGEMENT
// ==========================================
// Fetch all pending courses
router.get("/admin/courses/pending", authMiddleware, roleMiddleware(["admin"]), authController.getPendingCourses);

// Fetch course statistics
router.get("/admin/courses/stats", authMiddleware, roleMiddleware(["admin"]), authController.getCourseStats);

// Get single course by ID (For Review Panel)
router.get("/admin/courses/:id", authMiddleware, roleMiddleware(["admin"]), authController.getCourseById);

// Submit Admin Review (Approve/Reject)
router.patch("/admin/courses/:id/review", authMiddleware, roleMiddleware(["admin"]), authController.adminReviewCourse);

// ==========================================
//   ADMIN: DASHBOARD STATS (CHARTS)
// ==========================================
// Admin Student Growth Chart Route
router.get("/admin/stats/students-growth", authMiddleware, roleMiddleware(["admin"]), authController.getStudentGrowthStats);

module.exports = router;
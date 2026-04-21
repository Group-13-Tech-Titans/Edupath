const express = require("express");
const router = express.Router();

// MIDDLEWARE IMPORTS
const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// CONTROLLER IMPORTS (Adjust the path to point to your new file)
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
router.get("/admin/reviewers", authMiddleware, roleMiddleware(["admin"]), authController.getAllReviewers);

module.exports = router;
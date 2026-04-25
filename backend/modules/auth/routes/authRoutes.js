const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");
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

module.exports = router;
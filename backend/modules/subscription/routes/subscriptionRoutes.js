const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middleware/authMiddleware");
const subscriptionController = require("../controllers/subscriptionController");

// Authenticated Routes
router.get("/status", authMiddleware, subscriptionController.getStatus);
router.post("/upgrade", authMiddleware, subscriptionController.upgradePlan);
router.post("/cancel", authMiddleware, subscriptionController.cancelPlan);
router.post("/track-view/:courseId", authMiddleware, subscriptionController.trackCourseView);

// PayHere Sandbox Endpoints
router.post("/payhere-init", authMiddleware, subscriptionController.initPayherePayment);
router.post("/payhere-verify", authMiddleware, subscriptionController.verifyPayherePayment);

// PayHere Public Webhook (IPN)
router.post("/payhere-notify", subscriptionController.payhereNotify);

module.exports = router;

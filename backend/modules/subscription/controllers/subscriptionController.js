const User = require("../../auth/models/User");
const subscriptionService = require("../services/subscriptionService");

function toSafeUser(user, subscriptionStatus) {
  const safeUser = user.toObject();
  delete safeUser.password;
  safeUser.id = safeUser._id.toString();
  safeUser.subscription = {
    ...(safeUser.subscription || {}),
    ...(subscriptionStatus || {}),
    plan: subscriptionStatus?.plan || safeUser.subscription?.plan || "free",
    isPremium: subscriptionStatus?.isPremium ?? safeUser.subscription?.plan === "premium",
  };
  return safeUser;
}

/**
 * GET /api/subscription/status
 * Returns current plan status, usage metrics, and limits for the logged-in student.
 */
exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const status = await subscriptionService.normalizeUserSubscription(user);
    res.json({ success: true, subscription: status });
  } catch (err) {
    console.error("Subscription status error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch subscription status" });
  }
};

/**
 * POST /api/subscription/upgrade
 * Upgrades the logged-in student to Premium ($49/mo or $499/yr).
 */
exports.upgradePlan = async (req, res) => {
  try {
    const { billingCycle = "monthly", paymentDetails = {} } = req.body;

    if (!["monthly", "yearly"].includes(billingCycle)) {
      return res.status(400).json({ message: "Invalid billing cycle. Choose 'monthly' or 'yearly'." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedSubscription = await subscriptionService.upgradeToPremium(user, { billingCycle, paymentDetails });

    res.json({
      success: true,
      message: `Successfully upgraded to EduPath Premium (${billingCycle === "yearly" ? "Annual" : "Monthly"})!`,
      subscription: updatedSubscription,
      user: toSafeUser(user, updatedSubscription)
    });
  } catch (err) {
    console.error("Subscription upgrade error:", err);
    res.status(500).json({ message: err.message || "Failed to upgrade subscription" });
  }
};

/**
 * POST /api/subscription/cancel
 * Cancels / downgrades the logged-in student's subscription back to Free.
 */
exports.cancelPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedSubscription = await subscriptionService.cancelSubscription(user);

    res.json({
      success: true,
      message: "Subscription downgraded to Free Plan.",
      subscription: updatedSubscription,
      user: toSafeUser(user, updatedSubscription)
    });
  } catch (err) {
    console.error("Subscription cancellation error:", err);
    res.status(500).json({ message: err.message || "Failed to cancel subscription" });
  }
};

/**
 * POST /api/subscription/track-course-view/:courseId
 * Records a course view and verifies monthly limit on Free plan.
 */
exports.trackCourseView = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await subscriptionService.trackCourseView(user, courseId);

    if (!result.allowed) {
      return res.status(403).json(result);
    }

    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Track course view error:", err);
    res.status(500).json({ message: err.message || "Failed to track course view" });
  }
};

/**
 * POST /api/subscription/payhere-init
 * Generates PayHere Sandbox checkout parameters and MD5 signature hash.
 */
exports.initPayherePayment = async (req, res) => {
  try {
    const { billingCycle = "monthly" } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const paymentData = subscriptionService.generatePayherePayment(user, billingCycle);

    res.json({
      success: true,
      payment: paymentData
    });
  } catch (err) {
    console.error("PayHere init error:", err);
    res.status(500).json({ message: err.message || "Failed to initialize PayHere payment" });
  }
};

/**
 * POST /api/subscription/payhere-verify
 * Client completion verification callback to immediately upgrade the account.
 */
exports.verifyPayherePayment = async (req, res) => {
  try {
    const { billingCycle = "monthly", orderId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedSubscription = await subscriptionService.upgradeToPremium(user, { billingCycle });

    res.json({
      success: true,
      message: "PayHere payment verified successfully! Welcome to Premium.",
      subscription: updatedSubscription,
      user: toSafeUser(user, updatedSubscription)
    });
  } catch (err) {
    console.error("PayHere verify error:", err);
    res.status(500).json({ message: err.message || "Failed to verify PayHere payment" });
  }
};

/**
 * POST /api/subscription/payhere-notify
 * Public IPN Webhook from PayHere server.
 */
exports.payhereNotify = async (req, res) => {
  try {
    const isValidSignature = subscriptionService.verifyPayhereSignature(req.body);

    if (!isValidSignature) {
      console.warn("PayHere IPN invalid signature received:", req.body);
      return res.status(400).send("Invalid signature");
    }

    const { status_code, custom_1: userId, custom_2: billingCycle } = req.body;

    // status_code === '2' means Payment Success in PayHere
    if (String(status_code) === "2" && userId) {
      const user = await User.findById(userId);
      if (user) {
        await subscriptionService.upgradeToPremium(user, { billingCycle: billingCycle || "monthly" });
        console.log(`User ${userId} successfully upgraded via PayHere IPN Webhook.`);
      }
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("PayHere notify IPN error:", err);
    res.status(500).send("Server Error");
  }
};

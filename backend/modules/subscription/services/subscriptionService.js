const crypto = require("crypto");
const Pathway = require("../../pathway/models/Pathway");
const Course = require("../../courses/models/course");

const FREE_COURSE_MONTHLY_LIMIT = 10;
const FREE_LIFETIME_PATHWAY_LIMIT = 3;
const PREMIUM_ACTIVE_PATHWAY_LIMIT = 20;
const PREMIUM_MONTHLY_PRICE = 49;
const PREMIUM_ANNUAL_PRICE = 499;

/**
 * Calculates the next monthly reset date given a start anchor date.
 */
function getNextMonthlyResetDate(cycleStartDate) {
  const start = new Date(cycleStartDate || Date.now());
  const now = new Date();
  
  // Advance months until reset date is strictly in the future
  let next = new Date(start);
  while (next <= now) {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}

/**
 * Calculates the latest cycle start date for the current period.
 */
function getCurrentCycleStartDate(cycleStartDate) {
  const start = new Date(cycleStartDate || Date.now());
  const now = new Date();
  
  let currentStart = new Date(start);
  while (true) {
    const nextMonth = new Date(currentStart);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (nextMonth > now) {
      break;
    }
    currentStart = nextMonth;
  }
  return currentStart;
}

/**
 * Normalizes user subscription state, handles auto-expiration for premium,
 * and handles automatic monthly course usage reset.
 */
async function normalizeUserSubscription(user) {
  let needsSave = false;

  // Initialize subscription object if missing
  if (!user.subscription) {
    user.subscription = {
      plan: "free",
      billingCycle: "monthly",
      status: "active",
      startDate: user.createdAt || new Date(),
      currentPeriodStart: user.createdAt || new Date(),
      currentPeriodEnd: null,
      lastPaymentDate: user.createdAt || new Date(),
      amountPaid: 0,
      currency: "USD",
      autoRenew: true
    };
    needsSave = true;
  }

  const now = new Date();

  // Auto-expire premium if past currentPeriodEnd
  if (
    user.subscription.plan === "premium" &&
    user.subscription.currentPeriodEnd &&
    new Date(user.subscription.currentPeriodEnd) < now
  ) {
    user.subscription.plan = "free";
    user.subscription.status = "expired";
    needsSave = true;
  }

  // Initialize or reset course monthly usage
  if (!user.courseMonthlyUsage || !user.courseMonthlyUsage.cycleStartDate) {
    const anchor = user.subscription?.currentPeriodStart || user.createdAt || now;
    user.courseMonthlyUsage = {
      cycleStartDate: getCurrentCycleStartDate(anchor),
      coursesWatched: []
    };
    needsSave = true;
  } else {
    const currentAnchor = user.courseMonthlyUsage.cycleStartDate;
    const computedCycleStart = getCurrentCycleStartDate(currentAnchor);
    
    // If we have rolled over to a new month cycle, reset course list
    if (computedCycleStart.getTime() > new Date(currentAnchor).getTime()) {
      user.courseMonthlyUsage.cycleStartDate = computedCycleStart;
      user.courseMonthlyUsage.coursesWatched = [];
      needsSave = true;
    }
  }

  // Always query real pathways for student to accurately track active & lifetime count
  const studentPathways = await Pathway.find({ userId: user._id, isTemplate: false }).sort({ createdAt: -1 });
  const activePathwaysCount = studentPathways.length;

  if (
    user.lifetimePathwaysCreatedCount === undefined ||
    user.lifetimePathwaysCreatedCount === null ||
    user.lifetimePathwaysCreatedCount < activePathwaysCount
  ) {
    user.lifetimePathwaysCreatedCount = activePathwaysCount;
    needsSave = true;
  }

  if (needsSave) {
    user.markModified("subscription");
    user.markModified("courseMonthlyUsage");
    await user.save();
  }

  const formattedPathways = studentPathways.map((p) => {
    const totalSteps = p.steps?.length || 0;
    const completedSteps = p.steps?.filter((s) => s.isCompleted)?.length || 0;
    const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    return {
      _id: p._id,
      pathName: p.pathName,
      level: p.level,
      status: p.status,
      totalSteps,
      completedSteps,
      progressPct,
      createdAt: p.createdAt
    };
  });

  // Fetch detailed info of courses enrolled/watched in this monthly cycle
  const watchedCourseItems = user.courseMonthlyUsage?.coursesWatched || [];
  const watchedCourseIds = watchedCourseItems.map((c) => c.courseId);

  let formattedMonthlyCourses = [];
  if (watchedCourseIds.length > 0) {
    const coursesDocs = await Course.find({
      _id: { $in: watchedCourseIds }
    }).select("title description category level thumbnailUrl rating educatorName enrolledCount");

    formattedMonthlyCourses = watchedCourseItems.map((item) => {
      const courseDoc = coursesDocs.find((c) => String(c._id) === String(item.courseId));
      return {
        courseId: item.courseId,
        firstWatchedAt: item.firstWatchedAt,
        title: courseDoc?.title || "Course",
        description: courseDoc?.description || "",
        category: courseDoc?.category || "General",
        level: courseDoc?.level || "All Levels",
        thumbnailUrl: courseDoc?.thumbnailUrl || "",
        rating: courseDoc?.rating || 5,
        educatorName: courseDoc?.educatorName || "EduPath"
      };
    });
  }

  const isPremium = user.subscription?.plan === "premium";
  const monthlyResetDate = getNextMonthlyResetDate(user.courseMonthlyUsage?.cycleStartDate);
  const coursesWatchedCount = watchedCourseItems.length;

  let daysRemaining = null;
  if (isPremium && user.subscription?.currentPeriodEnd) {
    const diffMs = new Date(user.subscription.currentPeriodEnd) - now;
    daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  return {
    plan: user.subscription?.plan || "free",
    isPremium,
    billingCycle: user.subscription?.billingCycle || "monthly",
    status: user.subscription?.status || "active",
    startDate: user.subscription?.startDate,
    currentPeriodStart: user.subscription?.currentPeriodStart,
    currentPeriodEnd: user.subscription?.currentPeriodEnd,
    lastPaymentDate: user.subscription?.lastPaymentDate,
    amountPaid: user.subscription?.amountPaid || 0,
    currency: user.subscription?.currency || "USD",
    daysRemaining,
    // Course Watch limits (10 courses/month for Free plan)
    coursesWatchedCount,
    coursesWatchedLimit: isPremium ? -1 : FREE_COURSE_MONTHLY_LIMIT,
    watchedCourseIds: watchedCourseItems.map(c => String(c.courseId)),
    monthlyCourses: formattedMonthlyCourses,
    monthlyCycleStartDate: user.courseMonthlyUsage.cycleStartDate,
    monthlyResetDate,
    canWatchMoreCourses: isPremium || coursesWatchedCount < FREE_COURSE_MONTHLY_LIMIT,
    // Pathway limits
    lifetimePathwaysCreatedCount: Math.max(user.lifetimePathwaysCreatedCount || 0, activePathwaysCount),
    pathwaysLimit: isPremium ? PREMIUM_ACTIVE_PATHWAY_LIMIT : FREE_LIFETIME_PATHWAY_LIMIT,
    pathwaysLimitType: isPremium ? "active" : "lifetime",
    activePathwaysCount,
    createdPathways: formattedPathways,
    canCreateMorePathways: isPremium
      ? activePathwaysCount < PREMIUM_ACTIVE_PATHWAY_LIMIT
      : (user.lifetimePathwaysCreatedCount || 0) < FREE_LIFETIME_PATHWAY_LIMIT,
    // Pricing info
    pricing: {
      monthlyPrice: PREMIUM_MONTHLY_PRICE,
      annualPrice: PREMIUM_ANNUAL_PRICE
    }
  };
}

/**
 * Records a course view for the current billing cycle and enforces limits.
 */
async function trackCourseView(user, courseId) {
  const status = await normalizeUserSubscription(user);
  const courseIdStr = String(courseId);

  // Check if course was already counted in this monthly cycle
  const alreadyWatched = (user.courseMonthlyUsage?.coursesWatched || []).some(
    c => String(c.courseId) === courseIdStr
  );

  if (alreadyWatched) {
    return {
      allowed: true,
      alreadyTracked: true,
      coursesWatchedCount: status.coursesWatchedCount,
      coursesWatchedLimit: status.coursesWatchedLimit,
      monthlyResetDate: status.monthlyResetDate
    };
  }

  // If free plan and at or over limit, reject
  if (!status.isPremium && status.coursesWatchedCount >= FREE_COURSE_MONTHLY_LIMIT) {
    return {
      allowed: false,
      limitReached: true,
      limitType: "course_monthly",
      message: `You have reached your monthly limit of ${FREE_COURSE_MONTHLY_LIMIT} courses on the Free plan. Your limit will reset on ${new Date(status.monthlyResetDate).toLocaleDateString()}. Upgrade to Premium for unlimited course access!`,
      coursesWatchedCount: status.coursesWatchedCount,
      coursesWatchedLimit: status.coursesWatchedLimit,
      monthlyResetDate: status.monthlyResetDate
    };
  }

  // Add course to monthly usage list
  if (!user.courseMonthlyUsage) {
    user.courseMonthlyUsage = {
      cycleStartDate: new Date(),
      coursesWatched: []
    };
  }

  user.courseMonthlyUsage.coursesWatched.push({
    courseId: courseIdStr,
    firstWatchedAt: new Date()
  });
  user.markModified("courseMonthlyUsage");

  await user.save();

  const newCount = user.courseMonthlyUsage.coursesWatched.length;

  return {
    allowed: true,
    alreadyTracked: false,
    coursesWatchedCount: newCount,
    coursesWatchedLimit: status.coursesWatchedLimit,
    monthlyResetDate: status.monthlyResetDate
  };
}

/**
 * Upgrades a user to the Premium plan (Monthly or Annual).
 */
async function upgradeToPremium(user, { billingCycle = "monthly", paymentDetails = {} }) {
  const isYearly = billingCycle === "yearly";
  const defaultAmount = isYearly ? PREMIUM_ANNUAL_PRICE : PREMIUM_MONTHLY_PRICE;
  const now = new Date();
  
  const periodEnd = new Date(now);
  if (isYearly) {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  user.subscription = {
    plan: "premium",
    billingCycle: isYearly ? "yearly" : "monthly",
    status: "active",
    startDate: user.subscription?.startDate || now,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    lastPaymentDate: now,
    paymentMethod: paymentDetails.method || user.subscription?.paymentMethod || "PayHere",
    lastOrderId: paymentDetails.orderId || user.subscription?.lastOrderId || "",
    amountPaid: paymentDetails.amount !== undefined ? Number(paymentDetails.amount) : defaultAmount,
    currency: paymentDetails.currency || "USD",
    autoRenew: true
  };
  user.markModified("subscription");

  // Set new cycle start date anchor
  if (!user.courseMonthlyUsage) {
    user.courseMonthlyUsage = { cycleStartDate: now, coursesWatched: [] };
  } else {
    user.courseMonthlyUsage.cycleStartDate = now;
  }
  user.markModified("courseMonthlyUsage");

  await user.save();
  return await normalizeUserSubscription(user);
}

/**
 * Cancels / downgrades a user's subscription back to Free plan.
 */
async function cancelSubscription(user) {
  const now = new Date();
  user.subscription = {
    plan: "free",
    billingCycle: "monthly",
    status: "cancelled",
    startDate: user.subscription?.startDate || now,
    currentPeriodStart: now,
    currentPeriodEnd: null,
    lastPaymentDate: user.subscription?.lastPaymentDate || now,
    amountPaid: 0,
    currency: "USD",
    autoRenew: false
  };
  user.markModified("subscription");

  await user.save();
  return await normalizeUserSubscription(user);
}

/**
 * Generates PayHere Sandbox Payment parameters and MD5 cryptographic hash.
 */
function generatePayherePayment(user, billingCycle = "monthly") {
  const merchantId = process.env.PAYHERE_MERCHANT_ID || "1211149";
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "4O0lS1B9w64gX2U5F7a8G8";
  const isYearly = billingCycle === "yearly";
  const amountNumber = isYearly ? PREMIUM_ANNUAL_PRICE : PREMIUM_MONTHLY_PRICE;
  const amountFormatted = amountNumber.toFixed(2);
  const currency = "USD";
  const orderId = `SUB_${user._id ? user._id.toString() : user.id}_${Date.now()}`;

  // PayHere hash formula: strtoupper(md5(merchant_id + order_id + amount + currency + strtoupper(md5(merchant_secret))))
  const hashedSecret = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  const hash = crypto
    .createHash("md5")
    .update(merchantId + orderId + amountFormatted + currency + hashedSecret)
    .digest("hex")
    .toUpperCase();

  const nameParts = (user.name || "Student Member").trim().split(" ");
  const firstName = nameParts[0] || "Student";
  const lastName = nameParts.slice(1).join(" ") || "Member";

  return {
    sandbox: true,
    merchant_id: merchantId,
    return_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/student/plans`,
    cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/student/plans`,
    notify_url: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/subscription/payhere-notify`,
    order_id: orderId,
    items: `EduPath Premium (${isYearly ? "Annual" : "Monthly"}) Subscription`,
    amount: amountFormatted,
    currency: currency,
    hash: hash,
    first_name: firstName,
    last_name: lastName,
    email: user.email,
    phone: user.profile?.contact || "0771234567",
    address: "EduPath Academy Online",
    city: "Colombo",
    country: "Sri Lanka",
    custom_1: user._id ? user._id.toString() : user.id,
    custom_2: billingCycle
  };
}

/**
 * Validates PayHere webhook IPN md5sig signature.
 */
function verifyPayhereSignature(data) {
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "4O0lS1B9w64gX2U5F7a8G8";
  const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = data;

  if (!merchant_id || !order_id || !payhere_amount || !payhere_currency || !status_code || !md5sig) {
    return false;
  }

  const hashedSecret = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  const calculatedSig = crypto
    .createHash("md5")
    .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
    .digest("hex")
    .toUpperCase();

  return calculatedSig === md5sig.toUpperCase();
}

module.exports = {
  FREE_COURSE_MONTHLY_LIMIT,
  FREE_LIFETIME_PATHWAY_LIMIT,
  PREMIUM_ACTIVE_PATHWAY_LIMIT,
  PREMIUM_MONTHLY_PRICE,
  PREMIUM_ANNUAL_PRICE,
  normalizeUserSubscription,
  trackCourseView,
  upgradeToPremium,
  cancelSubscription,
  generatePayherePayment,
  verifyPayhereSignature
};

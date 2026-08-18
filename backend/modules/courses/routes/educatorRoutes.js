const express = require("express");
const Course = require("../models/course");
const User = require("../../auth/models/User");
const authMiddleware = require("../../../middleware/authMiddleware");
const { toSafeUser } = require("../../auth/controllers/authController");

const router = express.Router();

const LKR_PER_USD = 310.0;

/**
 * Helper to check if a date falls within the 3rd week of the month (Days 15 to 21 inclusive)
 */
const checkIsThirdWeekOfMonth = (date = new Date()) => {
  const day = date.getDate();
  return day >= 15 && day <= 21;
};

/**
 * GET /api/educator/earnings
 * Computes and returns real enrolled students count,
 * $1/student earnings in both USD & LKR, and 3rd-week (15th to 21st) monthly payout eligibility.
 */
router.get("/earnings", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Fetch all non-trashed courses created by this educator (selective fields for maximum speed)
    const courses = await Course.find({
      createdByEducatorEmail: user.email,
      trashedAt: null
    }).select("_id status title enrolledCount enrolledStudents createdByEducatorEmail");

    const courseIds = courses.map((c) => String(c._id));

    // 2. Fetch all users (students) who have enrolled in any of this educator's courses
    const enrolledUsers = await User.find({
      "enrolledCourses.courseId": { $in: courseIds }
    }).select("enrolledCourses email name").lean();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 3. Synchronize existing enrolled students between User.enrolledCourses and Course.enrolledStudents
    let totalStudentsEnrolled = 0;
    let thisMonthEnrolled = 0;
    const coursesToSave = [];

    for (const c of courses) {
      let courseModified = false;
      if (!Array.isArray(c.enrolledStudents)) {
        c.enrolledStudents = [];
      }

      // Find all students who have this course in their enrolledCourses
      const studentsForThisCourse = enrolledUsers.filter((u) =>
        Array.isArray(u.enrolledCourses) &&
        u.enrolledCourses.some((ec) => String(ec.courseId) === String(c._id))
      );

      // Merge any previously enrolled students who weren't in c.enrolledStudents yet
      studentsForThisCourse.forEach((u) => {
        const exists = c.enrolledStudents.some(
          (es) => String(es.studentId) === String(u._id) || es.studentEmail === u.email
        );
        if (!exists) {
          const userEnrollment = u.enrolledCourses.find(
            (ec) => String(ec.courseId) === String(c._id)
          );
          c.enrolledStudents.push({
            studentId: u._id,
            studentEmail: u.email,
            studentName: u.name || "Student",
            enrolledAt: userEnrollment?.enrolledAt || new Date()
          });
          courseModified = true;
        }
      });

      const effectiveCount = Math.max(c.enrolledCount || 0, c.enrolledStudents.length);
      if (c.enrolledCount !== effectiveCount) {
        c.enrolledCount = effectiveCount;
        courseModified = true;
      }

      if (courseModified) {
        coursesToSave.push(c.save());
      }

      totalStudentsEnrolled += effectiveCount;

      // Count this month's enrollments
      c.enrolledStudents.forEach((e) => {
        if (e.enrolledAt && new Date(e.enrolledAt) >= startOfMonth) {
          thisMonthEnrolled += 1;
        }
      });
    }

    // Concurrent saves for courses if modified
    if (coursesToSave.length > 0) {
      await Promise.all(coursesToSave);
    }

    // 4. Earnings Rate: Fixed $1.00 USD per enrolled student (~ 310.0 LKR)
    const totalEarnedUSD = totalStudentsEnrolled * 1.0;
    const totalEarnedLKR = totalEarnedUSD * LKR_PER_USD;

    const thisMonthEarnedUSD = thisMonthEnrolled * 1.0;
    const thisMonthEarnedLKR = thisMonthEarnedUSD * LKR_PER_USD;

    // 5. Withdrawals & Available Balance Calculation
    const rawWithdrawals = user.educatorEarnings?.withdrawals || [];
    // Ensure existing withdrawals have amountUSD and amountLKR properly normalized without losing Mongoose subdoc fields
    const normalizedWithdrawals = rawWithdrawals.map((w) => {
      const item = w && typeof w.toObject === "function" ? w.toObject() : (w || {});
      const amountUSD = Number(item.amountUSD ?? item._doc?.amountUSD ?? (item.amountLKR ? item.amountLKR / LKR_PER_USD : 0)) || 0;
      const amountLKR = Number(item.amountLKR ?? item._doc?.amountLKR) || (amountUSD * LKR_PER_USD);
      return {
        ...item,
        payoutId: item.payoutId || item._doc?.payoutId || item.reference || "#PAYOUT",
        amountUSD,
        amountLKR,
        method: item.method || item._doc?.method || "bank",
        destination: item.destination || item._doc?.destination || "Bank Account",
        status: item.status || item._doc?.status || "Completed",
        date: item.date || item._doc?.date || new Date(),
        reference: item.reference || item._doc?.reference || item.payoutId || "#PAYOUT"
      };
    });

    const withdrawnUSD = normalizedWithdrawals.reduce((sum, w) => sum + (Number(w.amountUSD) || 0), 0);
    const withdrawnLKR = withdrawnUSD * LKR_PER_USD;

    const currentBalanceUSD = Math.max(0, totalEarnedUSD - withdrawnUSD);
    const currentBalanceLKR = currentBalanceUSD * LKR_PER_USD;

    // 6. Monthly 3rd Week Withdrawal Rule (Days 15 to 21 inclusive)
    const isThirdWeekOfMonth = checkIsThirdWeekOfMonth(now);
    const currentDay = now.getDate();
    let nextWithdrawalStartDate;
    let nextWithdrawalEndDate;

    if (currentDay < 15) {
      nextWithdrawalStartDate = new Date(now.getFullYear(), now.getMonth(), 15, 0, 0, 0);
      nextWithdrawalEndDate = new Date(now.getFullYear(), now.getMonth(), 21, 23, 59, 59);
    } else if (currentDay <= 21) {
      nextWithdrawalStartDate = new Date(now.getFullYear(), now.getMonth(), 15, 0, 0, 0);
      nextWithdrawalEndDate = new Date(now.getFullYear(), now.getMonth(), 21, 23, 59, 59);
    } else {
      nextWithdrawalStartDate = new Date(now.getFullYear(), now.getMonth() + 1, 15, 0, 0, 0);
      nextWithdrawalEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 21, 23, 59, 59);
    }

    // Synchronize educatorEarnings in User document only when changed
    const prevEarnings = user.educatorEarnings;
    const hasEarningsChanged =
      !prevEarnings ||
      prevEarnings.totalStudentsEnrolled !== totalStudentsEnrolled ||
      prevEarnings.totalEarnedUSD !== totalEarnedUSD ||
      prevEarnings.withdrawnUSD !== withdrawnUSD ||
      prevEarnings.currentBalanceUSD !== currentBalanceUSD;

    if (hasEarningsChanged) {
      if (!user.educatorEarnings) {
        user.educatorEarnings = {
          totalStudentsEnrolled: 0,
          totalEarnedUSD: 0,
          withdrawnUSD: 0,
          currentBalanceUSD: 0,
          lastWithdrawalDate: null,
          withdrawals: []
        };
      }
      user.educatorEarnings.totalStudentsEnrolled = totalStudentsEnrolled;
      user.educatorEarnings.totalEarnedUSD = totalEarnedUSD;
      user.educatorEarnings.withdrawnUSD = withdrawnUSD;
      user.educatorEarnings.currentBalanceUSD = currentBalanceUSD;
      user.educatorEarnings.withdrawals = normalizedWithdrawals;
      await user.save();
    }

    res.json({
      success: true,
      stats: {
        publishedCoursesCount: courses.filter((c) => c.status === "approved").length,
        totalCoursesCount: courses.length,
        totalStudentsEnrolled,
        totalEarnedUSD,
        totalEarnedLKR,
        thisMonthEarnedUSD,
        thisMonthEarnedLKR,
        withdrawnUSD,
        withdrawnLKR,
        currentBalanceUSD,
        currentBalanceLKR,
        canWithdrawToday: isThirdWeekOfMonth,
        isThirdWeekOfMonth,
        isFirstWeekOfMonth: isThirdWeekOfMonth, // backward compatibility
        nextWithdrawalStartDate,
        nextWithdrawalEndDate,
        ratePerStudentUSD: 1.0,
        exchangeRateLKR: LKR_PER_USD
      },
      withdrawals: normalizedWithdrawals,
      payoutMethods: {
        bank: user.profile?.payout || {},
        card: user.profile?.cardPayout || {}
      }
    });
  } catch (err) {
    console.error("Educator Earnings Error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch earnings" });
  }
});

/**
 * POST /api/educator/withdraw
 * Allows educators to withdraw available earnings to their Bank Account or Card
 * during the 3rd week of the month (Days 15 to 21).
 */
router.post("/withdraw", authMiddleware, async (req, res) => {
  try {
    const { amount, method = "bank", destinationDetails = {}, allowTestOverride = false } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();
    const isThirdWeekOfMonth = checkIsThirdWeekOfMonth(now);
    const currentDay = now.getDate();

    // Enforce 3rd Week of the Month Rule (Days 15 to 21)
    if (!isThirdWeekOfMonth && !allowTestOverride) {
      let nextStartDate, nextEndDate;
      if (currentDay < 15) {
        nextStartDate = new Date(now.getFullYear(), now.getMonth(), 15);
        nextEndDate = new Date(now.getFullYear(), now.getMonth(), 21);
      } else {
        nextStartDate = new Date(now.getFullYear(), now.getMonth() + 1, 15);
        nextEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 21);
      }
      return res.status(400).json({
        message: `Withdrawals are only permitted during the 3rd week of every month (15th to 21st). Next payout window: ${nextStartDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${nextEndDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
      });
    }

    // 1. Calculate live enrolled student count across educator's courses for 100% accurate balance
    const courses = await Course.find({
      createdByEducatorEmail: user.email,
      trashedAt: null
    }).select("_id enrolledCount enrolledStudents");

    const courseIds = courses.map((c) => String(c._id));

    const enrolledUsers = await User.find({
      "enrolledCourses.courseId": { $in: courseIds }
    }).select("enrolledCourses email name").lean();

    let totalStudentsEnrolled = 0;
    for (const c of courses) {
      const studentsForThisCourse = enrolledUsers.filter((u) =>
        Array.isArray(u.enrolledCourses) &&
        u.enrolledCourses.some((ec) => String(ec.courseId) === String(c._id))
      );
      totalStudentsEnrolled += Math.max(c.enrolledCount || 0, c.enrolledStudents?.length || 0, studentsForThisCourse.length);
    }

    const totalEarnedUSD = Math.max(totalStudentsEnrolled * 1.0, user.educatorEarnings?.totalEarnedUSD || 0);
    const rawExistingWithdrawals = user.educatorEarnings?.withdrawals || [];
    const existingWithdrawals = rawExistingWithdrawals.map((w) => {
      const item = w && typeof w.toObject === "function" ? w.toObject() : (w || {});
      const amountUSD = Number(item.amountUSD ?? item._doc?.amountUSD ?? (item.amountLKR ? item.amountLKR / LKR_PER_USD : 0)) || 0;
      const amountLKR = Number(item.amountLKR ?? item._doc?.amountLKR) || (amountUSD * LKR_PER_USD);
      return {
        ...item,
        amountUSD,
        amountLKR
      };
    });

    const withdrawnUSD = existingWithdrawals.reduce((sum, w) => sum + (Number(w.amountUSD) || 0), 0);
    const currentBalance = Math.max(0, totalEarnedUSD - withdrawnUSD);

    const withdrawAmount = Number(amount) || currentBalance || 0;

    if (withdrawAmount <= 0) {
      return res.status(400).json({ message: "Withdrawal amount must be greater than $0.00." });
    }

    if (withdrawAmount > currentBalance) {
      return res.status(400).json({
        message: `Insufficient balance. Available balance is $${currentBalance.toFixed(2)} USD (Rs. ${(currentBalance * LKR_PER_USD).toLocaleString("en-US", { minimumFractionDigits: 2 })} LKR).`
      });
    }

    // Format destination label
    let destinationLabel = "Bank Transfer";
    if (method === "card") {
      const cardNum = destinationDetails.cardNumber || user.profile?.cardPayout?.cardNumber || "••••";
      destinationLabel = `Card ending in ${cardNum.slice(-4)}`;
    } else {
      const bankName = destinationDetails.bankName || user.profile?.payout?.bankName || "Bank";
      const accNum = destinationDetails.accountNumber || user.profile?.payout?.accountNumber || "••••";
      destinationLabel = `${bankName} (Acct ending in ${accNum.slice(-4)})`;
    }

    const payoutRef = `#PAYOUT-${Date.now().toString().slice(-6)}`;
    const withdrawAmountLKR = withdrawAmount * LKR_PER_USD;
    const newWithdrawal = {
      payoutId: payoutRef,
      amountUSD: withdrawAmount,
      amountLKR: withdrawAmountLKR,
      method: method === "card" ? "card" : "bank",
      destination: destinationLabel,
      status: "Completed",
      date: new Date(),
      reference: payoutRef
    };

    if (!user.educatorEarnings) {
      user.educatorEarnings = {
        totalStudentsEnrolled: 0,
        totalEarnedUSD: 0,
        withdrawnUSD: 0,
        currentBalanceUSD: 0,
        lastWithdrawalDate: null,
        withdrawals: []
      };
    }

    const newWithdrawnUSD = withdrawnUSD + withdrawAmount;
    const newCurrentBalanceUSD = Math.max(0, currentBalance - withdrawAmount);

    user.educatorEarnings.totalStudentsEnrolled = totalStudentsEnrolled;
    user.educatorEarnings.totalEarnedUSD = totalEarnedUSD;
    user.educatorEarnings.withdrawnUSD = newWithdrawnUSD;
    user.educatorEarnings.currentBalanceUSD = newCurrentBalanceUSD;
    user.educatorEarnings.lastWithdrawalDate = new Date();
    user.educatorEarnings.withdrawals.unshift(newWithdrawal);

    // Save payout details in profile if supplied
    if (method === "bank" && destinationDetails.bankName) {
      if (!user.profile) user.profile = {};
      user.profile.payout = {
        ...user.profile.payout,
        ...destinationDetails
      };
      user.markModified("profile");
    } else if (method === "card" && destinationDetails.cardNumber) {
      if (!user.profile) user.profile = {};
      user.profile.cardPayout = {
        ...user.profile.cardPayout,
        ...destinationDetails
      };
      user.markModified("profile");
    }

    user.markModified("educatorEarnings");
    await user.save();

    const safeUser = await toSafeUser(user);

    res.json({
      success: true,
      message: `Successfully withdrew $${withdrawAmount.toFixed(2)} USD (Rs. ${withdrawAmountLKR.toLocaleString("en-US", { minimumFractionDigits: 2 })} LKR) to ${destinationLabel}!`,
      withdrawal: newWithdrawal,
      user: safeUser,
      stats: {
        totalStudentsEnrolled,
        totalEarnedUSD,
        totalEarnedLKR: totalEarnedUSD * LKR_PER_USD,
        withdrawnUSD: newWithdrawnUSD,
        withdrawnLKR: newWithdrawnUSD * LKR_PER_USD,
        currentBalanceUSD: newCurrentBalanceUSD,
        currentBalanceLKR: newCurrentBalanceUSD * LKR_PER_USD,
        canWithdrawToday: isThirdWeekOfMonth,
        isThirdWeekOfMonth,
        isFirstWeekOfMonth: isThirdWeekOfMonth,
        exchangeRateLKR: LKR_PER_USD
      }
    });
  } catch (err) {
    console.error("Withdrawal Error:", err);
    res.status(500).json({ message: err.message || "Failed to process withdrawal" });
  }
});

module.exports = router;

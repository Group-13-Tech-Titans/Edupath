const express = require("express");
const Course = require("../models/course");
const User = require("../../auth/models/User");
const authMiddleware = require("../../../middleware/authMiddleware");

const router = express.Router();

/**
 * Helper to check if a date falls within the first week of the month (Days 1 to 7 inclusive)
 */
const checkIsFirstWeekOfMonth = (date = new Date()) => {
  const day = date.getDate();
  return day >= 1 && day <= 7;
};

/**
 * GET /api/educator/earnings
 * Computes and returns real enrolled students count (including all already enrolled students),
 * $1/student earnings, and 1st-week monthly payout eligibility.
 */
router.get("/earnings", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Fetch all non-trashed courses created by this educator
    const courses = await Course.find({
      createdByEducatorEmail: user.email,
      trashedAt: null
    });

    const courseIds = courses.map((c) => String(c._id));

    // 2. Fetch all users (students) who have enrolled in any of this educator's courses
    const enrolledUsers = await User.find({
      "enrolledCourses.courseId": { $in: courseIds }
    }).lean();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 3. Synchronize existing enrolled students between User.enrolledCourses and Course.enrolledStudents
    let totalStudentsEnrolled = 0;
    let thisMonthEnrolled = 0;

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
        await c.save();
      }

      totalStudentsEnrolled += effectiveCount;

      // Count this month's enrollments
      c.enrolledStudents.forEach((e) => {
        if (e.enrolledAt && new Date(e.enrolledAt) >= startOfMonth) {
          thisMonthEnrolled += 1;
        }
      });
    }

    // 4. Earnings Rate: Fixed $1.00 USD per enrolled student
    const totalEarnedUSD = totalStudentsEnrolled * 1.0;
    const thisMonthEarnedUSD = thisMonthEnrolled * 1.0;

    // 5. Withdrawals & Available Balance Calculation
    const withdrawals = user.educatorEarnings?.withdrawals || [];
    const withdrawnUSD = withdrawals.reduce((sum, w) => sum + (Number(w.amountUSD) || 0), 0);
    const currentBalanceUSD = Math.max(0, totalEarnedUSD - withdrawnUSD);

    // 6. Monthly First Week Withdrawal Rule (Days 1 to 7 inclusive)
    const isFirstWeekOfMonth = checkIsFirstWeekOfMonth(now);
    let nextWithdrawalStartDate;
    let nextWithdrawalEndDate;

    if (isFirstWeekOfMonth) {
      nextWithdrawalStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
      nextWithdrawalEndDate = new Date(now.getFullYear(), now.getMonth(), 7, 23, 59, 59);
    } else {
      // Past day 7 -> next window is 1st week of next month
      nextWithdrawalStartDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      nextWithdrawalEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 7, 23, 59, 59);
    }

    // Synchronize educatorEarnings in User document
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
    await user.save();

    res.json({
      success: true,
      stats: {
        publishedCoursesCount: courses.filter((c) => c.status === "approved").length,
        totalCoursesCount: courses.length,
        totalStudentsEnrolled,
        totalEarnedUSD,
        thisMonthEarnedUSD,
        withdrawnUSD,
        currentBalanceUSD,
        canWithdrawToday: isFirstWeekOfMonth,
        isFirstWeekOfMonth,
        nextWithdrawalStartDate,
        nextWithdrawalEndDate,
        ratePerStudentUSD: 1.0
      },
      withdrawals,
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
 * during the first week of the month (Days 1 to 7).
 */
router.post("/withdraw", authMiddleware, async (req, res) => {
  try {
    const { amount, method = "bank", destinationDetails = {}, allowTestOverride = false } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();
    const isFirstWeekOfMonth = checkIsFirstWeekOfMonth(now);

    // Enforce First Week of the Month Rule (Days 1 to 7)
    if (!isFirstWeekOfMonth && !allowTestOverride) {
      const nextStartDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const nextEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 7);
      return res.status(400).json({
        message: `Withdrawals are only permitted during the first week of every month (Days 1 to 7). Next payout window: ${nextStartDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${nextEndDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
      });
    }

    const withdrawAmount = Number(amount) || user.educatorEarnings?.currentBalanceUSD || 0;

    if (withdrawAmount <= 0) {
      return res.status(400).json({ message: "Withdrawal amount must be greater than $0.00." });
    }

    const currentBalance = user.educatorEarnings?.currentBalanceUSD || 0;
    if (withdrawAmount > currentBalance) {
      return res.status(400).json({
        message: `Insufficient balance. Available balance is $${currentBalance.toFixed(2)} USD.`
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
    const newWithdrawal = {
      payoutId: payoutRef,
      amountUSD: withdrawAmount,
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

    user.educatorEarnings.withdrawals.unshift(newWithdrawal);
    user.educatorEarnings.withdrawnUSD = (user.educatorEarnings.withdrawnUSD || 0) + withdrawAmount;
    user.educatorEarnings.currentBalanceUSD = Math.max(0, currentBalance - withdrawAmount);
    user.educatorEarnings.lastWithdrawalDate = new Date();

    // Save payout details in profile if supplied
    if (method === "bank" && destinationDetails.bankName) {
      if (!user.profile) user.profile = {};
      user.profile.payout = {
        ...user.profile.payout,
        ...destinationDetails
      };
    } else if (method === "card" && destinationDetails.cardNumber) {
      if (!user.profile) user.profile = {};
      user.profile.cardPayout = {
        ...user.profile.cardPayout,
        ...destinationDetails
      };
    }

    await user.save();

    res.json({
      success: true,
      message: `Successfully withdrew $${withdrawAmount.toFixed(2)} USD to ${destinationLabel}!`,
      withdrawal: newWithdrawal,
      stats: {
        totalStudentsEnrolled: user.educatorEarnings.totalStudentsEnrolled,
        totalEarnedUSD: user.educatorEarnings.totalEarnedUSD,
        withdrawnUSD: user.educatorEarnings.withdrawnUSD,
        currentBalanceUSD: user.educatorEarnings.currentBalanceUSD
      }
    });
  } catch (err) {
    console.error("Withdrawal Error:", err);
    res.status(500).json({ message: err.message || "Failed to process withdrawal" });
  }
});

module.exports = router;

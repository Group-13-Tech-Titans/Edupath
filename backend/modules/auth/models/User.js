/**
 * USER DATABASE MODEL
 * Defines the schema, data types, and validations for users in MongoDB.
 */

const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  plan: { type: String, enum: ["free", "premium"], default: "free" },
  billingCycle: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
  status: { type: String, enum: ["active", "cancelled", "expired"], default: "active" },
  startDate: { type: Date, default: Date.now },
  currentPeriodStart: { type: Date, default: Date.now },
  currentPeriodEnd: { type: Date, default: null },
  lastPaymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, default: "PayHere" },
  lastOrderId: { type: String, default: "" },
  amountPaid: { type: Number, default: 0 },
  currency: { type: String, default: "USD" },
  autoRenew: { type: Boolean, default: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: {
    type: String,

    // Dynamic Validation: Password is only required when creating a new local user and bypasses for Google OAuth users or updates to existing records
    required: function () {
      return this.isNew ? this.authProvider === "local" : false;
    },
  },
  role: {
    type: String,
    enum: ["student", "educator", "admin", "reviewer", "pending"],
    default: "pending",
  },

  isMentor: { type: Boolean, default: false },

  enrolledCourses: [{
    courseId: String,
    enrolledAt: { type: Date, default: Date.now }
  }],

  learningPath: { type: String },
  level: { type: String },
  quizCompleted: { type: Boolean, default: false },

  status: { type: String, default: null },
  specializationTag: { type: String, default: null },
  specializationTags: [{ type: String }],
  // Mixed type allows flexible schema-less data for varied profiles (e.g., student vs educator metadata)
  profile: { type: mongoose.Schema.Types.Mixed, default: {} },
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  authProvider: { type: String, enum: ["local", "google"], default: "local" },
  googleId: { type: String },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },

  subscription: {
    type: subscriptionSchema,
    default: () => ({ plan: "free", billingCycle: "monthly", status: "active" }),
  },

  // Lifetime pathways created by the student (lifetime limit of 3 for Free plan, even if deleted)
  lifetimePathwaysCreatedCount: { type: Number, default: 0 },

  // Courses watched / accessed in the current monthly cycle (resets monthly from cycle start)
  courseMonthlyUsage: {
    cycleStartDate: { type: Date, default: Date.now },
    coursesWatched: [{
      courseId: { type: String },
      firstWatchedAt: { type: Date, default: Date.now }
    }]
  },

  // --- EDUCATOR EARNINGS & WITHDRAWAL SYSTEM ---
  // Rate: $1 per enrolled student. Withdrawals available on the 1st of every month.
  educatorEarnings: {
    totalStudentsEnrolled: { type: Number, default: 0 },
    totalEarnedUSD: { type: Number, default: 0 },
    withdrawnUSD: { type: Number, default: 0 },
    currentBalanceUSD: { type: Number, default: 0 },
    lastWithdrawalDate: { type: Date, default: null },
    withdrawals: [{
      payoutId: { type: String },
      amountUSD: { type: Number, default: 0 },
      amountLKR: { type: Number, default: 0 },
      method: { type: String, enum: ["bank", "card"], default: "bank" },
      destination: { type: String },
      status: { type: String, enum: ["Completed", "Processing", "Pending"], default: "Completed" },
      date: { type: Date, default: Date.now },
      reference: { type: String }
    }]
  }
});

module.exports = mongoose.model("User", userSchema);

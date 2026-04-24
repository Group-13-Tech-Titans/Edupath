/**
 * USER DATABASE MODEL
 * Defines the schema, data types, and validations for users in MongoDB.
 * Design Pattern: Active Record / Data Mapper (via Mongoose)
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: {
    type: String,

    // Dynamic Validation: Password is only required if they register normally and Bypasses this for Google OAuth users.
    required: function () {
      return this.authProvider === "local";
    },
  },
  role: {
    type: String,
    enum: ["student", "educator", "admin", "reviewer", "pending"],
    default: "pending",
  },
  learningPath: { type: String },
  level: { type: String },
  quizCompleted: { type: Boolean, default: false },

  status: { type: String, default: null },
  specializationTags: [{ type: String }],
  // Mixed type allows flexible schema-less data for varied profiles (e.g., student vs educator metadata)
  profile: { type: mongoose.Schema.Types.Mixed, default: {} },
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  authProvider: { type: String, enum: ["local", "google"], default: "local" },
  googleId: { type: String },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);

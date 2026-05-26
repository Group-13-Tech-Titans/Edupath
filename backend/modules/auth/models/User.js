const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String, //user's display name  string
    email: { type: String, unique: true }, //user's email address, must be unique
    password: {
      type: String, //hashed password for local auth users
      required: function () {return this.authProvider === "local";
      },
    },
    //roles
    role: { 
      type: String,
      enum: ["student", "educator", "admin", "reviewer", "pending"],
      default: "pending",
    },
    learningPath: { type: String }, //user's current learning path (e.g., "web development")
    level: { type: String }, //user's current level in the learning path (e.g., "beginner", "intermediate", "advanced")
    quizCompleted: { type: Boolean, default: false },

    status: { type: String, default: null },
    specializationTags: [{ type: String }], //store multiple specialization tags for educators 
    profile: { type: mongoose.Schema.Types.Mixed, default: {} }, //flexible field for additional profile info
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }, //automatically add createdAt and updatedAt fields
);

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["student", "educator", "admin", "reviewer", "pending"],
    default: "pending"
  },
  status: { type: String, default: null },
  specializationTag: { type: String, default: null },
  specializationTags: [{ type: String }],
  twoFactorEnabled: { type: Boolean, default: false },
  loginOtpHash: String,
  loginOtpExpire: Date,
  authTokenVersion: { type: Number, default: 0 },
  logoutAfter: Date,
  profile: { type: mongoose.Schema.Types.Mixed, default: {} },
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

module.exports = mongoose.model("User", userSchema);


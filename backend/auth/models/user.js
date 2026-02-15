const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: {
    type: String,
    required: function () {
      return this.authProvider === "local";
    }
  },
  role: {
    type: String,
    enum: ["student", "educator", "admin", "reviewer", "pending"],
    default: "pending"
  },
  status: { type: String, default: null },
  specializationTag: { type: String, default: null },
  profile: { type: mongoose.Schema.Types.Mixed, default: {} },
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  authProvider: { type: String, enum: ["local", "google"], default: "local" },
  googleId: { type: String },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false }

});



module.exports = mongoose.model("User", userSchema);

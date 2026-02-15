const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const crypto = require("crypto");
const sendEmail = require("../../utils/sendEmail");

const { OAuth2Client } = require("google-auth-library");// adjust path if needed

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Missing Google credential" });

    // 1) Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || "Google User";
    const avatar = payload.picture || "";

    // 2) Save/Update in MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user (default student)
      user = await User.create({
        name,
        email,
        role: "pending",
        authProvider: "google",
        googleId,
        avatar,
        isVerified: true          // Google email is verified by Google
      });
    } else {
      // Existing user logging with Google
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar) user.avatar = avatar;
      if (!user.isVerified) user.isVerified = true;
    
      await user.save();
    }
    

    // 3) Generate your JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 4) Send response
    res.json({
      message: "Google login success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Google login failed", error: err.message });
  }
});

router.post("/select-role", authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "educator"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.user._id); // req.user exists from authMiddleware
    if (!user) return res.status(404).json({ message: "User not found" });

    // If role already selected, just return info (don’t fail hard)
    if (user.role !== "pending") {
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Role already selected",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
    }

    // Set role now
    user.role = role;
    await user.save();

    // IMPORTANT: issue a NEW JWT containing the updated role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Role updated",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware(["admin"]),
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

router.get(
  "/educator",
  authMiddleware,
  roleMiddleware(["educator"]),
  (req, res) => {
    res.json({ message: "Welcome Educator" });
  }
);


// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name || email.split("@")[0],
      email,
      password: hashedPassword,
      role: role || "pending"
    });

    const safe = user.toObject();
    delete safe.password;
    safe.id = safe._id.toString();
    res.status(201).json({ message: "User registered", user: safe });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: err.message || "Registration failed" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const safe = user.toObject();
  delete safe.password;
  safe.id = safe._id.toString();
  res.json({ token, user: safe });
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "EduPath Password Reset",
      text: `Reset your password using this link: ${resetUrl}`,
      html: `
        <p>You requested a password reset for EduPath.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in 15 minutes.</p>
      `
    });

    res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Email sending failed", error: err.message });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const resetToken = req.params.token;

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const bcrypt = require("bcryptjs");
    user.password = await bcrypt.hash(password, 10);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Reset failed", error: err.message });
  }
});



// GET CURRENT USER (restore session)
router.get("/me", authMiddleware, (req, res) => {
  const safe = req.user.toObject ? req.user.toObject() : req.user;
  delete safe.password;
  safe.id = safe._id.toString();
  res.json({ user: safe });
});

// UPDATE PROFILE (role, name, profile – for completing student/educator signup)
router.patch("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, role, password, profile, status, specializationTag } = req.body;
    const updates = {};
    if (name != null) updates.name = name;
    if (role != null) updates.role = role;
    if (status != null) updates.status = status;
    if (specializationTag != null) updates.specializationTag = specializationTag;
    if (profile != null) updates.profile = profile;
    if (password && password.length >= 6) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select("-password");

    const safe = user.toObject();
    safe.id = safe._id.toString();
    res.json({ user: safe });
  } catch (err) {
    res.status(500).json({ message: err.message || "Update failed" });
  }
});

// CHANGE PASSWORD (separate endpoint - reliable)
router.patch("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    // get user WITH password for compare
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // If user already has a password (local users, or google users who set one before)
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
    }

    // Set new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Password update failed", error: err.message });
  }
});


module.exports = router;

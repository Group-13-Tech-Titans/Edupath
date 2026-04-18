const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Specialization = require("../../specializations/models/specialization");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const crypto = require("crypto");
const sendEmail = require("../../utils/sendEmail");
const { welcomeEmail, passwordChangedEmail } = require("../../utils/emailTemplates");


router.get("/admin", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

router.get("/educator", authMiddleware, roleMiddleware(["educator"]), (req, res) => {
  res.json({ message: "Welcome Educator" });
});


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

    // Send welcome email (non-blocking)
    sendEmail({ to: email, ...welcomeEmail({ name: name || email.split("@")[0], email, role: role || "pending" }) })
      .catch((err) => console.error("Welcome email failed:", err.message));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: err.message || "Registration failed" });
  }
});

// REGISTER EDUCATOR
router.post("/register-educator", async (req, res) => {
  try {
    const { fullName, email, password, contact, specializationTag, credentialsLink } = req.body;

    if (!fullName || !email || !password || !specializationTag) {
      return res.status(400).json({ message: "Name, email, password, and specialization are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const specialization = await Specialization.findOne({ slug: specializationTag, isActive: true });
    if (!specialization) {
      return res.status(400).json({ message: "Invalid specialization selected" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      role: "educator",
      status: "PENDING_VERIFICATION",
      specializationTag: specialization.slug,
      profile: {
        fullName,
        contact: contact || "",
        specialization: {
          name: specialization.name,
          slug: specialization.slug
        },
        credentialsLink: credentialsLink || ""
      }
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, authTokenVersion: user.authTokenVersion || 0 },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const safe = user.toObject();
    delete safe.password;
    safe.id = safe._id.toString();
    res.status(201).json({ message: "Educator registered", token, user: safe });

    sendEmail({ to: email, ...welcomeEmail({ name: fullName, email, role: "educator" }) })
      .catch((err) => console.error("Welcome email failed:", err.message));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: err.message || "Educator registration failed" });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, authTokenVersion: user.authTokenVersion || 0 },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const safe = user.toObject();
    delete safe.password;
    safe.id = safe._id.toString();
    res.json({ token, user: safe });
  } catch (err) {
    res.status(500).json({ message: err.message || "Login failed" });
  }
});


// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
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


// RESET PASSWORD
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


// UPDATE PROFILE
router.patch("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, role, password, currentPassword, profile, status, specializationTag } = req.body;
    const updates = {};
    if (name != null) updates.name = name;
    if (role != null) updates.role = role;
    if (status != null) updates.status = status;
    if (specializationTag != null) updates.specializationTag = specializationTag;
    if (profile != null) updates.profile = profile;

    // If a new password is provided, verify the current password first
    if (password && password.length >= 6) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to set a new password." });
      }
      const fullUser = await User.findById(req.user._id);
      const match = await bcrypt.compare(currentPassword, fullUser.password);
      if (!match) {
        return res.status(400).json({ message: "Current password is incorrect." });
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    const passwordChanged = !!updates.password;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select("-password");

    const safe = user.toObject();
    safe.id = safe._id.toString();
    res.json({ user: safe });

    // Send password change notification (non-blocking)
    if (passwordChanged) {
      sendEmail({ to: user.email, ...passwordChangedEmail({ name: user.name, email: user.email }) })
        .catch((err) => console.error("Password change email failed:", err.message));
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Update failed" });
  }
});


// LOGOUT FROM ALL DEVICES
// Increments authTokenVersion — all existing JWTs immediately become invalid
router.post("/logout-all", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $inc: { authTokenVersion: 1 } });
    res.json({ message: "Logged out from all devices." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Logout failed" });
  }
});


module.exports = router;

/**
 * AUTHENTICATION CONTROLLER
 * Handles all business logic for user registration, login, role selection, 
 * password management, and Google OAuth integration.
 * * Design Pattern: MVC (Controller layer)
 * Auth Strategy: Stateless JWT (JSON Web Tokens) + Hybrid Authentication (Local/Google)
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../../../utils/sendEmail");
const crypto = require("node:crypto");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const BCRYPT_SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // Reset token expire time - 15 minutes

//  AUTH LOGIC

// Google Login
exports.googleLogin = async (req, res) => {
  try {
    const { credential, isSignup } = req.body;
    if (!credential) return res.status(400).json({ message: "Missing Google credential" });

    // Verify token cryptographically with Google to prevent spoofing
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || "Google User";
    const avatar = payload.picture || "";

    let user = await User.findOne({ email });

    // Block duplicate signups
    if (user && isSignup) {
      return res.status(400).json({
        message: "Account already exists. Please log in."
      });
    }

    // Logic Flow: Handle positive condition first
    if (user) {
      // User exists (Account Linking): Update missing Google details safely
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar) user.avatar = avatar;
      if (!user.isVerified) user.isVerified = true;
      await user.save();
    } else {
      // If user does not exist Auto create a new account
      user = await User.create({
        name,
        email,
        role: "pending", // Enforces Role Selection step later
        authProvider: "google",
        googleId,
        avatar,
        isVerified: true, // Implicitly email verified by Google
      });
    }

    // Issue JWT for stateless session management
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Google login success",
      token,
      // Only send necessary data back, never the whole user object
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, status: user.status },
    });

  } catch (err) {
    res.status(500).json({ message: "Google login failed", error: err.message });
  }
};


exports.selectRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Input Validation: Prevent users from injecting admin roles
    if (!["student", "educator"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent role reassignment
    if (user.role !== "pending") {
      return res.status(400).json({ message: "Role already selected" });
    }

    user.role = role;
    user.status = "onboarding";
    await user.save();

    // Re-issue JWT because the payload (role) has changed
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      message: "Role updated",
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    // Hash passwords before saving to DB
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await User.create({
      name: name || email.split("@")[0], // Fallback name generation
      email,
      password: hashedPassword,
      role: "pending",
      authProvider: "local",
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Strip password hash from the object before sending to client
    const safe = user.toObject();
    delete safe.password;
    safe.id = safe._id.toString();

    return res.status(201).json({ message: "User registered", token, user: safe });
  } catch (err) {
    // Handle MongoDB Duplicate Key Error (11000) gracefully
    if (err.code === 11000) return res.status(400).json({ message: "Email already in use" });
    res.status(500).json({ message: err.message || "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const safe = user.toObject();
    delete safe.password;
    safe.id = safe._id.toString();
    res.json({ token, user: safe });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a cryptographically secure random token (not a JWT)
    const resetToken = crypto.randomBytes(32).toString("hex");
    // Hash the token before saving to the DB. If DB is breached, reset tokens are safe.
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + RESET_TOKEN_EXPIRY_MS;
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
};

exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const resetToken = req.params.token;

    // Re-hash the provided token to compare against the DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() } // Ensure token hasn't expired
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Invalidate the token immediately use
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Reset failed", error: err.message });
  }
};

exports.getCurrentUser = (req, res) => {
  // `req.user` is populated by authMiddleware
  const safe = req.user.toObject ? req.user.toObject() : req.user;
  delete safe.password;
  safe.id = safe._id.toString();
  res.json({ user: safe });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, role, password, profile, status, specializationTag } = req.body;

    // Build update object dynamically to prevent overwriting with nulls
    const updates = {};
    if (name != null) updates.name = name;
    if (role != null) updates.role = role;
    if (status != null) updates.status = status;
    if (specializationTag != null) updates.specializationTag = specializationTag;
    if (profile != null) updates.profile = profile;
    if (password && password.length >= 6) {
      updates.password = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { returnDocument: 'after' }).select("-password");

    const safe = user.toObject();
    safe.id = safe._id.toString();
    res.json({ user: safe });
  } catch (err) {
    res.status(500).json({ message: err.message || "Update failed" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Handling Google users setting a password for the first time
    if (user.password) {
      if (!currentPassword) return res.status(400).json({ message: "Current password is required" });
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Password update failed", error: err.message });
  }
};

// ==========================================
//           ADMIN / ROLE LOGIC
// ==========================================

exports.createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role, specializationTag } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const newUser = await User.create({
      name: name || email.split("@")[0],
      email,
      password: hashedPassword,
      role: role || "student",
      specializationTag: role === "reviewer" ? specializationTag : null,
      authProvider: "local",
      isVerified: true, // Auto-verified by Admin
    });

    const safe = newUser.toObject();
    delete safe.password;
    safe.id = safe._id.toString();

    return res.status(201).json({ message: "User created successfully", user: safe });
  } catch (err) {
    res.status(500).json({ message: "User creation failed", error: err.message });
  }
};

exports.adminWelcome = (req, res) => res.json({ message: "Welcome Admin" });
exports.educatorWelcome = (req, res) => res.json({ message: "Welcome Educator" });

// 🟢 MERGED: GET all reviewers (using your User model)
exports.getAllReviewers = async (req, res) => {
  try {
    const reviewers = await User.find({ role: "reviewer" }).select("-password");
    res.json(reviewers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviewers", error: err.message });
  }
};

// 🟢 MERGED: ADD a reviewer (Modified your createAdminUser logic)
exports.createReviewer = async (req, res) => {
  try {
    const { name, email, password, specializationTag } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "reviewer", // Explicitly set role
      specializationTag, // Friend's expertise
      authProvider: "local",
      isVerified: true, 
    });

    res.status(201).json({ message: "Reviewer created", id: newUser._id });
  } catch (err) {
    res.status(500).json({ message: "Creation failed", error: err.message });
  }
};

// 🟢 MERGED: UPDATE a reviewer (From friend's logic)
exports.updateReviewer = async (req, res) => {
  try {
    const { name, email, password, specializationTag } = req.body;
    const updateData = { name, email, specializationTag };

    if (password) {
      updateData.password = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    }

    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, role: "reviewer" }, // Security: Only update if it's a reviewer
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "Reviewer not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// 🟢 MERGED: DELETE a reviewer
exports.deleteReviewer = async (req, res) => {
  try {
    const deleted = await User.findOneAndDelete({ _id: req.params.id, role: "reviewer" });
    if (!deleted) return res.status(404).json({ message: "Reviewer not found" });
    res.json({ message: "Reviewer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};
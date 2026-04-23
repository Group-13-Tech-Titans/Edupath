const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const sendEmail = require("../../utils/sendEmail");

const router = express.Router();

// Example Routes
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name || email.split("@")[0],
      email,
      password: hashedPassword,
      role: role || "pending",
    });

    const safe = user.toObject();
    delete safe.password;
    safe.id = safe._id.toString();
    res.status(201).json({ message: "User registered", user: safe });
  } catch (err) {
    res.status(500).json({ message: err.message || "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  const safe = user.toObject();
  delete safe.password;
  safe.id = safe._id.toString();
  res.json({ token, user: safe });
});

// You can add other routes like forgot-password, reset-password, profile update...

module.exports = router;
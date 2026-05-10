const MentorProfile = require("../models/MentorProfile");

// ─────────────────────────────────────────────────────────────
// GET /api/mentor/profile
// Returns the logged-in mentor's profile.
// ─────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    // req.user is set by authMiddleware — it's the logged-in user
    // We search for a profile where userId matches the logged-in user
    const profile = await MentorProfile.findOne({ userId: req.user._id });

    if (!profile) {
      // If no profile exists yet, return a friendly message (not an error)
      return res.status(404).json({ message: "Profile not found. Please create one." });
    }

    // Send the profile data back as JSON
    res.json(profile);
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/mentor/profile
// Creates the mentor's profile for the first time.
// ─────────────────────────────────────────────────────────────
const createProfile = async (req, res) => {
  try {
    // Check if this mentor already has a profile
    const existing = await MentorProfile.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "Profile already exists. Use PUT to update it." });
    }

    // req.body contains the data sent from the frontend
    // We pick the fields we want to save (we never trust all fields blindly)
    const {
      name,
      title,
      subjectField,
      bio,
      avatar,
      location,
      phone,
      expertise,
      availability,
      experience,
      education,
      socialLinks,
      certifications,
      mentoringFocus
    } = req.body;

    // Create and save the new profile
    const profile = await MentorProfile.create({
      userId: req.user._id,
      name,
      title,
      subjectField,
      bio,
      avatar,
      location,
      phone,
      expertise,
      availability,
      experience,
      education,
      socialLinks,
      certifications,
      mentoringFocus
    });

    res.status(201).json({ message: "Profile created!", profile });
  } catch (error) {
    console.error("createProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/mentor/profile
// Updates the mentor's existing profile.
// ─────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      title,
      subjectField,
      bio,
      avatar,
      location,
      phone,
      expertise,
      availability,
      experience,
      education,
      socialLinks,
      certifications,
      mentoringFocus
    } = req.body;

    // 1. Update the User model if name or email changed
    if (name || email) {
      const User = require("../../auth/models/User");
      const userUpdates = {};
      if (name) userUpdates.name = name;
      if (email) userUpdates.email = email;

      await User.findByIdAndUpdate(req.user._id, { $set: userUpdates });
    }

    // 2. Update the MentorProfile model
    // findOneAndUpdate with $set handles partial updates perfectly
    const profile = await MentorProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          ...(name && { name }),
          ...(title && { title }),
          ...(subjectField && { subjectField }),
          ...(bio && { bio }),
          ...(avatar && { avatar }),
          ...(location && { location }),
          ...(phone && { phone }),
          ...(expertise && { expertise }),
          ...(availability && { availability }),
          ...(experience && { experience }),
          ...(education && { education }),
          ...(socialLinks && { socialLinks }),
          ...(certifications && { certifications }),
          ...(mentoringFocus && { mentoringFocus }),
        },
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ message: "Settings updated!", profile });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/mentor/profile/:mentorId
// Gets ANY mentor's profile by their ID (for students to view).
// This one does NOT need a login — it's a public view.
// ─────────────────────────────────────────────────────────────
const getPublicProfile = async (req, res) => {
  try {
    const { mentorId } = req.params;

    // 1. Get Profile (excluding sensitive phone number)
    const profile = await MentorProfile.findOne({ userId: mentorId }).select("-phone");

    if (!profile) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    // 2. Get Reviews for this mentor
    const reviews = await require("../models/Review").find({ mentorId })
      .sort({ createdAt: -1 })
      .limit(10); // only show last 10 reviews publicly

    res.json({
      profile,
      reviews
    });
  } catch (error) {
    console.error("getPublicProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/mentor/profile/reviews
// Gets the reviews for the logged-in mentor.
// ─────────────────────────────────────────────────────────────
const getReviews = async (req, res) => {
  try {
    const reviews = await require("../models/Review").find({ mentorId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error("getReviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getProfile, createProfile, updateProfile, getPublicProfile, getReviews };
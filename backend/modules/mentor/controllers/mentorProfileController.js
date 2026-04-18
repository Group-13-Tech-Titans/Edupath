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
    } = req.body;

    // findOneAndUpdate:
    //   1st argument — find profile by userId
    //   2nd argument — the fields to update ($set means "set these fields")
    //   3rd argument — { new: true } means return the UPDATED version (not old)
    const profile = await MentorProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
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
        },
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ message: "Profile updated!", profile });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/mentor/profile/:mentorId
// Gets ANY mentor's profile by their ID (for students to view).
// This one does NOT need a login — it's a public view.
// ─────────────────────────────────────────────────────────────
const getPublicProfile = async (req, res) => {
  try {
    // req.params.mentorId comes from the URL: /profile/:mentorId
    const profile = await MentorProfile.findOne({ userId: req.params.mentorId });

    if (!profile) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("getPublicProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export all functions so routes can use them
module.exports = { getProfile, createProfile, updateProfile, getPublicProfile };
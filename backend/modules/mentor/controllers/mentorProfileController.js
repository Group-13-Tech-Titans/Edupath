const MentorProfile = require("../models/MentorProfile");

// ─────────────────────────────────────────────────────────────
// POST /api/mentor/profile
// Creates a new mentor profile for the logged-in user.
// ─────────────────────────────────────────────────────────────
const createProfile = async (req, res) => {
  try {
    // Check if this mentor already has a profile
    const existing = await MentorProfile.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "Profile already exists. Use PUT to update it." });
    }

    const {
      name,
      title,
      subjectField,
      bio,
      avatar,
      location,
      phone,
      yearsExperience,
      responseTime,
      expertise,
      availability,
      socialLinks
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
      yearsExperience,
      responseTime,
      expertise,
      availability,
      socialLinks
    });

    res.status(201).json({ message: "Profile created!", profile });
  } catch (error) {
    console.error("createProfile error detail:", error, "Body:", req.body);
    res.status(500).json({ message: "Server error during profile creation", detail: error.message, error });
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
      yearsExperience,
      responseTime,
      expertise,
      availability,
      socialLinks
    } = req.body;

    // 1. Update the User model if name or email changed
    if (name || email) {
      const User = require("../../auth/models/User");
      const userUpdates = {};
      if (name) userUpdates.name = name;
      if (email) userUpdates.email = email;
      await User.findByIdAndUpdate(req.user._id, userUpdates);
    }

    // 2. Update the MentorProfile model
    const profile = await MentorProfile.findOneAndUpdate(
      { userId: req.user._id },
      { 
        $set: {
          name, title, subjectField, bio, avatar, location, phone, 
          yearsExperience, responseTime, expertise, availability, socialLinks
        },
        $unset: {
          experience: "",
          education: "",
          certifications: "",
          mentoringFocus: ""
        }
      },
      { new: true, upsert: true }
    ).populate("userId", "email");

    const obj = profile.toObject();
    res.json({ message: "Profile updated!", profile: { ...obj, email: obj.userId?.email } });
  } catch (error) {
    console.error("updateProfile error detail:", error, "Body:", req.body);
    res.status(500).json({ message: "Server error during profile update", detail: error.message, error });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/mentor/profile
// Fetches the profile of the currently logged-in mentor.
// ─────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const profile = await MentorProfile.findOne({ userId: req.user._id }).populate("userId", "email");
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }
    const obj = profile.toObject();
    res.json({ ...obj, email: obj.userId?.email });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/mentor/profiles
// Public route to list all mentors (optionally filter by field).
// ─────────────────────────────────────────────────────────────
const getMentors = async (req, res) => {
  try {
    const { field } = req.query;
    let query = {};

    if (field) {
      // "Super Fuzzy" Search: Split "UI/UX Design" into ["UI/UX", "Design"]
      // and match any mentor that has either in their field or expertise.
      const words = field.split(/[\s-/]+/).filter(w => w.length > 1);
      const regexes = words.map(w => new RegExp(w, "i"));
      
      query = {
        $or: [
          { subjectField: new RegExp(field, "i") }, // Try exact first
          { subjectField: { $in: regexes } },      // Try word by word
          { expertise: { $in: regexes } },         // Try expertise array
          { title: { $in: regexes } }              // Try title
        ]
      };
    }
    
    const mentors = await MentorProfile.find(query)
      .populate("userId", "email")
      .sort({ rating: -1 });
    
    const formattedMentors = mentors.map(m => {
      const obj = m.toObject();
      const userId = obj.userId?._id || obj.userId;
      const email = obj.userId?.email;
      return { ...obj, userId, email };
    });

    res.json(formattedMentors);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/mentor/profile/:mentorId
// Public route to fetch a specific mentor's profile by their ID.
// ─────────────────────────────────────────────────────────────
const getPublicProfile = async (req, res) => {
  try {
    const profile = await MentorProfile.findById(req.params.mentorId).populate("userId", "email");
    if (!profile) {
      return res.status(404).json({ message: "Mentor not found." });
    }
    const obj = profile.toObject();
    const userId = obj.userId?._id || obj.userId;
    const email = obj.userId?.email;
    res.json({ ...obj, userId, email });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/mentor/profile/reviews
// Fetches reviews for the mentor (if reviews are stored separately).
// ─────────────────────────────────────────────────────────────
const getReviews = async (req, res) => {
  try {
    // This is a placeholder. In a real app, you might have a Review model.
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createProfile,
  updateProfile,
  getProfile,
  getMentors,
  getPublicProfile,
  getReviews,
};
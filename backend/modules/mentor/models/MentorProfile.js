const mongoose = require("mongoose");

const mentorProfileSchema = new mongoose.Schema(
  {
    // Which user does this profile belong to
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one profile per mentor
    },

    // Basic info
    name: { type: String },
    title: { type: String },          // e.g. "Full-Stack Developer & Mentor"
    subjectField: { type: String },   // e.g. "Web Development"
    bio: { type: String },            // a short description about the mentor
    avatar: { type: String },         // URL to profile photo
    location: { type: String },       // e.g. "Colombo, Sri Lanka"
    phone: { type: String },
    yearsExperience: { type: String }, // e.g. "5+ Years"
    responseTime: { type: String },    // e.g. "< 24 Hours"

    // Skills / expertise tags — stored as a simple list of words
    // e.g. ["JavaScript", "React", "Node.js"]
    expertise: [{ type: String }],

    // Availability — when can they take sessions?
    // e.g. ["Monday 3pm-5pm", "Friday 10am-12pm"]
    availability: [{ type: String }],

    // Social Links (LinkedIn, Github, Website, etc.)
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      website: { type: String },
      twitter: { type: String },
    },

    // Stats (these update automatically as sessions happen)
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    hoursThisMonth: { type: Number, default: 0 },
  },
  {
    // "timestamps: true" automatically adds two fields:
    // createdAt (when profile was created)
    // updatedAt (when it was last changed)
    timestamps: true,
  }
);

module.exports = mongoose.model("MentorProfile", mentorProfileSchema);
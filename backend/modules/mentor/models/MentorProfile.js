const mongoose = require("mongoose");



const experienceSchema = new mongoose.Schema({
  role: { type: String },         // e.g. "Senior Developer"
  company: { type: String },      // e.g. "Tech Corp"
  duration: { type: String },     // e.g. "2020 - Present"
  description: { type: String },  // what they did there
});

const educationSchema = new mongoose.Schema({
  degree: { type: String },       // e.g. "B.Sc in Computer Science"
  institution: { type: String },  // e.g. "University of Colombo"
  year: { type: String },         // e.g. "2015 - 2019"
});

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

    // Skills / expertise tags — stored as a simple list of words
    // e.g. ["JavaScript", "React", "Node.js"]
    expertise: [{ type: String }],

    // Availability — when can they take sessions?
    // e.g. ["Monday 3pm-5pm", "Friday 10am-12pm"]
    availability: [{ type: String }],

    // Work history (an array of experience objects)
    experience: [experienceSchema],

    // Education history
    education: [educationSchema],

    // Social Links (LinkedIn, Github, Website, etc.)
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      website: { type: String },
      twitter: { type: String },
    },

    // Certifications (e.g. "AWS Certified Solutions Architect")
    certifications: [{ type: String }],

    // Mentoring Focus (e.g. "Career Transition", "Technical Deep Dive")
    mentoringFocus: [{ type: String }],

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
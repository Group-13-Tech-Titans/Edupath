const mongoose = require("mongoose");

// A Resource is anything a mentor shares with a student.
// It can be a video link, a PDF/PPT link, or a quiz reference.
// Think of it like a mentor sending study materials to a student.

const resourceSchema = new mongoose.Schema(
  {
    // Who shared this resource?
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Who is this resource shared with?
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Student name — saved for quick access
    studentName: { type: String },

    // What type of resource is it?
    // video   → YouTube link, recorded lecture etc.
    // pdfppt  → PDF document, PowerPoint slides
    // quiz    → a quiz or exercise
    type: {
      type: String,
      enum: ["video", "pdfppt", "quiz"],
      required: true,
    },

    // Title of the resource — required
    // e.g. "Python Data Types", "Resume Tips"
    title: { type: String, required: true },

    // Which module or section is this for?
    // e.g. "Module 01 - Basics"
    section: { type: String },

    // A short description about the resource
    description: { type: String },

    // The actual link (for video or pdfppt types)
    // e.g. "https://youtube.com/watch?v=..."
    url: { type: String },

    // Any extra notes the mentor wants to add for the student
    notes: { type: String },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Resource", resourceSchema);
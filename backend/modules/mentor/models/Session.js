const mongoose = require("mongoose");

// A Session is created when a student requests to meet a mentor.
// It goes through these stages:
//   pending → scheduled (mentor accepts) → completed
//   pending → declined (mentor rejects)

const sessionSchema = new mongoose.Schema(
  {
    // Who is the mentor for this session?
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Who is the student requesting this session?
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Student's name — saved here so we don't need to look it up every time
    studentName: { type: String },

    // What is this session about?
    topic: { type: String, required: true },

    // "1-on-1" or "Group"
    type: {
      type: String,
      enum: ["1-on-1", "Group"],
      default: "1-on-1",
    },

    // When is the session proposed?
    // e.g. "Feb 15, 2026 • 3:00 PM - 4:00 PM"
    proposedTime: { type: String },

    // How long? e.g. "1 hour", "45 mins"
    duration: { type: String },

    // Any note the student wrote when requesting
    note: { type: String },

    // Where the session tracks in its lifecycle:
    // pending   → student requested, mentor hasn't responded yet
    // scheduled → mentor accepted, session is upcoming
    // completed → session is done
    // declined  → mentor rejected the request
    status: {
      type: String,
      enum: ["pending", "scheduled", "completed", "declined"],
      default: "pending",
    },

    // Optional: a meeting link (Zoom, Google Meet, etc.)
    meetingLink: { type: String },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Session", sessionSchema);
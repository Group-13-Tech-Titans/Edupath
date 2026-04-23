const mongoose = require("mongoose");

// This model tracks the relationship between a mentor and a student.
// When a student gets assigned to a mentor, a record is created here.
// Think of it like a class register — it shows who is enrolled under who.

const mentorStudentSchema = new mongoose.Schema(
  {
    // Which mentor is this student assigned to?
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Which student?
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Student's name — saved here for quick access without extra lookups
    studentName: { type: String },

    // What are they studying? e.g. "Web Development", "Data Science & ML"
    track: { type: String },

    // Status of this student under this mentor:
    // active  → currently learning
    // paused  → taking a break
    // new     → just enrolled (less than 2 weeks)
    status: {
      type: String,
      enum: ["active", "paused", "new"],
      default: "new",
    },

    // When did this student enroll under this mentor?
    enrolledAt: {
      type: Date,
      default: Date.now,
    },

    // When did this student last do something? (last session, message, etc.)
    lastActivity: {
      type: Date,
      default: Date.now,
    },

    // Any notes the mentor wants to keep about this student
    mentorNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MentorStudent", mentorStudentSchema);
const mongoose = require("mongoose");

/**
 * CONVERSATION MODEL
 * Tracks a chat thread between one mentor and one student.
 * This aggregates info like "unread count" and "last message" so we don't have to
 * calculate them by scanning all messages every time the page loads.
 */
const conversationSchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Cached info for the UI
    studentName: { type: String },
    track: { type: String }, // e.g. "Web Development"
    
    lastMessage: { type: String },
    lastMessageTime: { type: Date, default: Date.now },

    // How many messages are unread by the MENTOR specifically
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure there is only ONE conversation between a specific mentor and student
conversationSchema.index({ mentorId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", conversationSchema);

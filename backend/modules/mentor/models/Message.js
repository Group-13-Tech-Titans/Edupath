const mongoose = require("mongoose");

/**
 * MESSAGE MODEL
 * Stores individual messages sent between mentors and students.
 */
const messageSchema = new mongoose.Schema(
  {
    // The conversation this message belongs to
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    
    // Who sent the message?
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Is the sender a 'mentor' or a 'student'?
    senderRole: {
      type: String,
      enum: ["mentor", "student"],
      required: true,
    },

    // The actual text content
    text: {
      type: String,
      required: true,
    },

    // Has the recipient seen this message yet?
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Automatically adds createdAt and updatedAt
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);

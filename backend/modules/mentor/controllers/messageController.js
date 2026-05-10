const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const MentorStudent = require("../models/MentorStudent");
const { getIO } = require("../../../utils/socketManager");

/**
 * 1. GET /api/mentor/messages/conversations
 * Returns all chat threads for the logged-in mentor.
 */
const getConversations = async (req, res) => {
  try {
    const mentorId = req.user._id;

    // Find all conversations where this mentor is involved
    // Sort by the most recent message time
    const conversations = await Conversation.find({ mentorId }).sort({
      lastMessageTime: -1,
    });

    res.json(conversations);
  } catch (error) {
    console.error("getConversations error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

/**
 * 2. GET /api/mentor/messages/conversations/:studentId
 * Returns all messages in a specific chat thread.
 */
const getMessages = async (req, res) => {
  try {
    const mentorId = req.user._id;
    const { studentId } = req.params;

    // Find the conversation first
    const convo = await Conversation.findOne({ mentorId, studentId });

    if (!convo) {
      // If no conversation exists yet, return an empty list (it's not an error)
      return res.json([]);
    }

    // Find all messages belonging to this conversation, oldest first
    const messages = await Message.find({ conversationId: convo._id }).sort({
      createdAt: 1,
    });

    res.json(messages);
  } catch (error) {
    console.error("getMessages error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

/**
 * 3. POST /api/mentor/messages/send
 * Mentor sends a message to a student.
 */
const sendMessage = async (req, res) => {
  try {
    const mentorId = req.user._id;
    const { studentId, text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // 1. Find or Create the Conversation
    let convo = await Conversation.findOne({ mentorId, studentId });

    if (!convo) {
      // Look up student details to initialize the conversation
      const student = await MentorStudent.findOne({ mentorId, studentId });
      
      convo = await Conversation.create({
        mentorId,
        studentId,
        studentName: student ? student.studentName : "Unknown Student",
        track: student ? student.track : "General",
      });
    }

    // 2. Create the Message
    const newMessage = await Message.create({
      conversationId: convo._id,
      senderId: mentorId,
      senderRole: "mentor",
      text,
      isRead: true, // mentor sent it, so they have "read" their own message
    });

    // 3. Update Conversation "Last Message" cached data
    convo.lastMessage = text;
    convo.lastMessageTime = Date.now();
    // We don't increment unreadCount here because the mentor is the sender
    await convo.save();

    // 4. Emit Real-time event via Socket.io
    const io = getIO();
    io.to(studentId).emit("receive_message", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

/**
 * 4. PUT /api/mentor/messages/conversations/:studentId/read
 * Marks all messages in a conversation as read by the mentor.
 */
const markAsRead = async (req, res) => {
  try {
    const mentorId = req.user._id;
    const { studentId } = req.params;

    const convo = await Conversation.findOne({ mentorId, studentId });

    if (!convo) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Update all unread messages from the student in this conversation
    await Message.updateMany(
      { conversationId: convo._id, senderRole: "student", isRead: false },
      { $set: { isRead: true } }
    );

    // Reset the unread count badge for this conversation
    convo.unreadCount = 0;
    await convo.save();

    res.json({ message: "Conversation marked as read" });
  } catch (error) {
    console.error("markAsRead error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

/**
 * 5. GET /api/mentor/messages/unread-count
 * Returns the total unread count for the mentor's notification badge.
 */
const getUnreadCount = async (req, res) => {
  try {
    const mentorId = req.user._id;

    // Sum up the unreadCount from all conversations for this mentor
    const results = await Conversation.aggregate([
      { $match: { mentorId } },
      { $group: { _id: null, total: { $sum: "$unreadCount" } } },
    ]);

    const total = results.length > 0 ? results[0].total : 0;

    res.json({ unreadCount: total });
  } catch (error) {
    console.error("getUnreadCount error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
};

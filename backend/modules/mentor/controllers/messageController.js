const mongoose = require("mongoose");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Session = require("../models/Session");
const User = require("../../auth/models/User");
const { getIO } = require("../../../utils/socketManager");

/**
 * 1. GET /api/mentor/messages/conversations
 * Returns all chat threads for the logged-in user (mentor or student).
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log(`[getConversations] User: ${userId}`);

    const query = {
      $or: [{ mentorId: userObjectId }, { studentId: userObjectId }]
    };

    const conversationDocs = await Conversation.find(query).sort({ lastMessageTime: -1 });
    console.log(`[getConversations] Found ${conversationDocs.length} conversations.`);

    const sanitized = conversationDocs.map(c => ({
      ...c.toObject(),
      mentorId: c.mentorId.toString(),
      studentId: c.studentId.toString(),
      id: c._id.toString()
    }));

    res.json(sanitized);
  } catch (error) {
    console.error("getConversations error:", error.stack || error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

/**
 * 2. GET /api/mentor/messages/conversations/:targetId
 * Returns all messages in a specific chat thread.
 */
const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const effectiveRole = (req.user.role === "mentor" || req.user.isMentor) ? "mentor" : "student";
    const { targetId } = req.params;

    let query = {};
    if (effectiveRole === "mentor") {
      query = { mentorId: userId, studentId: targetId };
    } else {
      query = { studentId: userId, mentorId: targetId };
    }

    // Find the conversation first
    const convo = await Conversation.findOne(query);

    if (!convo) {
      return res.json([]);
    }

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
 * User sends a message to another user.
 */
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const senderRole = (req.user.role === "mentor" || req.user.isMentor) ? "mentor" : "student";
    const { receiverId, text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    let mentorId, studentId;
    if (senderRole === "mentor") {
      mentorId = senderId;
      studentId = receiverId;
    } else {
      mentorId = receiverId;
      studentId = senderId;
    }

    // 1. Find or Create the Conversation
    let convo = await Conversation.findOne({ mentorId, studentId });

    if (!convo) {
      // Look up names to initialize the conversation
      const mentor = await User.findById(mentorId);
      const student = await User.findById(studentId);

      convo = await Conversation.create({
        mentorId,
        studentId,
        studentName: student ? student.name : "Student",
        mentorName: mentor ? mentor.name : "Mentor",
        track: "General",
      });
    }

    // 2. Create the Message
    const newMessage = await Message.create({
      conversationId: convo._id,
      senderId: senderId,
      senderRole: senderRole,
      text,
      isRead: false,
    });

    // 3. Update Conversation cached data
    convo.lastMessage = text;
    convo.lastMessageTime = Date.now();

    // Increment unread count for the RECEIVER
    if (senderRole === "mentor") {
      convo.studentUnreadCount = (convo.studentUnreadCount || 0) + 1;
    } else {
      convo.unreadCount = (convo.unreadCount || 0) + 1;
    }

    await convo.save();

    // 4. Emit Real-time event
    const io = getIO();
    const sender = await User.findById(senderId);
    const messageWithSender = {
      ...newMessage.toObject(),
      senderName: sender ? sender.name : "Someone"
    };
    io.to(receiverId.toString()).emit("receive_message", messageWithSender);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

/**
 * 4. PUT /api/mentor/messages/conversations/:targetId/read
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetId } = req.params;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const targetObjectId = new mongoose.Types.ObjectId(targetId);

    // Find the conversation where the user is a participant
    const convo = await Conversation.findOne({
      $or: [
        { mentorId: userObjectId, studentId: targetObjectId },
        { studentId: userObjectId, mentorId: targetObjectId }
      ]
    });

    if (!convo) {
      return res.json({ message: "No conversation found" });
    }

    // Determine the user's role in THIS conversation
    const isMentorInThisChat = convo.mentorId.toString() === userId.toString();

    console.log(`[markAsRead] User: ${userId}, Chat: ${convo._id}, IsMentorHere: ${isMentorInThisChat}`);

    // Mark messages sent by the OTHER person as read
    const otherRole = isMentorInThisChat ? "student" : "mentor";
    const updateResult = await Message.updateMany(
      { conversationId: convo._id, senderRole: otherRole, isRead: false },
      { $set: { isRead: true } }
    );

    console.log(`[markAsRead] Updated ${updateResult.modifiedCount} messages.`);

    // Reset the unread count for the CURRENT user
    if (isMentorInThisChat) {
      convo.unreadCount = 0;
    } else {
      convo.studentUnreadCount = 0;
    }
    await convo.save();

    res.json({ message: "Conversation marked as read" });
  } catch (error) {
    console.error("markAsRead error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};


/**
 * 5. GET /api/mentor/messages/unread-count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log(`[getUnreadCount] User: ${userId}`);

    // Sum unread messages from all conversations where user is a participant
    // If user is the mentor, count 'unreadCount'. If user is the student, count 'studentUnreadCount'.
    const results = await Conversation.aggregate([
      {
        $match: {
          $or: [{ mentorId: userObjectId }, { studentId: userObjectId }]
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $cond: [
                { $eq: ["$mentorId", userObjectId] },
                { $ifNull: ["$unreadCount", 0] },
                { $ifNull: ["$studentUnreadCount", 0] }
              ]
            }
          }
        }
      },
    ]);

    console.log(`[getUnreadCount] Aggregation results:`, JSON.stringify(results));

    const total = results.length > 0 ? results[0].total : 0;
    res.json({ unreadCount: total });
  } catch (error) {
    console.error("getUnreadCount error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

/**
 * 6. GET /api/student/messages/mentors
 * Returns a list of mentors the student can start a chat with.
 */
const getEligibleMentors = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Find all sessions this student has with any mentor
    const sessions = await Session.find({ studentId }).select("mentorId mentorName");

    // Get unique mentors
    const uniqueMentorsMap = new Map();
    sessions.forEach(s => {
      uniqueMentorsMap.set(s.mentorId.toString(), s.mentorName);
    });

    const mentors = Array.from(uniqueMentorsMap).map(([id, name]) => ({ id, name }));

    res.json(mentors);
  } catch (error) {
    console.error("getEligibleMentors error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  getEligibleMentors,
};

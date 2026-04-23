const Session = require("../models/Session");

/**
 * GET /api/mentor/sessions
 * Returns sessions for the logged-in mentor.
 * Supports ?status=... (pending, scheduled, completed, declined)
 */
const getSessions = async (req, res) => {
  try {
    const { status, studentId, search, sort } = req.query;
    const query = { mentorId: req.user._id };

    if (status && status !== "all") {
      query.status = status;
    }

    if (studentId) {
      query.studentId = studentId;
    }

    if (search) {
      query.$or = [
        { topic: { $regex: search, $options: "i" } },
        { studentName: { $regex: search, $options: "i" } }
      ];
    }

    let sessionsQuery = Session.find(query);

    // Sorting logic
    if (sort === "time_asc") sessionsQuery = sessionsQuery.sort({ proposedTime: 1 });
    else if (sort === "time_desc") sessionsQuery = sessionsQuery.sort({ proposedTime: -1 });
    else sessionsQuery = sessionsQuery.sort({ createdAt: -1 }); // Default: newest created first

    const sessions = await sessionsQuery;
    res.json(sessions);
  } catch (error) {
    console.error("getSessions error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

const requestSession = async (req, res) => {
  try {
    const { mentorId, topic, type, proposedTime, duration, note } = req.body;

    const session = await Session.create({
      mentorId,
      studentId: req.user._id,
      studentName: req.user.name,
      topic,
      type: type || "1-on-1",
      proposedTime,
      duration,
      note,
      status: "pending",
    });

    res.status(201).json({ message: "Session requested!", session });
  } catch (error) {
    console.error("requestSession error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

const acceptSession = async (req, res) => {
  try {
    console.log("acceptSession called");
    console.log("Session ID from URL:", req.params.id);
    console.log("Logged in user ID:", req.user._id);

    // Search only by session ID first — no mentorId filter
    const session = await Session.findById(req.params.id);

    console.log("Session found:", session);

    if (!session) {
      return res.status(404).json({ message: "Session not found — check the ID is correct" });
    }

    console.log("Session mentorId:", session.mentorId);
    console.log("Logged in user _id:", req.user._id);
    console.log("Do they match?", session.mentorId.toString() === req.user._id.toString());

    if (session.mentorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not the mentor for this session" });
    }

    if (session.status !== "pending") {
      return res.status(400).json({ message: `Session status is '${session.status}', not pending` });
    }

    session.status = "scheduled";
    if (req.body && req.body.meetingLink) session.meetingLink = req.body.meetingLink;
    await session.save();

    res.json({ message: "Session accepted!", session });
  } catch (error) {
    console.error("acceptSession error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

const declineSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.mentorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not the mentor for this session" });
    }

    if (session.status !== "pending") {
      return res.status(400).json({ message: `Session status is '${session.status}', not pending` });
    }

    session.status = "declined";
    await session.save();

    res.json({ message: "Session declined", session });
  } catch (error) {
    console.error("declineSession error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

const completeSession = async (req, res) => {
  try {
    const { discussedTopics, mentorNotes } = req.body;
    
    const session = await Session.findOne({ 
      _id: req.params.id, 
      mentorId: req.user._id 
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.status !== "scheduled") {
      return res.status(400).json({ message: `Session status is '${session.status}', not scheduled` });
    }

    session.status = "completed";
    if (discussedTopics) session.discussedTopics = discussedTopics;
    if (mentorNotes) session.mentorNotes = mentorNotes;
    
    await session.save();

    res.json({ message: "Session marked as completed!", session });
  } catch (error) {
    console.error("completeSession error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const [pending, upcoming, completed, declined] = await Promise.all([
      Session.countDocuments({ mentorId: req.user._id, status: "pending" }),
      Session.countDocuments({ mentorId: req.user._id, status: "scheduled" }),
      Session.countDocuments({ mentorId: req.user._id, status: "completed" }),
      Session.countDocuments({ mentorId: req.user._id, status: "declined" }),
    ]);
    res.json({ pending, upcoming, completed, declined, total: pending + upcoming + completed });

  } catch (error) {
    console.error("getStats error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

module.exports = {
  getSessions,
  requestSession,
  acceptSession,
  declineSession,
  completeSession,
  getStats,
};
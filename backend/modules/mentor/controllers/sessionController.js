const Session = require("../models/Session");

const getRequests = async (req, res) => {
  try {
    const sessions = await Session.find({
      mentorId: req.user._id,
      status: "pending",
    }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error("getRequests error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

const getUpcoming = async (req, res) => {
  try {
    const sessions = await Session.find({
      mentorId: req.user._id,
      status: "scheduled",
    }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error("getUpcoming error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

const getPast = async (req, res) => {
  try {
    const sessions = await Session.find({
      mentorId: req.user._id,
      status: "completed",
    }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error("getPast error:", error.message);
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
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.mentorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not the mentor for this session" });
    }

    if (session.status !== "scheduled") {
      return res.status(400).json({ message: `Session status is '${session.status}', not scheduled` });
    }

    session.status = "completed";
    await session.save();

    res.json({ message: "Session marked as completed!", session });
  } catch (error) {
    console.error("completeSession error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const [pending, upcoming, completed] = await Promise.all([
      Session.countDocuments({ mentorId: req.user._id, status: "pending" }),
      Session.countDocuments({ mentorId: req.user._id, status: "scheduled" }),
      Session.countDocuments({ mentorId: req.user._id, status: "completed" }),
    ]);
    res.json({ pending, upcoming, completed });
  } catch (error) {
    console.error("getStats error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

module.exports = {
  getRequests,
  getUpcoming,
  getPast,
  requestSession,
  acceptSession,
  declineSession,
  completeSession,
  getStats,
};
const Session = require("../models/Session");
const MentorStudent = require("../models/MentorStudent");
const Resource = require("../models/Resource");

/**
 * GET /api/mentor/dashboard
 * Aggregates all data needed for the Mentor Dashboard in a single call.
 */
const getDashboardData = async (req, res) => {
  try {
    const mentorId = req.user._id;

    // 1. Fetch Counts for Stats
    const [activeStudents, upcomingCount, pendingCount, resourcesCount] = await Promise.all([
      MentorStudent.countDocuments({ mentorId, status: "active" }),
      Session.countDocuments({ mentorId, status: "scheduled" }),
      Session.countDocuments({ mentorId, status: "pending" }),
      Resource.countDocuments({ mentorId }),
    ]);

    // 2. Fetch Latest Requests
    const recentRequests = await Session.find({ mentorId, status: "pending" })
      .sort({ createdAt: -1 })
      .limit(3);

    // 3. Fetch Upcoming Sessions
    const upcomingSessions = await Session.find({ mentorId, status: "scheduled" })
      .sort({ createdAt: 1 }) // Closest time first
      .limit(3);

    // 4. Fetch Recently Active Students
    const studentOverview = await MentorStudent.find({ mentorId })
      .sort({ updatedAt: -1 })
      .limit(3);

    // 5. Build Recent Activity Feed
    // We combine recent completed sessions and shared resources
    const [recentSessions, recentResources] = await Promise.all([
      Session.find({ mentorId, status: "completed" }).sort({ updatedAt: -1 }).limit(3),
      Resource.find({ mentorId }).sort({ createdAt: -1 }).limit(3),
    ]);

    const activityFeed = [
      ...recentSessions.map(s => ({
        type: "session",
        title: "Session Completed",
        desc: `With ${s.studentName} - ${s.topic}`,
        time: s.updatedAt,
        accent: "border-emerald-400"
      })),
      ...recentResources.map(r => ({
        type: "resource",
        title: "Resource Shared",
        desc: `${r.title} with ${r.studentName || 'All Students'}`,
        time: r.createdAt,
        accent: "border-sky-400"
      }))
    ].sort((a, b) => b.time - a.time).slice(0, 5);

    // 6. Return everything
    res.json({
      stats: {
        activeStudents,
        upcomingSessions: upcomingCount,
        pendingRequests: pendingCount,
        resourcesShared: resourcesCount
      },
      recentRequests,
      upcomingSessions,
      studentOverview,
      activityFeed
    });

  } catch (error) {
    console.error("getDashboardData error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

module.exports = { getDashboardData };

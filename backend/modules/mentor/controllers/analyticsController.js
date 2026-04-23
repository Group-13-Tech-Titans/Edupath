const Session = require("../models/Session");
const MentorStudent = require("../models/MentorStudent");
const Review = require("../models/Review");
const mongoose = require("mongoose");

/**
 * GET /api/mentor/analytics
 * Aggregates all mentoring data into a single response for the Analytics page.
 */
const getMentorAnalytics = async (req, res) => {
  try {
    const mentorId = req.user._id;

    // 1. High-Level Stats
    const [totalStudents, sessions, reviews, tracks] = await Promise.all([
      MentorStudent.countDocuments({ mentorId }),
      Session.find({ mentorId, status: "completed" }),
      Review.find({ mentorId }),
      MentorStudent.aggregate([
        { $match: { mentorId: new mongoose.Types.ObjectId(mentorId) } },
        { $group: { _id: "$track", count: { $sum: 1 } } }
      ])
    ]);

    // 2. Calculate Mentoring Hours
    // (Assumes duration is string like "45 mins" or "1 hour")
    let totalMinutes = 0;
    sessions.forEach(s => {
      const d = s.duration || "0";
      if (d.includes("hour")) {
        totalMinutes += parseFloat(d) * 60;
      } else {
        totalMinutes += parseFloat(d);
      }
    });
    const totalHours = Math.round(totalMinutes / 60);

    // 3. Calculate Average Rating
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

    // 4. Monthly Session Volume (Last 6 Months)
    const monthlyVolume = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      
      // Count sessions in this month
      const count = sessions.filter(s => {
        const sDate = new Date(s.createdAt);
        return sDate.getMonth() === d.getMonth() && sDate.getFullYear() === d.getFullYear();
      }).length;

      monthlyVolume.push({ month: monthName, count });
    }

    // 5. Tracks Distribution Percentage
    const totalTracksCount = tracks.reduce((acc, t) => acc + t.count, 0);
    const tracksDistribution = tracks.map(t => ({
      name: t._id || "Other",
      percent: totalTracksCount > 0 ? Math.round((t.count / totalTracksCount) * 100) : 0
    }));

    // 6. Weekly Activity Heatmap (Simulated from session data)
    // We'll create a 7x24 grid of activity
    const heatmap = [];
    // For now, we'll return a simplified version or the raw session times for the frontend to process
    // But to match the frontend request, let's just send the aggregated counts
    
    res.json({
      stats: [
        { label: "Active Students", value: totalStudents.toString(), trend: "Total enrolled" },
        { label: "Total Sessions", value: sessions.length.toString(), trend: "Completed" },
        { label: "Mentoring Hours", value: totalHours.toString(), trend: "Cumulative" },
        { label: "Avg. Rating", value: avgRating, trend: `From ${reviews.length} reviews` },
      ],
      monthlyVolume,
      tracksDistribution,
      totalReviews: reviews.length
    });

  } catch (error) {
    console.error("getMentorAnalytics error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

module.exports = { getMentorAnalytics };

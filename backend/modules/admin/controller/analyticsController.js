const User = require("../../auth/models/User"); 

// Generate student registration statistics for dashboard charts
exports.getStudentGrowthStats = async (req, res) => {
  try {
    const { range = "6m" } = req.query; 
    const startDate = new Date();
    let groupBy = "month"; 

    // Determine the date range and grouping format based on the query parameter
    if (range === "1d") { startDate.setHours(startDate.getHours() - 24); groupBy = "hour"; }
    else if (range === "7d") { startDate.setDate(startDate.getDate() - 7); groupBy = "day"; }
    else if (range === "30d") { startDate.setDate(startDate.getDate() - 30); groupBy = "day"; }
    else if (range === "3m") { startDate.setMonth(startDate.getMonth() - 3); }
    else if (range === "6m") { startDate.setMonth(startDate.getMonth() - 6); }
    else if (range === "1y") { startDate.setFullYear(startDate.getFullYear() - 1); }

    // Setup MongoDB aggregation group stage
    const groupStage = groupBy === "hour"
      ? { year: { $year: "$actualCreatedAt" }, month: { $month: "$actualCreatedAt" }, day: { $dayOfMonth: "$actualCreatedAt" }, hour: { $hour: "$actualCreatedAt" } }
      : groupBy === "day"
      ? { year: { $year: "$actualCreatedAt" }, month: { $month: "$actualCreatedAt" }, day: { $dayOfMonth: "$actualCreatedAt" } }
      : { year: { $year: "$actualCreatedAt" }, month: { $month: "$actualCreatedAt" } };

    // Setup sorting stage to keep chart data chronological
    const sortStage = groupBy === "hour" 
      ? { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 }
      : groupBy === "day" 
      ? { "_id.year": 1, "_id.month": 1, "_id.day": 1 } : { "_id.year": 1, "_id.month": 1 };

    // Aggregate user data from the database
    const studentStats = await User.aggregate([
      { $addFields: { actualCreatedAt: { $ifNull: ["$createdAt", { $toDate: "$_id" }] } } },
      { $match: { role: "student", actualCreatedAt: { $gte: startDate } } },
      { $group: { _id: groupStage, count: { $sum: 1 } } },
      { $sort: sortStage }
    ]);

    // Format the data for the Recharts frontend component
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedData = studentStats.map(stat => {
      if (groupBy === "hour") {
        const ampm = stat._id.hour >= 12 ? 'PM' : 'AM';
        const hour12 = stat._id.hour % 12 || 12;
        return { name: `${hour12} ${ampm}`, Students: stat.count };
      } else if (groupBy === "day") {
        return { name: `${monthNames[stat._id.month - 1]} ${stat._id.day}`, Students: stat.count };
      } else {
        return { name: monthNames[stat._id.month - 1], Students: stat.count };
      }
    });

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch student statistics." });
  }
};
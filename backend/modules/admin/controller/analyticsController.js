const User = require("../../auth/models/User"); 

// Generate student cumulative growth statistics for dashboard charts
exports.getStudentGrowthStats = async (req, res) => {
  try {
    const { range = "6m" } = req.query; 
    
    const endDate = new Date(); 
    const startDate = new Date(); 
    let groupBy = "month"; 

    // 1. Determine date ranges
    if (range === "1d") { startDate.setHours(startDate.getHours() - 24); groupBy = "hour"; }
    else if (range === "7d") { startDate.setDate(startDate.getDate() - 7); groupBy = "day"; }
    else if (range === "30d") { startDate.setDate(startDate.getDate() - 30); groupBy = "day"; }
    else if (range === "3m") { startDate.setMonth(startDate.getMonth() - 3); }
    else if (range === "6m") { startDate.setMonth(startDate.getMonth() - 6); }
    else if (range === "1y") { startDate.setFullYear(startDate.getFullYear() - 1); }

    const groupStage = groupBy === "hour"
      ? { year: { $year: "$actualCreatedAt" }, month: { $month: "$actualCreatedAt" }, day: { $dayOfMonth: "$actualCreatedAt" }, hour: { $hour: "$actualCreatedAt" } }
      : groupBy === "day"
      ? { year: { $year: "$actualCreatedAt" }, month: { $month: "$actualCreatedAt" }, day: { $dayOfMonth: "$actualCreatedAt" } }
      : { year: { $year: "$actualCreatedAt" }, month: { $month: "$actualCreatedAt" } };

    // 2. Aggregate user data
    const studentStats = await User.aggregate([
      { $addFields: { actualCreatedAt: { $ifNull: ["$createdAt", { $toDate: "$_id" }] } } },
      { $match: { role: "student", actualCreatedAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: groupStage, count: { $sum: 1 } } }
    ]);

    // 3. Create Dictionary
    const statsDict = {};
    studentStats.forEach(stat => {
      let key;
      if (groupBy === "hour") key = `${stat._id.year}-${stat._id.month}-${stat._id.day}-${stat._id.hour}`;
      else if (groupBy === "day") key = `${stat._id.year}-${stat._id.month}-${stat._id.day}`;
      else key = `${stat._id.year}-${stat._id.month}`;
      
      statsDict[key] = stat.count; 
    });

    // 4. Generate Cumulative Timeline
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedData = [];
    let currDate = new Date(startDate); 

    //store total ongoing student count
    let runningTotal = 0; 


    while (currDate <= endDate) {
      let key, name;

      if (groupBy === "hour") {
        key = `${currDate.getFullYear()}-${currDate.getMonth() + 1}-${currDate.getDate()}-${currDate.getHours()}`;
        const ampm = currDate.getHours() >= 12 ? 'PM' : 'AM';
        const hour12 = currDate.getHours() % 12 || 12;
        name = `${hour12} ${ampm}`;
        currDate.setHours(currDate.getHours() + 1); 
      } 
      else if (groupBy === "day") {
        key = `${currDate.getFullYear()}-${currDate.getMonth() + 1}-${currDate.getDate()}`;
        name = `${monthNames[currDate.getMonth()]} ${currDate.getDate()}`;
        currDate.setDate(currDate.getDate() + 1); 
      } 
      else { 
        key = `${currDate.getFullYear()}-${currDate.getMonth() + 1}`;
        name = `${monthNames[currDate.getMonth()]}`;
        currDate.setMonth(currDate.getMonth() + 1); 
      }

      //get number of student count for specific time period (hour/day/month) 
      const newStudentsThatDay = statsDict[key] || 0; 
      
      //add new student count to the ongoing total
      runningTotal += newStudentsThatDay; 

      formattedData.push({
        name: name,
        Students: runningTotal 
      });
    }

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Chart Data Error: ", error);
    res.status(500).json({ message: "Failed to fetch student statistics." });
  }
};
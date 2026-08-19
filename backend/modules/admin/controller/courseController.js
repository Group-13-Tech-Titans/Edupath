const Course = require("../../courses/models/course"); 

// Get all courses that are waiting for review
exports.getPendingCourses = async (req, res) => {
  try {
    const pendingCourses = await Course.find({ status: "pending" }); // Fetch courses with "pending" status
    res.status(200).json({ success: true, courses: pendingCourses }); 
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses." });
  }
};

// Get courses by status
exports.getCourses = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const courses = await Course.find(query);
    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses." });
  }
};

// Get counts for pending, approved, and rejected courses
exports.getCourseStats = async (req, res) => {
  try {
    const pending = await Course.countDocuments({ status: "pending" }); // Count courses with "pending" status
    const approved = await Course.countDocuments({ status: "approved" });  // Count courses with "approved" status
    const rejected = await Course.countDocuments({ status: "rejected" });  // Count courses with "rejected" status
    
    res.status(200).json({ success: true, stats: { pending, approved, rejected } });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats." });
  }
};

// Get details of a single course by its ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch course." });
  }
};

// Submit an admin review for a course (Approve/Reject)
exports.adminReviewCourse = async (req, res) => {
  try {
    const { decision, rating, notes, reviewerName, reviewerEmail } = req.body; // Extract review details from request body
    const course = await Course.findById(req.params.id);
    
    // Update course status and attach review details
    course.status = decision;
    course.review = {
      decision, 
      rating: Number(rating) || 0, //number rating, default to 0 if not provided
      notes: notes || "",
      reviewerName: reviewerName || "Admin",
      reviewerEmail: reviewerEmail || req.user?.email, 
      reviewedAt: new Date()
    };
    

    // Save the updated course with review details
    await course.save();
    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit review." });
  }
};
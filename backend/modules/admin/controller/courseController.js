const Course = require("../../courses/models/course"); 

// Get all courses that are waiting for review
exports.getPendingCourses = async (req, res) => {
  try {
    const pendingCourses = await Course.find({ status: "pending" });
    res.status(200).json({ success: true, courses: pendingCourses });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses." });
  }
};

// Get counts for pending, approved, and rejected courses
exports.getCourseStats = async (req, res) => {
  try {
    const pending = await Course.countDocuments({ status: "pending" });
    const approved = await Course.countDocuments({ status: "approved" }); 
    const rejected = await Course.countDocuments({ status: "rejected" }); 
    
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
    const { decision, rating, notes, reviewerName, reviewerEmail } = req.body;
    const course = await Course.findById(req.params.id);
    
    // Update course status and attach review details
    course.status = decision;
    course.review = {
      decision, 
      rating: Number(rating) || 0, 
      notes: notes || "",
      reviewerName: reviewerName || "Admin", 
      reviewerEmail: reviewerEmail || req.user?.email, 
      reviewedAt: new Date()
    };
    
    await course.save();
    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit review." });
  }
};
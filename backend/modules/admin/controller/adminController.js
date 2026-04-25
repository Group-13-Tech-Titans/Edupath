
const User = require("../../auth/models/User"); 
const Course = require("../../courses/models/course"); 
const sendEmail = require("../../../utils/sendEmail"); 
const { welcomeEmail,educatorVerificationResultEmail} = require("../../../utils/emailTemplates");
const bcrypt = require("bcryptjs");
const BCRYPT_SALT_ROUNDS = 10;

exports.adminWelcome = (req, res) => res.json({ message: "Welcome Admin" });

exports.createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role, specializationTag } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const newUser = await User.create({
      name: name || email.split("@")[0],
      email,
      password: hashedPassword,
      role: role || "student",
      specializationTag: role === "reviewer" ? specializationTag : null,
      authProvider: "local",
      isVerified: true, 
    });

    const safe = newUser.toObject();
    delete safe.password;
    safe.id = safe._id.toString();
    return res.status(201).json({ message: "User created successfully", user: safe });
  } catch (err) {
    res.status(500).json({ message: "User creation failed", error: err.message });
  }
};

// ==========================================
//   REVIEWER MANAGEMENT
// ==========================================
exports.getAllReviewers = async (req, res) => {
  try {
    const reviewers = await User.find({ role: "reviewer" }).select("-password");
    res.json(reviewers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviewers" });
  }
};

exports.createReviewer = async (req, res) => {
  try {
    const { name, email, password, specializationTags } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const newUser = await User.create({
      name, email, password: hashedPassword, role: "reviewer",
      specializationTags: specializationTags || [], authProvider: "local", isVerified: true, 
    });
    res.status(201).json({ message: "Reviewer created", id: newUser._id });

    const emailContent = welcomeEmail({ name: newUser.name, email: newUser.email, role: "reviewer" });

    await sendEmail({
      to: newUser.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    });
    res.status(201).json({ message: "Reviewer created and email sent!", id: newUser._id });
  } catch (err) {
    res.status(500).json({ message: "Creation failed" });
  }
};

exports.updateReviewer = async (req, res) => {
  try {
    const { name, email, password, specializationTags } = req.body;
    const updateData = { name, email, specializationTags: specializationTags || [] };
    if (password) updateData.password = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, role: "reviewer" }, { $set: updateData }, { returnDocument: 'after' }
    ).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

exports.deleteReviewer = async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.params.id, role: "reviewer" });
    res.json({ message: "Reviewer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// ==========================================
//   EDUCATOR VERIFICATION
// ==========================================
exports.getPendingEducators = async (req, res) => {
  try {
    const pendingEducators = await User.find({ role: "educator", status: "PENDING_VERIFICATION" }).select("-password");
    res.status(200).json({ success: true, educators: pendingEducators });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending educators." });
  }
};

// Verify (Approve/Reject) an educator
exports.verifyEducator = async (req, res) => {
  try {
    const educatorId = req.params.id;
    const { status } = req.body; // Expects "approved" or "rejected"

    const updatedEducator = await User.findByIdAndUpdate(
      educatorId,
      { status: status }, 
      { new: true } 
    ).select("-password");

    if (!updatedEducator) {
      return res.status(404).json({ message: "Educator not found" });
    }

    try {
      const emailContent = educatorVerificationResultEmail({
        educatorName: updatedEducator.name,
        status: status 
      });

      await sendEmail({
        to: updatedEducator.email, 
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html
      });
      console.log(`✅ Notification email sent to Educator: ${updatedEducator.email}`);
    } catch (emailError) {
      console.error("⚠️ Failed to send verification email to educator:", emailError.message);
    }

    res.status(200).json({
      success: true,
      message: `Educator successfully ${status} and notified via email!`,
      educator: updatedEducator
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to verify educator." });
  }
};

// Reject an educator explicitly (Dedicated route)
exports.rejectEducator = async (req, res) => {
  try {
    const educatorId = req.params.id;

    const updatedEducator = await User.findByIdAndUpdate(
      educatorId,
      { status: "REJECTED" }, 
      { new: true } 
    ).select("-password");

    if (!updatedEducator) {
      return res.status(404).json({ message: "Educator not found" });
    }

    try {
      const emailContent = educatorVerificationResultEmail({
        educatorName: updatedEducator.name,
        status: "rejected"
      });

      await sendEmail({
        to: updatedEducator.email, 
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html
      });
      console.log(`✅ Rejection email sent to Educator: ${updatedEducator.email}`);
    } catch (emailError) {
      console.error("⚠️ Failed to send rejection email to educator:", emailError.message);
    }

    res.status(200).json({
      success: true,
      message: "Educator successfully rejected and notified via email.",
      educator: updatedEducator
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject educator." });
  }
};
// ==========================================
//   COURSE MANAGEMENT
// ==========================================
exports.getPendingCourses = async (req, res) => {
  try {
    const pendingCourses = await Course.find({ status: "pending" });
    res.status(200).json({ success: true, courses: pendingCourses });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses." });
  }
};

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

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch course." });
  }
};

exports.adminReviewCourse = async (req, res) => {
  try {
    const { decision, rating, notes, reviewerName, reviewerEmail } = req.body;
    const course = await Course.findById(req.params.id);
    
    course.status = decision;
    course.review = {
      decision, rating: Number(rating) || 0, notes: notes || "",
      reviewerName: reviewerName || "Admin", reviewerEmail: reviewerEmail || req.user?.email, reviewedAt: new Date()
    };
    await course.save();
    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit review." });
  }
};

// ==========================================
//   DASHBOARD STATS (CHARTS)
// ==========================================
exports.getStudentGrowthStats = async (req, res) => {
  try {
    const { range = "6m" } = req.query; 
    const startDate = new Date();
    let groupBy = "month"; 

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

    const sortStage = groupBy === "hour" 
      ? { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 }
      : groupBy === "day" 
      ? { "_id.year": 1, "_id.month": 1, "_id.day": 1 } : { "_id.year": 1, "_id.month": 1 };

    const studentStats = await User.aggregate([
      { $addFields: { actualCreatedAt: { $ifNull: ["$createdAt", { $toDate: "$_id" }] } } },
      { $match: { role: "student", actualCreatedAt: { $gte: startDate } } },
      { $group: { _id: groupStage, count: { $sum: 1 } } },
      { $sort: sortStage }
    ]);

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
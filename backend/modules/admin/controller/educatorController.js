const User = require("../../auth/models/User"); 
const sendEmail = require("../../../utils/sendEmail"); 
const { educatorVerificationResultEmail } = require("../../../utils/emailTemplates");

//get pending educators for admin review
exports.getPendingEducators = async (req, res) => {
  try {
    const pendingEducators = await User.find({ role: "educator", status: "PENDING_VERIFICATION" }).select("-password");
    res.status(200).json({ success: true, educators: pendingEducators });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending educators." });
  }
};

// Approve or Reject an educator and notify them via email
exports.verifyEducator = async (req, res) => {
  try {
    const educatorId = req.params.id;
    const { status } = req.body; //  "approved" or "rejected"

    // Update educator status in the database
    const updatedEducator = await User.findByIdAndUpdate(
      educatorId,
      { status: status }, 
      { new: true } 
    ).select("-password"); // Exclude password from the response

    if (!updatedEducator) {
      return res.status(404).json({ message: "Educator not found" }); // Handle case where educator is not found
    }

    // Send notification email
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

// Explicitly reject an educator 
exports.rejectEducator = async (req, res) => {
  try {
    const educatorId = req.params.id;

    const updatedEducator = await User.findByIdAndUpdate(
      educatorId,
      { status: "REJECTED" }, 
      { new: true } 
    ).select("-password"); // Exclude password from the response

    if (!updatedEducator) {
      return res.status(404).json({ message: "Educator not found" });
    }

    try {
      // Send rejection email
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

// Get all educators with optional search and filtering
exports.getAllEducators = async (req, res) => {
  try {
    const { search, specialization, page = 1, limit = 20 } = req.query;
    
    const query = { role: "educator" };
    const andConditions = [];
    
    // Add text search if provided (matches name, email, or specializations)
    if (search) {
      andConditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { "profile.fullName": { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { specializationTag: { $regex: search, $options: "i" } },
          { "profile.specialization": { $regex: search, $options: "i" } }
        ]
      });
    }
    
    // Add exact specialization filter if provided
    if (specialization) {
      andConditions.push({
        $or: [
          { specializationTag: specialization },
          { "profile.specialization": specialization }
        ]
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const educators = await User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    
    const hasMore = educators.length === parseInt(limit);

    res.status(200).json({ success: true, educators, hasMore });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch educators." });
  }
};
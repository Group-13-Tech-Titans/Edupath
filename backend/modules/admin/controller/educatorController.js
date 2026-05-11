const User = require("../../auth/models/User"); 
const sendEmail = require("../../../utils/sendEmail"); 
const { educatorVerificationResultEmail } = require("../../../utils/emailTemplates");

// Get all educators who are waiting for admin approval
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
    const { status } = req.body; // Expects "approved" or "rejected"

    // Update educator status in the database
    const updatedEducator = await User.findByIdAndUpdate(
      educatorId,
      { status: status }, 
      { new: true } 
    ).select("-password");

    if (!updatedEducator) {
      return res.status(404).json({ message: "Educator not found" });
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

// Explicitly reject an educator (Alternative dedicated route)
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
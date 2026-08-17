const User = require("../../auth/models/User"); 
const sendEmail = require("../../../utils/sendEmail"); 
const { reviewerAccountCreatedEmail } = require("../../../utils/emailTemplates");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const BCRYPT_SALT_ROUNDS = 10; //salt rounds for password hashing

// Fetch all reviewers from the database
exports.getAllReviewers = async (req, res) => {
  try {
    const reviewers = await User.find({ role: "reviewer" }).select("-password");
    res.json(reviewers);  // Return reviewers without passwords 
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviewers" });
  }
};

// Create a new reviewer and send auto-generated password via email
exports.createReviewer = async (req, res) => {
  try {
    const { name, email, specializationTags } = req.body;
    
    const existing = await User.findOne({ email }); // Check if email is already registered
    if (existing) return res.status(400).json({ message: "Email already in use" });

    // Generate random password
    const generatedPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(generatedPassword, BCRYPT_SALT_ROUNDS);

    // Save new reviewer
    const newUser = await User.create({
      name, 
      email, 
      password: hashedPassword, 
      role: "reviewer",
      specializationTags: specializationTags || [], 
      authProvider: "local", 
      isVerified: true, 
    });


    // Send email for reviewer account creation with temporary password
    try {
      const emailContent = reviewerAccountCreatedEmail({
        name: newUser.name,
        email: newUser.email,
        plainPassword: generatedPassword 
      });

      await sendEmail({
        to: newUser.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html
      });
      console.log(`✅ Account credentials emailed to Reviewer: ${newUser.email}`); // Log success message for email sending
    } catch (emailError) {
      console.error("⚠️ Failed to send credentials email:", emailError.message); // Log error if email sending fails
    }

    res.status(201).json({ 
      message: "Reviewer created and credentials sent via email", 
      id: newUser._id,
      temporaryPassword: generatedPassword 
    });
  } catch (err) {
    res.status(500).json({ message: "Creation failed", error: err.message });
  }
};


// Update reviewer details (Name, Tags, or Password)
exports.updateReviewer = async (req, res) => {
  try {
    const { name, email, password, specializationTags } = req.body;
    const updateData = { name, email, specializationTags: specializationTags || [] };
    
    // Only hash and update password 
    if (password) updateData.password = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, role: "reviewer" }, { $set: updateData }, { returnDocument: 'after' }
    ).select("-password"); // Exclude password from the response
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};


// Delete a reviewer from the system
exports.deleteReviewer = async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.params.id, role: "reviewer" });
    res.json({ message: "Reviewer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
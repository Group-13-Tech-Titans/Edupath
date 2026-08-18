const User = require("../../auth/models/User"); 
const sendEmail = require("../../../utils/sendEmail"); 
const { adminAccountCreatedEmail } = require("../../../utils/emailTemplates");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const BCRYPT_SALT_ROUNDS = 10;

// Simple welcome message for admin route testing
exports.adminWelcome = (req, res) => res.json({ message: "Welcome Admin" });

// Get all admin users
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admins." });
  }
};

// Create a new Admin user and send auto-generated password via email
exports.createAdminUser = async (req, res) => {
  try {
    const { name, email, role, specializationTag } = req.body;
    
    // Check if email already exists in the database
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    // Generate a secure random password and hash it using bcrypt
    const generatedPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(
      generatedPassword,
      BCRYPT_SALT_ROUNDS,
    );

    // Save new admin to the database
    const newUser = await User.create({
      name: name || email.split("@")[0], // Default to email prefix if name not provided
      email,
      password: hashedPassword, 
      role: "admin", 
      specializationTag: role === "reviewer" ? specializationTag : null,
      authProvider: "local",
      isVerified: true, 
    });

    // Send the generated plain text password to the new admin's email
    try {
      const emailContent = adminAccountCreatedEmail({
        name: newUser.name,
        email: newUser.email,
        plainPassword: generatedPassword 
      });


      // Send the email asynchronously (don't await) so it doesn't block the UI
      sendEmail({
        to: newUser.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html
      })
      .then(() => console.log(`✅ Account credentials emailed to Admin: ${newUser.email}`))
      .catch((emailError) => console.error("⚠️ Failed to send credentials email:", emailError.message));
      
    } catch (emailError) {
      console.error("⚠️ Error generating email content:", emailError.message);
    }

    // Remove password from response for security
    const safe = newUser.toObject();
    delete safe.password;
    safe.id = safe._id.toString();
    
    return res.status(201).json({ 
      message: "Admin created and credentials sent via email", 
      user: safe
    });
  } catch (err) {
    res.status(500).json({ message: "User creation failed", error: err.message });
  }
};

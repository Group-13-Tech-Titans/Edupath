const sendEmail = require("../../../utils/sendEmail");
const User = require("../../auth/models/User");

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, role, topic, message } = req.body;

    if (!name || !email || !topic || !message) {
      return res.status(400).json({ success: false, error: "Please provide all required fields." });
    }

    // Find all admin emails
    const admins = await User.find({ role: "admin" }).select("email");
    const adminEmails = admins.map(a => a.email).filter(Boolean);
    
    // Fallback to EMAIL_USER if no admins exist in the DB
    const toEmails = adminEmails.length > 0 ? adminEmails.join(", ") : process.env.EMAIL_USER;

    // 1. Email to Admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px;">
        <h2 style="color: #2b9d62;">New Contact Form Submission</h2>
        <p>You have received a new inquiry from the EduPath landing page.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Role:</strong> ${role || "Not specified"}</p>
          <p><strong>Topic:</strong> ${topic}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background-color: white; padding: 10px; border: 1px solid #e0e0e0; border-radius: 5px;">${message}</p>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #777;">This email was generated automatically by EduPath.</p>
      </div>
    `;

    // 2. Acknowledgement Email to User
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px;">
        <h2 style="color: #2b9d62;">Thank you for contacting EduPath!</h2>
        <p>Hi ${name},</p>
        <p>We have successfully received your message regarding <strong>${topic}</strong>.</p>
        <p>Our support team will review your inquiry and get back to you as soon as possible.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p><strong>Your Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <br />
        <p>Best regards,<br/><strong>The EduPath Team</strong></p>
      </div>
    `;

    // Send emails concurrently
    await Promise.all([
      sendEmail({
        to: toEmails,
        subject: `New Inquiry: ${topic} from ${name}`,
        html: adminEmailHtml,
      }),
      sendEmail({
        to: email,
        subject: `We received your message! - EduPath`,
        html: userEmailHtml,
      })
    ]);

    res.status(200).json({ success: true, message: "Contact form submitted successfully." });

  } catch (error) {
    console.error("Contact Form Error:", error);
    res.status(500).json({ success: false, error: "Failed to process your request. Please try again later." });
  }
};

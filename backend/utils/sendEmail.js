/**
 * EMAIL UTILITY SERVICE
 * Handles sending transactional emails (like password resets).
 */

const nodemailer = require("nodemailer");

// This transporter function acts as a Singleton. The connection pool is created once when the server starts and is reused, making email sending significantly faster.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Send the email using the pre-established transporter
    const info = await transporter.sendMail({
      from: `"EduPath Security" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return info;

  } catch (error) {
    console.error(`FAILED to send email to ${to}. Error:`, error.message);
    throw new Error("Email service is currently unavailable.");
  }
};

module.exports = sendEmail;
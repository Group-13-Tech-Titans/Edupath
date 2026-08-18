/**
 * EMAIL UTILITY SERVICE
 * Handles sending transactional emails (like password resets).
 */

const nodemailer = require("nodemailer");// use to send emails

// This transporter function acts as a Singleton. The connection pool is created once when the server starts and is reused, making email sending significantly faster.
// Transporter uses SMTP (Simple Mail Transfer Protocol) to connect to an email service provider like Gmail
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: true,
  // Force Node.js to use IPv4 for this specific connection
  family: 4, 
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
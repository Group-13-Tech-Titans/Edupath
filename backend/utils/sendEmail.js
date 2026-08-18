

const nodemailer = require("nodemailer");


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
      from: `"EduPath Security" <${process.env.EMAIL_USER}>`, // Added a professional sender name
      to,
      subject,
      text,
      html,
    });

    // Helpful for debugging in development
    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return info;

  } catch (error) {
    // Catch email-specific errors and log them before throwing
    console.error(`FAILED to send email to ${to}. Error:`, error.message);
    throw new Error("Email service is currently unavailable.");
  }
};

module.exports = sendEmail;
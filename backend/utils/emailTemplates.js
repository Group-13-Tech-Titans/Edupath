/**
 * EduPath Email Templates
 * All templates return { subject, html, text }
 * Use inline CSS — better email client compatibility.
 */

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const wrapper = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1ebea5,#17a98f);padding:28px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">EduPath</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:12px;">Learning Platform</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fffe;border-top:1px solid #e8f7f4;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#9db5b2;font-size:11px;">© 2026 EduPath. All rights reserved.</p>
            <p style="margin:4px 0 0;color:#9db5b2;font-size:11px;">If you did not expect this email, please ignore it.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btn = (url, label) =>
  `<a href="${url}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#1ebea5;color:#ffffff;text-decoration:none;border-radius:50px;font-size:14px;font-weight:600;">${label}</a>`;

const heading = (text) =>
  `<h2 style="margin:0 0 16px;color:#1a2e2b;font-size:20px;font-weight:700;">${text}</h2>`;

const para = (text) =>
  `<p style="margin:0 0 12px;color:#4a6460;font-size:14px;line-height:1.6;">${text}</p>`;

const infoBox = (rows) => {
  const cells = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:8px 12px;font-size:12px;font-weight:600;color:#7a9e99;width:40%;border-bottom:1px solid #f0f7f5;">${label}</td>
        <td style="padding:8px 12px;font-size:13px;color:#1a2e2b;border-bottom:1px solid #f0f7f5;">${value}</td>
      </tr>`
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fffe;border:1px solid #e0f2ee;border-radius:10px;margin:16px 0;overflow:hidden;">${cells}</table>`;
};

// ─────────────────────────────────────────────
// 1. Welcome — new account created
// ─────────────────────────────────────────────
exports.welcomeEmail = ({ name, email, role }) => {
  const roleLabel = role === "educator" ? "Educator" : role === "reviewer" ? "Reviewer" : "Student";
  return {
    subject: "Welcome to EduPath! Your account is ready.",
    html: wrapper(`
      ${heading(`Welcome to EduPath, ${name || email}!`)}
      ${para("Your account has been created successfully. Here are your account details:")}
      ${infoBox([
        ["Email", email],
        ["Account Type", roleLabel],
        ["Status", "Active"],
      ])}
      ${para("You can now log in and start exploring courses, or if you're an educator, publish your first course.")}
      ${btn(`${BASE_URL}/login`, "Go to Login")}
    `),
    text: `Welcome to EduPath, ${name || email}! Your account (${email}) has been created. Login at ${BASE_URL}/login`
  };
};

// ─────────────────────────────────────────────
// 2. Password changed
// ─────────────────────────────────────────────
exports.passwordChangedEmail = ({ name, email }) => ({
  subject: "Your EduPath password was changed",
  html: wrapper(`
    ${heading("Password Changed")}
    ${para(`Hi ${name || email},`)}
    ${para("Your EduPath account password was successfully changed.")}
    ${infoBox([
      ["Account", email],
      ["Time", new Date().toLocaleString()],
    ])}
    ${para("<strong>If you made this change</strong>, you can safely ignore this email.")}
    ${para("<strong>If you did NOT make this change</strong>, your account may be compromised. Please use the forgot password link to secure your account immediately.")}
    ${btn(`${BASE_URL}/forgot-password`, "Secure My Account")}
  `),
  text: `Hi ${name || email}, your EduPath password was changed. If this wasn't you, visit ${BASE_URL}/forgot-password`
});

// ─────────────────────────────────────────────
// 3. Course submitted for review
// ─────────────────────────────────────────────
exports.loginOtpEmail = ({ name, email, otp }) => ({
  subject: "Your EduPath login verification code",
  html: wrapper(`
    ${heading("Login Verification Code")}
    ${para(`Hi ${name || email},`)}
    ${para("Use this code to finish signing in to your EduPath account:")}
    <div style="margin:20px 0;padding:18px;background:#f0faf8;border:1px solid #b8ead8;border-radius:12px;text-align:center;">
      <p style="margin:0;color:#1a2e2b;font-size:30px;font-weight:700;letter-spacing:6px;">${otp}</p>
    </div>
    ${para("This code expires in 10 minutes.")}
    ${para("If you did not try to sign in, you can ignore this email.")}
  `),
  text: `Hi ${name || email}, your EduPath login verification code is ${otp}. It expires in 10 minutes.`
});

exports.courseSubmittedEmail = ({ educatorName, educatorEmail, courseTitle, category, level }) => ({
  subject: `Your course "${courseTitle}" has been submitted for review`,
  html: wrapper(`
    ${heading("Course Submitted for Review")}
    ${para(`Hi ${educatorName || educatorEmail},`)}
    ${para("Great news — your course has been successfully submitted and is now in the review queue. Our reviewers will assess it shortly.")}
    ${infoBox([
      ["Course Title", courseTitle],
      ["Category", category || "—"],
      ["Level", level || "—"],
      ["Status", "Pending Review"],
    ])}
    ${para("You will receive another email once the review is complete with the outcome and any feedback from the reviewer.")}
    ${para("In the meantime, you can check the status of your course from your educator dashboard.")}
    ${btn(`${BASE_URL}/educator/courses`, "View My Courses")}
  `),
  text: `Hi ${educatorName}, your course "${courseTitle}" has been submitted for review. You'll be notified once reviewed.`
});

// ─────────────────────────────────────────────
// 4. Course review decision (approved or rejected)
// ─────────────────────────────────────────────
exports.courseReviewedEmail = ({ educatorName, educatorEmail, courseTitle, decision, rating, notes, reviewerName }) => {
  const approved = decision === "approved";
  const decisionLabel = approved ? "Approved ✓" : "Rejected";
  const decisionColor = approved ? "#1ebea5" : "#e05c5c";
  const decisionBg = approved ? "#f0faf8" : "#fff5f5";
  const decisionBorder = approved ? "#b8ead8" : "#f5c6c6";

  return {
    subject: `Your course "${courseTitle}" has been ${approved ? "approved" : "rejected"}`,
    html: wrapper(`
      ${heading("Course Review Complete")}
      ${para(`Hi ${educatorName || educatorEmail},`)}
      ${para(`Your course has been reviewed. Here is the outcome:`)}
      ${infoBox([
        ["Course Title", courseTitle],
        ["Decision", `<span style="color:${decisionColor};font-weight:700;">${decisionLabel}</span>`],
        ["Reviewer Rating", rating ? `${"★".repeat(rating)}${"☆".repeat(5 - rating)} (${rating}/5)` : "—"],
        ["Reviewed By", reviewerName || "EduPath Reviewer"],
        ["Date", new Date().toLocaleString()],
      ])}
      ${notes ? `
        <div style="background:${decisionBg};border:1px solid ${decisionBorder};border-radius:10px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:${decisionColor};">Reviewer Notes</p>
          <p style="margin:0;font-size:13px;color:#3a5450;line-height:1.6;">${notes}</p>
        </div>` : ""}
      ${approved
        ? para("Your course is now live and visible to students. Congratulations!")
        : para("Please review the feedback above, make the necessary improvements, and resubmit your course from the educator dashboard.")
      }
      ${btn(
        approved ? `${BASE_URL}/educator/courses` : `${BASE_URL}/educator/courses`,
        approved ? "View Published Course" : "Edit & Resubmit"
      )}
    `),
    text: `Hi ${educatorName}, your course "${courseTitle}" has been ${decision}. ${notes ? `Reviewer notes: ${notes}` : ""}`
  };
};


// ─────────────────────────────────────────────
// 5. Educator Verification Result (Sent to Educator)
// ─────────────────────────────────────────────
exports.educatorVerificationResultEmail = ({ educatorName, status }) => {
  const isApproved = status.toLowerCase() === "approved" || status.toLowerCase() === "verified";
  const decisionLabel = isApproved ? "Approved ✓" : "Rejected";
  const decisionColor = isApproved ? "#1ebea5" : "#e05c5c";

  return {
    subject: `Update on your EduPath Educator Application: ${decisionLabel}`,
    html: wrapper(`
      ${heading("Educator Application Update")}
      ${para(`Hi ${educatorName || "Educator"},`)}
      ${para(`We have reviewed your application to become an educator on EduPath. Your account has been <span style="color:${decisionColor};font-weight:700;text-transform:uppercase;">${status}</span>.`)}
      
      ${isApproved
        ? para("Congratulations! You can now log in to your Educator Dashboard, set up your profile, and start publishing courses for students worldwide.")
        : para("Unfortunately, we cannot approve your educator application at this time. Please ensure your profile details are complete. If you have questions, please contact our support team.")
      }
      
      ${btn(`${BASE_URL}/login`, "Go to EduPath")}
    `),
    text: `Hi ${educatorName || "Educator"}, your educator application has been ${status}. Please log in to your account for more details.`
  };
};

// ─────────────────────────────────────────────
// 6. Reviewer Account Created (Sent to new Reviewer)
// ─────────────────────────────────────────────
exports.reviewerAccountCreatedEmail = ({ name, email, plainPassword }) => {
  return {
    subject: "Welcome to EduPath! Your Reviewer Account Details",
    html: wrapper(`
      ${heading("Your Reviewer Account is Ready")}
      ${para(`Hi ${name},`)}
      ${para("An administrator has created a reviewer account for you on EduPath. You can use the credentials below to log in to your account:")}
      ${infoBox([
        ["Email", email],
        ["Temporary Password", `<span style="font-family: monospace; font-size: 16px; background: #e0f2ee; padding: 2px 6px; border-radius: 4px;">${plainPassword}</span>`],
        ["Role", "Reviewer"]
      ])}
      ${para("<strong>Important:</strong> For security reasons, we strongly recommend changing this temporary password immediately after your first login.")}
      ${btn(`${BASE_URL}/login`, "Log In to EduPath")}
    `),
    text: `Hi ${name}, your EduPath reviewer account is ready. Email: ${email}, Password: ${plainPassword}. Please login and change your password immediately.`
  };
};
function base(subject, text, html) {
  return { subject, text, html };
}

function welcomeEmail({ name, email, role }) {
  return base(
    "Welcome to EduPath",
    `Welcome ${name}! Your account (${email}) was created with role: ${role}.`,
    `<p>Welcome <b>${name}</b>!</p><p>Your account (${email}) was created with role: <b>${role}</b>.</p>`
  );
}

function passwordChangedEmail({ name, email }) {
  return base(
    "EduPath password changed",
    `Hi ${name}, your password for ${email} was changed.`,
    `<p>Hi <b>${name}</b>,</p><p>Your password for <b>${email}</b> was changed.</p>`
  );
}

function courseSubmittedEmail({ educatorName, educatorEmail, courseTitle, category, level }) {
  return base(
    "Course submitted for review",
    `${educatorName} (${educatorEmail}) submitted "${courseTitle}" (${category}, ${level}).`,
    `<p><b>${educatorName}</b> (${educatorEmail}) submitted <b>"${courseTitle}"</b> for review.</p>`
  );
}

function courseReviewedEmail({ educatorName, educatorEmail, courseTitle, decision, rating, notes, reviewerName }) {
  return base(
    "Course review result",
    `Hi ${educatorName} (${educatorEmail}), your course "${courseTitle}" was ${decision}. Rating: ${rating ?? "-"} Notes: ${notes || "-"}. Reviewer: ${reviewerName}.`,
    `<p>Hi <b>${educatorName}</b>,</p><p>Your course <b>"${courseTitle}"</b> was <b>${decision}</b>.</p>`
  );
}

module.exports = {
  welcomeEmail,
  passwordChangedEmail,
  courseSubmittedEmail,
  courseReviewedEmail
};


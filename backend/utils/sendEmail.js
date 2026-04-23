const nodemailer = require("nodemailer");

function buildTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || 587);

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

module.exports = async function sendEmail({ to, subject, text, html }) {
  const transport = buildTransport();
  if (!transport) {
    // In dev, silently skip if SMTP not configured.
    return { skipped: true };
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  return transport.sendMail({ from, to, subject, text, html });
};


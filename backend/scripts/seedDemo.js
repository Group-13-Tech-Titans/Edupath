/* eslint-disable no-console */
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../auth/models/user");

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

async function upsertUser({ name, email, password, role, status, specializationTag, specializationTags, profile }) {
  const existing = await User.findOne({ email });
  const hashedPassword = await bcrypt.hash(password, 10);

  const payload = {
    name,
    email,
    password: hashedPassword,
    role,
    ...(status != null ? { status } : {}),
    ...(specializationTag != null ? { specializationTag } : {}),
    ...(Array.isArray(specializationTags) ? { specializationTags } : {}),
    ...(profile != null ? { profile } : {})
  };

  if (existing) {
    await User.updateOne({ _id: existing._id }, { $set: payload });
    return { created: false, email };
  }

  await User.create(payload);
  return { created: true, email };
}

async function main() {
  requireEnv("MONGO_URI");
  requireEnv("JWT_SECRET");

  await mongoose.connect(process.env.MONGO_URI);

  const demoUsers = [
    {
      name: "Demo Student",
      email: "student@demo.edupath",
      password: "Student@123",
      role: "student",
      status: "ACTIVE"
    },
    {
      name: "Demo Educator",
      email: "educator@demo.edupath",
      password: "Educator@123",
      role: "educator",
      status: "VERIFIED",
      specializationTag: "web-dev",
      specializationTags: ["web-dev"],
      profile: {
        fullName: "Demo Educator",
        contact: "0000000000",
        specialization: { name: "Web Development", slug: "web-dev" },
        credentialsLink: "https://example.com"
      }
    },
    {
      name: "Demo Reviewer",
      email: "reviewer@demo.edupath",
      password: "Reviewer@123",
      role: "reviewer",
      status: "ACTIVE",
      specializationTags: ["web-dev", "data-science"]
    },
    {
      name: "Demo Admin",
      email: "admin@demo.edupath",
      password: "Admin@123",
      role: "admin",
      status: "ACTIVE"
    }
  ];

  const results = [];
  for (const u of demoUsers) {
    // eslint-disable-next-line no-await-in-loop
    const r = await upsertUser(u);
    results.push(r);
  }

  console.log("\nDemo accounts ready:\n");
  console.log("Student  -> student@demo.edupath  /  Student@123");
  console.log("Educator -> educator@demo.edupath /  Educator@123");
  console.log("Reviewer -> reviewer@demo.edupath /  Reviewer@123");
  console.log("Admin    -> admin@demo.edupath    /  Admin@123\n");

  const createdCount = results.filter((r) => r.created).length;
  console.log(`Upserted ${results.length} users (${createdCount} created, ${results.length - createdCount} updated).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
  });


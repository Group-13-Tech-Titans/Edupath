require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./auth/routes/authRoutes");
const reviewerRoutes = require("./auth/routes/reviewersRoutes");

const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reviewers", reviewerRoutes);

app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
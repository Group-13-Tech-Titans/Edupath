require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);


const authRoutes = require("./auth/routes/authRoutes");  
const reviewerRoutes = require("./auth/routes/reviewersRoutes");
const courseRoutes = require("./courses/routes/courseRoutes");
const specializationRoutes = require("./specializations/routes/specializationRoutes");



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
app.use("/api/courses", courseRoutes);
app.use("/api/upload", specializationRoutes);

app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
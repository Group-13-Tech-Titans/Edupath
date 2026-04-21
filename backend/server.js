require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./modules/auth/routes/authRoutes"));

// Quizes
app.use("/api/quiz", require("./modules/quiz/routes/quizRoutes"));

// Pathway
app.use("/api/pathway", require("./modules/pathway/routes/pathwayRoutes"));

// Quiz for each step
app.use("/api/step-quiz", require("./modules/quiz/routes/stepQuizRoutes"));

// Admin routes
app.use("/api/admin", require("./modules/admin/routes/adminRoutes"));

// Mentor routes
app.use("/api/mentor", require("./modules/mentor/routes/mentorRoutes"));

app.get("/test", (req, res) => {
  res.send("Working");
});

const http = require("http");
const { initSocket } = require("./utils/socketManager");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
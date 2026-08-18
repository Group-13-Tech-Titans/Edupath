require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const dns = require("dns");

// Use Google Public DNS
dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);

const app = express();

connectDB();

app.use(cors({ 
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:5173'];
    // Allow any origin that matches the Vercel preview domain pattern
    if (!origin || allowedOrigins.includes(origin) || /^https:\/\/edupath-.*\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Increase the limit to 50mb to allow large Base64 images to pass through
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use("/api/auth", require("./modules/auth/routes/authRoutes"));
app.use("/api/admin", require("./modules/admin/routes/adminRoutes")); //admin related routes
app.use("/api/chatbot", require("./modules/chatbot/routes/chatbotRoutes"));
app.use("/api/contact", require("./modules/contact/routes/contactRoutes"));

// Pathway
app.use("/api/pathway", require("./modules/pathway/routes/pathwayRoutes"));

// Quiz for each step
app.use("/api/step-quiz", require("./modules/quiz/routes/stepQuizRoutes"));

app.use("/api/courses", require("./modules/courses/routes/courseRoutes"));

app.use("/api/upload", require("./modules/upload/routes/uploadRoutes"));

app.use("/api/specializations", require("./modules/specializations/routes/specializationRoutes"));

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
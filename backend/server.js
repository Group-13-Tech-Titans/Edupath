require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const dns = require("dns");

// Force IPv4 first to prevent ENETUNREACH IPv6 errors on Render/cloud hosts
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// Use Google Public DNS
dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

const app = express();

connectDB();

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://www.openrento.com', 'https://openrento.com'];
        // Allow any origin that matches the Vercel preview domain pattern or no origin (like Postman)
        if (!origin || allowedOrigins.includes(origin) || /^https:\/\/edupath-.*\.vercel\.app$/.test(origin)) {
            callback(null, true);
        } else {
            // Log the blocked origin for debugging
            console.warn(`Blocked by CORS: ${origin}`);
            callback(null, true); // Temporarily allow all origins to prevent strict blocking during development
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
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
app.use("/api/educator", require("./modules/courses/routes/educatorRoutes"));

app.use("/api/upload", require("./modules/upload/routes/uploadRoutes"));

app.use("/api/specializations", require("./modules/specializations/routes/specializationRoutes"));

// Mentor routes
app.use("/api/mentor", require("./modules/mentor/routes/mentorRoutes"));

// Subscription routes (premium plans, PayHere, usage limits)
app.use("/api/subscription", require("./modules/subscription/routes/subscriptionRoutes"));

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
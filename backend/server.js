require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const cors = require("cors"); //import cors package to handle Cross-Origin Resource Sharing 
const connectDB = require("./config/db"); // Import the connectDB function

// Import the http module and the Server class from socket.io
const http = require("http");
const  {Server}= require("socket.io");

//use to fix ISP dns issue... 
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); // Set custom DNS servers (Google DNS and Cloudflare DNS)

const app = express();
connectDB(); // Connect to the database

app.use(cors());
app.use(express.json());


app.use("/api/auth", require("./modules/auth/routes/authRoutes"));
app.use("/api/admin", require("./modules/admin/routes/adminRoutes")); //admin related routes
app.use("/api/pathway", require("./modules/pathway/routes/pathwayRoutes"));
app.use("/api/step-quiz", require("./modules/quiz/routes/stepQuizRoutes"));
app.use("/api/courses", require("./modules/courses/routes/courseRoutes"));
app.use("/api/upload", require("./modules/upload/routes/uploadRoutes"));
app.use("/api/specializations", require("./modules/specializations/routes/specializationRoutes")); //specialization related routes

// Create an HTTP server and wrap the Express app
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173" || process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("connected to chat! Socket ID:", socket.id);

socket.on("send_message", (data) => {
    console.log("📩 new message type:", data);
    
    io.emit("receive_message", data); 
  });


  socket.on("disconnect", () => {
    console.log("disconnect:", socket.id);
  });
});

// Test route to verify server is working
app.get("/test", (req, res) => {
  res.send("Working");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



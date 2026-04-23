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

// Pathway
app.use("/api/pathway", require("./modules/pathway/routes/pathwayRoutes"));

// Quiz for each step
app.use("/api/step-quiz", require("./modules/quiz/routes/stepQuizRoutes"));

app.use("/api/courses", require("./modules/courses/routes/courseRoutes"));

app.use("/api/upload", require("./modules/upload/routes/uploadRoutes"));

app.use("/api/specializations", require("./modules/specializations/routes/specializationRoutes"));

app.get("/test", (req, res) => {
  res.send("Working");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
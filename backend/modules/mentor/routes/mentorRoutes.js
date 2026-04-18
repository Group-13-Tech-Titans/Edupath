const express = require("express");
const router = express.Router();

// Middleware — these check if the user is logged in, and if they're a mentor
const authMiddleware = require("../../../middleware/authMiddleware");
const roleMiddleware = require("../../../middleware/roleMiddleware");

// Import our controller functions
const {
  getProfile,
  createProfile,
  updateProfile,
  getPublicProfile,
} = require("../controllers/mentorProfileController");

const {
  getRequests,
  getUpcoming,
  getPast,
  requestSession,
  acceptSession,
  declineSession,
  completeSession,
  getStats,
} = require("../controllers/sessionController");

const {
  getStudents,
  getStudentStats,
  getStudentById,
  addStudent,
  updateStudent,
  removeStudent,
} = require("../controllers/Studentcontroller");

const {
  shareResource,
  getAllResources,
  getResourcesByStudent,
  getMyResources,
  deleteResource,
} = require("../controllers/resourceController");
 

// ─────────────────────────────────────────────────────────────
// WHAT IS A ROUTE?
//
// A route connects a URL + HTTP method to a controller function.
//
// HTTP methods:
//   GET    → "give me data"
//   POST   → "create something new"
//   PUT    → "update something"
//   DELETE → "remove something"
//
// Example: when the frontend does
//   fetch("/api/mentor/profile")
// it hits the GET route below, which runs the getProfile function.
// ─────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════
// PROFILE ROUTES
// ═══════════════════════════════════════════════
 
// Public — no login needed (students view mentor profile)
router.get("/profile/:mentorId", getPublicProfile);
 
// Private — must be logged in as a mentor
router.get("/profile",  authMiddleware, roleMiddleware(["mentor"]), getProfile);
router.post("/profile", authMiddleware, roleMiddleware(["mentor"]), createProfile);
router.put("/profile",  authMiddleware, roleMiddleware(["mentor"]), updateProfile);

// ═══════════════════════════════════════════════
// SESSION ROUTES
// ═══════════════════════════════════════════════
 
// Mentor reads their sessions
router.get("/sessions/stats",    authMiddleware, roleMiddleware(["mentor"]), getStats);
router.get("/sessions/requests", authMiddleware, roleMiddleware(["mentor"]), getRequests);
router.get("/sessions/upcoming", authMiddleware, roleMiddleware(["mentor"]), getUpcoming);
router.get("/sessions/past",     authMiddleware, roleMiddleware(["mentor"]), getPast);
 
// Mentor responds to sessions
router.put("/sessions/:id/accept",   authMiddleware, roleMiddleware(["mentor"]), acceptSession);
router.put("/sessions/:id/decline",  authMiddleware, roleMiddleware(["mentor"]), declineSession);
router.put("/sessions/:id/complete", authMiddleware, roleMiddleware(["mentor"]), completeSession);
 
// A student requests a session (any logged-in user can do this)
router.post("/sessions/request", authMiddleware, requestSession);
 
// ═══════════════════════════════════════════════
// STUDENT ROUTES
// ═══════════════════════════════════════════════
router.get("/students/stats",        authMiddleware, roleMiddleware(["mentor"]), getStudentStats);
router.get("/students",              authMiddleware, roleMiddleware(["mentor"]), getStudents);
router.get("/students/:studentId",   authMiddleware, roleMiddleware(["mentor"]), getStudentById);
router.post("/students",             authMiddleware, roleMiddleware(["mentor"]), addStudent);
router.put("/students/:studentId",   authMiddleware, roleMiddleware(["mentor"]), updateStudent);
router.delete("/students/:studentId",authMiddleware, roleMiddleware(["mentor"]), removeStudent);

// ═══════════════════════════════════════════════
// RESOURCE ROUTES
// ═══════════════════════════════════════════════
 
// Mentor routes
router.post("/resources", authMiddleware, roleMiddleware(["mentor"]), shareResource);
router.get("/resources", authMiddleware, roleMiddleware(["mentor"]), getAllResources);
router.get("/resources/student/:studentId", authMiddleware, roleMiddleware(["mentor"]), getResourcesByStudent);
router.delete("/resources/:id",authMiddleware, roleMiddleware(["mentor"]), deleteResource);
 
// Student route — student sees resources shared with them
router.get("/resources/mine", authMiddleware, getMyResources);

module.exports = router;
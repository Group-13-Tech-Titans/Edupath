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
  getReviews,
  getMentors,
} = require("../controllers/mentorProfileController");

const {
  getSessions,
  getStudentSessions,
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
  updateMentorNotes,
} = require("../controllers/Studentcontroller");

const {
  shareResource,
  getAllResources,
  getResourcesByStudent,
  getMyResources,
  deleteResource,
  updateResource,
  getResourceStats
} = require("../controllers/resourceController");

const { getDashboardData } = require("../controllers/dashboardController");

const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  getEligibleMentors,
} = require("../controllers/messageController");

const { getMentorAnalytics } = require("../controllers/analyticsController");

// ═══════════════════════════════════════════════
// DASHBOARD ROUTE
// ═══════════════════════════════════════════════
router.get("/dashboard", authMiddleware, roleMiddleware(["mentor"]), getDashboardData);
router.get("/analytics", authMiddleware, roleMiddleware(["mentor"]), getMentorAnalytics);

// ═══════════════════════════════════════════════
// PROFILE ROUTES
// ═══════════════════════════════════════════════
router.get("/profile/:mentorId", getPublicProfile);
router.get("/profile",  authMiddleware, roleMiddleware(["mentor"]), getProfile);
router.post("/profile", authMiddleware, roleMiddleware(["mentor", "educator"]), createProfile);
router.put("/profile",  authMiddleware, roleMiddleware(["mentor", "educator"]), updateProfile);
router.get("/profile/reviews", authMiddleware, roleMiddleware(["mentor"]), getReviews);
router.get("/profiles", getMentors);

// ═══════════════════════════════════════════════
// SESSION ROUTES
// ═══════════════════════════════════════════════
router.get("/sessions",       authMiddleware, roleMiddleware(["mentor"]), getSessions);
router.get("/sessions/student", authMiddleware, getStudentSessions);
router.get("/sessions/stats", authMiddleware, roleMiddleware(["mentor"]), getStats);

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
router.patch("/students/:studentId/notes", authMiddleware, roleMiddleware(["mentor"]), updateMentorNotes);
router.post("/students",             authMiddleware, roleMiddleware(["mentor"]), addStudent);
router.put("/students/:studentId",   authMiddleware, roleMiddleware(["mentor"]), updateStudent);
router.delete("/students/:studentId",authMiddleware, roleMiddleware(["mentor"]), removeStudent);

// ═══════════════════════════════════════════════
// RESOURCE ROUTES
// ═══════════════════════════════════════════════
router.get("/resources/stats", authMiddleware, roleMiddleware(["mentor"]), getResourceStats);
router.get("/resources", authMiddleware, roleMiddleware(["mentor"]), getAllResources);
router.post("/resources", authMiddleware, roleMiddleware(["mentor"]), shareResource);
router.put("/resources/:id", authMiddleware, roleMiddleware(["mentor"]), updateResource);
router.delete("/resources/:id", authMiddleware, roleMiddleware(["mentor"]), deleteResource);
router.get("/resources/student/:studentId", authMiddleware, roleMiddleware(["mentor"]), getResourcesByStudent);

router.get("/resources/mine", authMiddleware, getMyResources);

// ═══════════════════════════════════════════════
// MESSAGING ROUTES
// ═══════════════════════════════════════════════

// All conversations for the logged-in user
router.get("/messages/conversations", authMiddleware, getConversations);

// Total unread count badge
router.get("/messages/unread-count",  authMiddleware, getUnreadCount);

// Specific conversation messages
router.get("/messages/conversations/:targetId", authMiddleware, getMessages);

// Send a message
router.post("/messages/send", authMiddleware, sendMessage);

// Mark conversation as read
router.put("/messages/conversations/:targetId/read", authMiddleware, markAsRead);

// Get mentors eligible for messaging (student only)
router.get("/messages/eligible-mentors", authMiddleware, getEligibleMentors);

module.exports = router;
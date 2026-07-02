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
} = require("../controllers/ResourceController");

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

//_________________________________________________________________________________________________________________
// DASHBOARD ROUTE
// _________________________________________________________________________________________________________________

router.get("/dashboard", authMiddleware, roleMiddleware(["mentor", "educator"]), getDashboardData);
router.get("/analytics", authMiddleware, roleMiddleware(["mentor", "educator"]), getMentorAnalytics);

// _________________________________________________________________________________________________________________
// PROFILE ROUTES
// _________________________________________________________________________________________________________________

router.get("/profile/:mentorId", getPublicProfile);
router.get("/profile",  authMiddleware, roleMiddleware(["mentor", "educator"]), getProfile);
router.post("/profile", authMiddleware, roleMiddleware(["mentor", "educator"]), createProfile);
router.put("/profile",  authMiddleware, roleMiddleware(["mentor", "educator"]), updateProfile);
router.get("/profile/reviews", authMiddleware, roleMiddleware(["mentor", "educator"]), getReviews);
router.get("/profiles", getMentors);

// _________________________________________________________________________________________________________________
// SESSION ROUTES
// _________________________________________________________________________________________________________________
router.get("/sessions",       authMiddleware, roleMiddleware(["mentor", "educator"]), getSessions);
router.get("/sessions/student", authMiddleware, getStudentSessions);
router.get("/sessions/stats", authMiddleware, roleMiddleware(["mentor", "educator"]), getStats);

// Mentor responds to sessions
router.put("/sessions/:id/accept",   authMiddleware, roleMiddleware(["mentor", "educator"]), acceptSession);
router.put("/sessions/:id/decline",  authMiddleware, roleMiddleware(["mentor", "educator"]), declineSession);
router.put("/sessions/:id/complete", authMiddleware, roleMiddleware(["mentor", "educator"]), completeSession);

// A student requests a session (any logged-in user can do this)
router.post("/sessions/request", authMiddleware, requestSession);

// _________________________________________________________________________________________________________________
// STUDENT ROUTES
// _________________________________________________________________________________________________________________

router.get("/students/stats",        authMiddleware, roleMiddleware(["mentor", "educator"]), getStudentStats);
router.get("/students",              authMiddleware, roleMiddleware(["mentor", "educator"]), getStudents);
router.get("/students/:studentId",   authMiddleware, roleMiddleware(["mentor", "educator"]), getStudentById);
router.patch("/students/:studentId/notes", authMiddleware, roleMiddleware(["mentor", "educator"]), updateMentorNotes);
router.post("/students",             authMiddleware, roleMiddleware(["mentor", "educator"]), addStudent);
router.put("/students/:studentId",   authMiddleware, roleMiddleware(["mentor", "educator"]), updateStudent);
router.delete("/students/:studentId",authMiddleware, roleMiddleware(["mentor", "educator"]), removeStudent);

// _________________________________________________________________________________________________________________
// RESOURCE ROUTES
// _________________________________________________________________________________________________________________

router.get("/resources/stats", authMiddleware, roleMiddleware(["mentor", "educator"]), getResourceStats);
router.get("/resources", authMiddleware, roleMiddleware(["mentor", "educator"]), getAllResources);
router.post("/resources", authMiddleware, roleMiddleware(["mentor", "educator"]), shareResource);
router.put("/resources/:id", authMiddleware, roleMiddleware(["mentor", "educator"]), updateResource);
router.delete("/resources/:id", authMiddleware, roleMiddleware(["mentor", "educator"]), deleteResource);
router.get("/resources/student/:studentId", authMiddleware, roleMiddleware(["mentor", "educator"]), getResourcesByStudent);

router.get("/resources/mine", authMiddleware, getMyResources);

// _________________________________________________________________________________________________________________
// MESSAGING ROUTES
// _________________________________________________________________________________________________________________

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
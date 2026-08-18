const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../middleware/authMiddleware"); // Authentication middleware 
const roleMiddleware = require("../../../middleware/roleMiddleware"); // Role-based access control middleware

const adminUserController = require("../controller/adminUserController"); // create admin user controller
const reviewerController = require("../controller/reviewerController"); // manage reviewers controller
const educatorController = require("../controller/educatorController"); // manage educators verification controller
const courseController = require("../controller/courseController"); // manage courses (pending, review, stats) controller
const analyticsController = require("../controller/analyticsController"); // dashboard analytics controller 


//   ADMIN MANAGEMENT
router.get("/", authMiddleware, roleMiddleware(["admin"]), adminUserController.adminWelcome);
router.get("/admins", authMiddleware, roleMiddleware(["admin"]), adminUserController.getAllAdmins); // fetch all admins
router.post("/create-user", authMiddleware, roleMiddleware(["admin"]), adminUserController.createAdminUser); // create new admin user


//   REVIEWERS MANAGEMENT
router.get("/reviewers", authMiddleware, roleMiddleware(["admin"]), reviewerController.getAllReviewers); //show all reviewers
router.post("/reviewers", authMiddleware, roleMiddleware(["admin"]), reviewerController.createReviewer); //create new reviewer 
router.put("/reviewers/:id", authMiddleware, roleMiddleware(["admin"]), reviewerController.updateReviewer); //update reviewer details (name, specialization tags)
router.delete("/reviewers/:id", authMiddleware, roleMiddleware(["admin"]), reviewerController.deleteReviewer); //delete reviewer


//   EDUCATORS VERIFICATION
router.get("/educators/pending", authMiddleware, roleMiddleware(["admin"]), educatorController.getPendingEducators); // show pending educators 
router.get("/educators", authMiddleware, roleMiddleware(["admin"]), educatorController.getAllEducators); // show all educators with optional filter
router.get("/educators/:id", authMiddleware, roleMiddleware(["admin"]), educatorController.getEducatorById); // get full details of an educator
router.patch("/educators/:id/verify", authMiddleware, roleMiddleware(["admin"]), educatorController.verifyEducator); // mark verified educator
router.patch("/educators/:id/reject", authMiddleware, roleMiddleware(["admin"]), educatorController.rejectEducator); // mark rejected educator

//   COURSES MANAGEMENT
router.get("/courses/pending", authMiddleware, roleMiddleware(["admin"]), courseController.getPendingCourses); // show all pending courses 
router.get("/courses/stats", authMiddleware, roleMiddleware(["admin"]), courseController.getCourseStats); //show all courses count (pending, approved, rejected)
router.get("/courses/:id", authMiddleware, roleMiddleware(["admin"]), courseController.getCourseById); //show course details by id (for review)
router.patch("/courses/:id/review", authMiddleware, roleMiddleware(["admin"]), courseController.adminReviewCourse);//add admin review to course (approve/reject with notes and rating)

//   DASHBOARD STATS (CHARTS)
router.get("/stats/students-growth", authMiddleware, roleMiddleware(["admin"]), analyticsController.getStudentGrowthStats);// Get student growth stats for dashboard charts

module.exports = router;
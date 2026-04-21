import React from "react";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Layouts
import PublicLayout from "./components/layouts/PublicLayout.jsx";
import PlainLayout from "./components/layouts/PlainLayout.jsx";
import StudentLayout from "./components/layouts/StudentLayout.jsx";
import EducatorLayout from "./components/layouts/EducatorLayout.jsx";
import AdminLayout from "./components/layouts/AdminLayout.jsx";
import ReviewerLayout from "./components/layouts/ReviewerLayout.jsx";
import MentorLayout from "./components/layouts/MentorLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import SignupRole from "./pages/SignupRole.jsx";
import SignupStudent from "./pages/SignupStudent.jsx";
import SignupEducator from "./pages/SignupEducator.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import PublicCourses from "./pages/PublicCourses.jsx";
import NotFound from "./pages/NotFound.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import StudentCourses from "./pages/student/StudentCourses.jsx";
import StudentCourseDetail from "./pages/student/StudentCourseDetail.jsx";
import StudentMentor from "./pages/student/StudentMentor.jsx";
import StudentProfile from "./pages/student/StudentProfile.jsx";
import StudentPathway from "./pages/student/StudentPathway.jsx";
import StudentStepDetail from "./pages/student/StudentStepDetail";
import PathFinder from "./pages/student/PathFinder.jsx";

// Educator Pages
import EducatorDashboard from "./pages/educator/EducatorDashboard.jsx";
import EducatorCourses from "./pages/educator/EducatorCourses.jsx";
import EducatorPublish from "./pages/educator/EducatorPublish.jsx";
import EducatorEditCourse from "./pages/educator/EducatorEditCourse.jsx";
import EducatorAddContent from "./pages/educator/EducatorAddContent.jsx";
import EducatorPayouts from "./pages/educator/EducatorPayouts.jsx";
import EducatorProfile from "./pages/educator/EducatorProfile.jsx";
import EducatorVerificationPendingPage from "./pages/educator/EducatorVerificationPendingPage.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminReviewers from "./pages/admin/AdminReviewers.jsx";
import AdminVerifyEducators from "./pages/admin/AdminVerifyEducators.jsx";
import AdminReviewDashboard from "./pages/admin/AdminReviewDashboard.jsx";
import AdminCourseReview from "./pages/admin/AdminCourseReview.jsx";
import AdminProfile from "./pages/admin/AdminProfile.jsx";
import AdminPathwayBuilder from "./pages/admin/AdminPathwayBuilder.jsx";
import AdminPathwayList from "./pages/admin/AdminPathwayList.jsx";
import AdminPathwayEdit from "./pages/admin/AdminPathwayEdit.jsx";

// Reviewer Pages
import ReviewerDashboard from "./pages/reviewer/ReviewerDashboard.jsx";
import ReviewerQueue from "./pages/reviewer/ReviewerQueue.jsx";
import ReviewerCourseReview from "./pages/reviewer/ReviewerCourseReview.jsx";
import ReviewerHistory from "./pages/reviewer/ReviewerHistory.jsx";
import ReviewerPathwayList from "./pages/reviewer/ReviewerPathwayList.jsx";
import ReviewerPathwayBuilder from "./pages/reviewer/ReviewerPathwayBuilder.jsx";
import ReviewerPathwayEdit from "./pages/reviewer/ReviewerPathwayEdit.jsx";

// Mentor Pages
import MentorDashboard from "./pages/mentor/MentorDashboard.jsx";
import MentorProfile from "./pages/mentor/MentorProfile.jsx";
import MentorSessions from "./pages/mentor/MentorSessions.jsx";
import MentorStudents from "./pages/mentor/MentorStudents.jsx";
import MentorSettings from "./pages/mentor/MentorSettings.jsx";
import MentorShareProfile from "./pages/mentor/MentorShareProfile.jsx";
import MentorResources from "./pages/mentor/MentorResources";
import MentorMessages from "./pages/mentor/MentorMessages.jsx";
import MentorStudentDetails from "./pages/mentor/MentorStudentDetails.jsx";
import MentorAnalytics from "./pages/mentor/MentorAnalytics.jsx";

const App = () => {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="courses" element={<PublicCourses />} />
        </Route>

        <Route element={<PlainLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="signup" element={<SignupRole />} />
          <Route path="signup/student" element={<SignupStudent />} />
          <Route path="signup/educator" element={<SignupEducator />} />
        </Route>

        {/* Student Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="courses/:id" element={<StudentCourseDetail />} />
            <Route path="mentor" element={<StudentMentor />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="path-finder" element={<PathFinder />} />
            <Route path="journey" element={<StudentPathway />} />
            <Route path="journey/step/:stepOrder" element={<StudentStepDetail />} />
          </Route>
        </Route>

        {/* Educator Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["educator"]} />}>
          <Route path="/educator/verification-pending" element={<EducatorVerificationPendingPage />} />
          <Route path="/educator" element={<EducatorLayout />}>
            <Route index element={<EducatorDashboard />} />
            <Route path="courses" element={<EducatorCourses />} />
            <Route path="publish" element={<EducatorPublish />} />
            <Route path="edit/:id" element={<EducatorEditCourse />} />
            <Route path="add-content/:id" element={<EducatorAddContent />} />
            <Route path="payouts" element={<EducatorPayouts />} />
            <Route path="profile" element={<EducatorProfile />} />
          </Route>
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="reviewers" element={<AdminReviewers />} />
            <Route path="verify-educators" element={<AdminVerifyEducators />} />
            <Route path="review-dashboard" element={<AdminReviewDashboard />} />
            <Route path="queue" element={<ReviewerQueue />} />
            <Route path="queue/:id" element={<ReviewerCourseReview />} />
            <Route path="approvals" element={<AdminCourseReview />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="pathway-builder" element={<AdminPathwayBuilder />} />
            <Route path="pathways" element={<AdminPathwayList />} />
            <Route path="pathway-edit/:id" element={<AdminPathwayEdit />} />
          </Route>
        </Route>

        {/* Reviewer Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["reviewer"]} />}>
          <Route path="/reviewer" element={<ReviewerLayout />}>
            <Route index element={<ReviewerDashboard />} />
            <Route path="queue" element={<ReviewerQueue />} />
            <Route path="queue/:id" element={<ReviewerCourseReview />} />
            <Route path="history" element={<ReviewerHistory />} />
            <Route path="pathways" element={<ReviewerPathwayList />} />
            <Route path="pathway-builder" element={<ReviewerPathwayBuilder />} />
            <Route path="pathway-edit/:id" element={<ReviewerPathwayEdit />} />
          </Route>
        </Route>

        {/* Mentor Routes (Keep these for now, maybe add Protection later) */}
         <Route path="/mentor" element={<MentorLayout />}>
          <Route index element={<MentorDashboard />} />
          <Route path="sessions" element={<MentorSessions />} />
          <Route path="students" element={<MentorStudents />} />
          <Route path="profile" element={<MentorProfile />} />
          <Route path="settings" element={<MentorSettings />} />
          <Route path="share-profile" element={<MentorShareProfile />} />
          <Route path="resources" element={<MentorResources />} />
          <Route path="messages" element={<MentorMessages />} />
          <Route path="student-details/:id" element={<MentorStudentDetails />} />
          <Route path="analytics" element={<MentorAnalytics />} />
        </Route> 


        {/* Misc Routes */}
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;



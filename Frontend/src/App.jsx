import React from "react";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PublicLayout from "./components/layouts/PublicLayout.jsx";
import StudentLayout from "./components/layouts/StudentLayout.jsx";
import EducatorLayout from "./components/layouts/EducatorLayout.jsx";
import AdminLayout from "./components/layouts/AdminLayout.jsx";
import ReviewerLayout from "./components/layouts/ReviewerLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminCourseReview from "./pages/admin/AdminCourseReview.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import SignupRole from "./pages/SignupRole.jsx";
import SignupStudent from "./pages/SignupStudent.jsx";
import SignupEducator from "./pages/SignupEducator.jsx";
import PublicCourses from "./pages/PublicCourses.jsx";

import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import StudentCourses from "./pages/student/StudentCourses.jsx";
import StudentCourseDetail from "./pages/student/StudentCourseDetail.jsx";
import StudentMentor from "./pages/student/StudentMentor.jsx";
import StudentProfile from "./pages/student/StudentProfile.jsx";

import EducatorDashboard from "./pages/educator/EducatorDashboard.jsx";
import EducatorCourses from "./pages/educator/EducatorCourses.jsx";
import EducatorPublish from "./pages/educator/EducatorPublish.jsx";
import EducatorEditCourse from "./pages/educator/EducatorEditCourse.jsx";
import EducatorAddContent from "./pages/educator/EducatorAddContent.jsx";
import EducatorPayouts from "./pages/educator/EducatorPayouts.jsx";
import EducatorProfile from "./pages/educator/EducatorProfile.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminReviewers from "./pages/admin/AdminReviewers.jsx";
import AdminVerifyEducators from "./pages/admin/AdminVerifyEducators.jsx";
import AdminReviewDashboard from "./pages/admin/AdminReviewDashboard.jsx";

import ReviewerDashboard from "./pages/reviewer/ReviewerDashboard.jsx";
import ReviewerQueue from "./pages/reviewer/ReviewerQueue.jsx";
import ReviewerCourseReview from "./pages/reviewer/ReviewerCourseReview.jsx";
import ReviewerHistory from "./pages/reviewer/ReviewerHistory.jsx";
import AdminProfile from "./pages/admin/AdminProfile.jsx";

import MentorLayout from "./components/layouts/MentorLayout.jsx";

import MentorDashboard from "./pages/mentor/MentorDashboard.jsx";
import MentorProfile from "./pages/mentor/MentorProfile.jsx";
import MentorSessions from "./pages/mentor/MentorSessions.jsx";
import MentorShareResource from "./pages/mentor/MentorShareResource.jsx";
import MentorStudents from "./pages/mentor/MentorStudents.jsx";

import ComingSoon from "./pages/ComingSoon.jsx";
import NotFound from "./pages/NotFound.jsx";

const App = () => {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignupRole />} />
          <Route path="signup/student" element={<SignupStudent />} />
          <Route path="signup/educator" element={<SignupEducator />} />
          <Route path="courses" element={<PublicCourses />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="courses/:id" element={<StudentCourseDetail />} />
            <Route path="mentor" element={<StudentMentor />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["educator"]} />}>
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

        {/* <Route>
          <Route path="/mentor" element={<MentorLayout />}>
            <Route index element={<MentorDashboard />} />
            <Route path="sessions" element={<MentorSessions />} />
            <Route path="resources" element={<MentorShareResource />} />
            <Route path="students" element={<MentorStudents />} />
            <Route path="profile" element={<MentorProfile />} />
          </Route>
        </Route> */}

        {/* Mentor test routes (unprotected) - quick access for development/testing */}
        <Route path="/MentorDashboard" element={<MentorDashboard />} />
        <Route path="/MentorSessions" element={<MentorSessions />} />
        <Route path="/MentorResources" element={<MentorShareResource />} />
        <Route path="/MentorStudents" element={<MentorStudents />} />
        <Route path="/MentorProfile" element={<MentorProfile />} />

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
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["reviewer"]} />}>
          <Route path="/reviewer" element={<ReviewerLayout />}>
            <Route index element={<ReviewerDashboard />} />
            <Route path="queue" element={<ReviewerQueue />} />
            <Route path="queue/:id" element={<ReviewerCourseReview />} />
            <Route path="history" element={<ReviewerHistory />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
        <Route path="/coming-soon" element={<ComingSoon />} />

      </Routes>
    </AnimatePresence>
  );
};

export default App;


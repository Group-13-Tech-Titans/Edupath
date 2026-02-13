import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRedirect from './components/common/RoleRedirect';

// Auth
import Login from './pages/auth/Login';

// Student
import StudentNavbar from './components/student/StudentNavbar';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import StudentCourseView from './pages/student/StudentCourseView';
import StudentMentorRequest from './pages/student/StudentMentorRequest';
import StudentProfile from './pages/student/StudentProfile';

// Educator
import EducatorNavbar from './components/educator/EducatorNavbar';
import EducatorDashboard from './pages/educator/EducatorDashboard';
import EducatorCourses from './pages/educator/EducatorCourses';
import EducatorCreateCourse from './pages/educator/EducatorCreateCourse';
import EducatorProfile from './pages/educator/EducatorProfile';

// Admin
import AdminNavbar from './components/admin/AdminNavbar';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReviewPanelists from './pages/admin/AdminReviewPanelists';
import AdminCourseReviewQueue from './pages/admin/AdminCourseReviewQueue';
import AdminCourseReviewDetail from './pages/admin/AdminCourseReviewDetail';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';

// Reviewer
import ReviewerNavbar from './components/reviewer/ReviewerNavbar';
import ReviewerDashboard from './pages/reviewer/ReviewerDashboard';
import ReviewerReviewQueue from './pages/reviewer/ReviewerReviewQueue';
import ReviewerCourseDetail from './pages/reviewer/ReviewerCourseDetail';
import ReviewerHistory from './pages/reviewer/ReviewerHistory';

const StudentLayout = () => (
  <>
    <StudentNavbar />
    <Routes>
      <Route path="dashboard" element={<StudentDashboard />} />
      <Route path="courses" element={<StudentCourses />} />
      <Route path="courses/:id" element={<StudentCourseView />} />
      <Route path="mentor-request" element={<StudentMentorRequest />} />
      <Route path="profile" element={<StudentProfile />} />
      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  </>
);

const EducatorLayout = () => (
  <>
    <EducatorNavbar />
    <Routes>
      <Route path="dashboard" element={<EducatorDashboard />} />
      <Route path="courses" element={<EducatorCourses />} />
      <Route path="create-course" element={<EducatorCreateCourse />} />
      <Route path="profile" element={<EducatorProfile />} />
      <Route path="*" element={<Navigate to="/educator/dashboard" replace />} />
    </Routes>
  </>
);

const AdminLayout = () => (
  <>
    <AdminNavbar />
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="review-panelists" element={<AdminReviewPanelists />} />
      <Route path="course-review-queue" element={<AdminCourseReviewQueue />} />
      <Route path="course-review-queue/:id" element={<AdminCourseReviewDetail />} />
      <Route path="settings" element={<AdminSettings />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  </>
);

const ReviewerLayout = () => (
  <>
    <ReviewerNavbar />
    <Routes>
      <Route path="dashboard" element={<ReviewerDashboard />} />
      <Route path="review-queue" element={<ReviewerReviewQueue />} />
      <Route path="review-queue/:id" element={<ReviewerCourseDetail />} />
      <Route path="history" element={<ReviewerHistory />} />
      <Route path="*" element={<Navigate to="/reviewer/dashboard" replace />} />
    </Routes>
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/educator/*"
            element={
              <ProtectedRoute allowedRoles={['educator']}>
                <EducatorLayout />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/reviewer/*"
            element={
              <ProtectedRoute allowedRoles={['reviewer']}>
                <ReviewerLayout />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<RoleRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;



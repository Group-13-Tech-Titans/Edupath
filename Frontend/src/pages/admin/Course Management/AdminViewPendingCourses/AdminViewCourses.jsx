import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminFooter from "../../../../components/layouts/admin-layouts/AdminFooter.jsx";
import PageShell from "../../../../components/PageShell.jsx"; 

// Import child components
import CourseOverviewStats from "./CourseOverviewStats";
import CoursesGrid from "./CoursesGrid";

// API endpoints
const API_URL = import.meta.env.VITE_API_URL;
const PENDING_COURSES_API = `${API_URL}/api/admin/courses/pending`;
const COURSE_STATS_API = `${API_URL}/api/admin/courses/stats`;

export default function AdminViewCourses() {
  const navigate = useNavigate();

  // Component states
  const [courses, setCourses] = useState(() => {
    const cached = localStorage.getItem("admin_pending_courses");
    return cached ? JSON.parse(cached) : [];
  }); // List of pending courses
  const [stats, setStats] = useState(() => {
    const cached = localStorage.getItem("admin_course_stats");
    return cached ? JSON.parse(cached) : { pending: 0, approved: 0, rejected: 0 };
  }); // Course counts
  const [isLoading, setIsLoading] = useState(() => {
    return !localStorage.getItem("admin_pending_courses");
  }); // Loading status
  const [error, setError] = useState(""); // Error messages

  // Helper to get auth token
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!localStorage.getItem("admin_pending_courses")) {
          setIsLoading(true);
        }
        setError("");
        
        // Fetch both pending courses and stats at the same time
        const [pendingRes, statsRes] = await Promise.all([
          axios.get(PENDING_COURSES_API, getAuthHeader()),
          axios.get(COURSE_STATS_API, getAuthHeader())
        ]);
        
        const newCourses = pendingRes.data.courses || pendingRes.data || [];
        const newStats = statsRes.data.stats || { pending: 0, approved: 0, rejected: 0 };

        setCourses(newCourses);
        setStats(newStats);

        localStorage.setItem("admin_pending_courses", JSON.stringify(newCourses));
        localStorage.setItem("admin_course_stats", JSON.stringify(newStats));

      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || "Failed to load courses data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to navigate to course review page
  const openCourse = (id) => navigate(`/admin/course-rating/${id}`);

  return (
    <PageShell>
      <div className="space-y-6">
        
        {/* 1. Stats Component */}
        <CourseOverviewStats stats={stats} />

        {/* 2. Grid Component (Directly passing the fetched courses) */}
        <CoursesGrid 
          isLoading={isLoading} 
          error={error} 
          filteredCourses={courses} 
          openCourse={openCourse} 
        />
        
      </div>

      <div className="mt-8">
        <AdminFooter />
      </div>
    </PageShell>
  );
}
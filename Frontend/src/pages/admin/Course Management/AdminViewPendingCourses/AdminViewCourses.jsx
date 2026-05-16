import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminFooter from "../../../../components/layouts/admin-layouts/AdminFooter.jsx";
import PageShell from "../../../../components/PageShell.jsx"; 

// Import child components
import CourseOverviewStats from "./CourseOverviewStats";
import CoursesGrid from "./CoursesGrid";

// API endpoints
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PENDING_COURSES_API = `${API_URL}/api/admin/courses/pending`;
const COURSE_STATS_API = `${API_URL}/api/admin/courses/stats`;

export default function AdminViewCourses() {
  const navigate = useNavigate();

  // Component states
  const [courses, setCourses] = useState([]); // List of pending courses
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 }); // Course counts
  const [isLoading, setIsLoading] = useState(true); // Loading status
  const [error, setError] = useState(""); // Error messages

  // Helper to get auth token
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        // Fetch both pending courses and stats at the same time
        const [pendingRes, statsRes] = await Promise.all([
          axios.get(PENDING_COURSES_API, getAuthHeader()),
          axios.get(COURSE_STATS_API, getAuthHeader())
        ]);
        
        setCourses(pendingRes.data.courses || pendingRes.data || []);
        setStats(statsRes.data.stats || { pending: 0, approved: 0, rejected: 0 });

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
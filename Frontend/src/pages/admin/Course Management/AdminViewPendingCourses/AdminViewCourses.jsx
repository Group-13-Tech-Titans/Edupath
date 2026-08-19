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

  const [selectedStatus, setSelectedStatus] = useState("pending");

  // Component states
  const [courses, setCourses] = useState(() => {
    const cached = localStorage.getItem(`admin_courses_pending`);
    return cached ? JSON.parse(cached) : [];
  }); // List of courses based on selected status
  const [stats, setStats] = useState(() => {
    const cached = localStorage.getItem("admin_course_stats");
    return cached ? JSON.parse(cached) : { pending: 0, approved: 0, rejected: 0 };
  }); // Course counts
  const [isLoading, setIsLoading] = useState(() => {
    return !localStorage.getItem(`admin_courses_pending`);
  }); // Loading status
  const [error, setError] = useState(""); // Error messages

  // Helper to get auth token
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  // Fetch data on component mount or when selected status changes
  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      try {
        const cacheKey = `admin_courses_${selectedStatus}`;
        if (!localStorage.getItem(cacheKey)) {
          setIsLoading(true);
        } else {
          setCourses(JSON.parse(localStorage.getItem(cacheKey)));
        }
        setError("");
        
        // Fetch both courses and stats at the same time
        const COURSES_API = `${API_URL}/api/admin/courses?status=${selectedStatus}`;
        const [coursesRes, statsRes] = await Promise.all([
          axios.get(COURSES_API, getAuthHeader()),
          axios.get(COURSE_STATS_API, getAuthHeader())
        ]);
        
        if (!isActive) return;

        const newCourses = coursesRes.data.courses || coursesRes.data || [];
        const newStats = statsRes.data.stats || { pending: 0, approved: 0, rejected: 0 };

        setCourses(newCourses);
        setStats(newStats);

        localStorage.setItem(cacheKey, JSON.stringify(newCourses));
        localStorage.setItem("admin_course_stats", JSON.stringify(newStats));

      } catch (err) {
        if (!isActive) return;
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || "Failed to load courses data.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isActive = false;
    };
  }, [selectedStatus]);

  // Function to navigate to course review page
  const openCourse = (id) => navigate(`/admin/course-rating/${id}`);

  return (
    <PageShell>
      <div className="space-y-6">
        
        {/* 1. Stats Component */}
        <CourseOverviewStats 
          stats={stats} 
          selectedStatus={selectedStatus} 
          onStatusChange={setSelectedStatus} 
        />

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
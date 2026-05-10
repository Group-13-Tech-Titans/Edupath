import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminFooter from "../../../../components/layouts/admin-layouts/AdminFooter.jsx";
import PageShell from "../../../../components/PageShell.jsx"; 

// Import Refactored Components
import CourseOverviewStats from "./CourseOverviewStats";
import CoursesGrid from "./CoursesGrid";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PENDING_COURSES_API = `${API_URL}/api/admin/courses/pending`;
const COURSE_STATS_API = `${API_URL}/api/admin/courses/stats`;

export default function AdminViewCourses() {
  const navigate = useNavigate();

  // States
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");
        
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

  // Filter Courses
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      if (!q) return true;
      const educatorName = c.educator?.name || c.educator?.fullName || c.educator || "";
      const hay = `${c.title} ${c.desc} ${c.category} ${educatorName} ${c.level}`.toLowerCase();
      return hay.includes(q);
    });
  }, [courses, search]);

  const openCourse = (id) => navigate(`/admin/course-rating/${id}`);

  return (
    <PageShell>
      <div className="space-y-6">
        
        {/* 1. Stats Component */}
        <CourseOverviewStats stats={stats} />

        {/* 2. Grid Component (Handles Loading, Errors, and the Grid itself) */}
        <CoursesGrid 
          isLoading={isLoading} 
          error={error} 
          filteredCourses={filtered} 
          openCourse={openCourse} 
        />
        
      </div>

      <div className="mt-8">
        <AdminFooter />
      </div>
    </PageShell>
  );
}
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminFooter from "./AdminFooter";
import PageShell from "../../components/PageShell.jsx"; 

// API Endpoints
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PENDING_COURSES_API = `${API_URL}/api/auth/admin/courses/pending`;
const COURSE_STATS_API = `${API_URL}/api/auth/admin/courses/stats`;

export default function AdminViewCourses() {
  const navigate = useNavigate();

  // States
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Helper to get Auth Headers
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  // Fetch pending courses and real stats from the database on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        // Execute both API calls simultaneously for better performance
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

  // Filter only pending courses for the grid based on search
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

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80";

  return (
    <PageShell>
      <div className="space-y-6">
        
        {/* Main Stats Card */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="mb-5">
            <h1 className="text-xl font-semibold text-slate-900">Course Overview</h1>
            <p className="mt-1 text-xs text-slate-500">
              Quick statistics on course submissions across the platform.
            </p>
          </div>

          {/* Sub Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Pending Card */}
            <div className="rounded-2xl border border-black/5 bg-amber-50/50 p-4 flex flex-col justify-center items-start">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending</span>
              </div>
              <span className="text-3xl font-extrabold text-slate-900">{stats.pending}</span>
            </div>

            {/* Approved Card */}
            <div className="rounded-2xl border border-black/5 bg-emerald-50/50 p-4 flex flex-col justify-center items-start">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Approved</span>
              </div>
              <span className="text-3xl font-extrabold text-slate-900">{stats.approved}</span>
            </div>

            {/* Rejected Card */}
            <div className="rounded-2xl border border-black/5 bg-red-50/50 p-4 flex flex-col justify-center items-start">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-700">Rejected</span>
              </div>
              <span className="text-3xl font-extrabold text-slate-900">{stats.rejected}</span>
            </div>
          </div>
        </div>

        {/* Section Header */}
        {/* <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Pending Approvals</h2>
            <p className="mt-1 text-xs text-slate-500">
              Review and manage courses waiting for admin action.
            </p>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200">
            Total: {filtered.length}
          </span>
        </div> */}

        {/* Loading and Error States */}
        {isLoading && (
          <div className="rounded-[26px] border border-black/5 bg-white/60 p-5 text-sm text-slate-500 animate-pulse text-center">
            Loading pending courses...
          </div>
        )}

        {error && (
          <div className="rounded-[26px] border border-red-200 bg-red-50 p-5 text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        {/* Course Grid */}
        {!isLoading && !error && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => {
              const courseId = c._id || c.id;
              const educatorName = c.educator?.name || c.educator?.fullName || c.educator || "Unknown Educator";
              
              return (
                <div
                  key={courseId}
                  className="flex flex-col rounded-[26px] border border-black/5 bg-white/80 shadow-[0_14px_40px_rgba(0,0,0,0.08)] backdrop-blur overflow-hidden transition-transform hover:-translate-y-1"
                >
                  {/* Image */}
                  <button
                    type="button"
                    onClick={() => openCourse(courseId)}
                    className="block w-full text-left shrink-0 relative h-36"
                    title="Open course"
                  >
                    <img
                      src={c.imageUrl || c.thumbnail || FALLBACK_IMAGE}
                      alt={c.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                    
                    {/* Status Badge Over Image */}
                    <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                      Needs Review
                    </div>
                  </button>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <p className="text-base font-extrabold text-slate-900 line-clamp-1">
                      {c.title}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {c.desc || c.description}
                    </p>
                    <p className="mt-3 text-[11px] font-semibold text-slate-600 truncate flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 opacity-70">
                        <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                      </svg>
                      {educatorName}
                    </p>

                    {/* Pills row */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Pill>{c.category || "General"}</Pill>
                      <Pill>{c.level || "Beginner"}</Pill>
                      {c.durationHrs && <Pill>{c.durationHrs} hrs</Pill>}
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto pt-5">
                      <button
                        type="button"
                        onClick={() => openCourse(courseId)}
                        className="w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
                      >
                        Review Course
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="rounded-[26px] border border-black/5 bg-white/60 p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">All Caught Up!</p>
            <p className="text-xs text-slate-500 mt-1">No pending courses require your attention right now.</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <AdminFooter />
      </div>
    </PageShell>
  );
}

// Sub-components
function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-slate-50/80 px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold text-slate-600">
      {children}
    </span>
  );
}
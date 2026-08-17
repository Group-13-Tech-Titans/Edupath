import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PageShell from "../../components/PageShell.jsx";
import { getSubscriptionStatus } from "../../api/subscriptionApi.js";
import {
  Sparkles,
  Clock,
  BookOpen,
  ArrowRight,
  Search,
  GraduationCap,
  Compass,
  PlayCircle,
  X
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const StudentCourses = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch enrolled courses and subscription from backend
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [userDataRes, coursesRes, subData] = await Promise.all([
          axios.get(`${API_BASE_URL}/auth/me`, config).catch(() => ({ data: {} })),
          axios.get(`${API_BASE_URL}/courses`, config).catch(() => ({ data: { courses: [] } })),
          getSubscriptionStatus().catch(() => null)
        ]);

        const freshUser = userDataRes.data.user || userDataRes.data || {};
        const enrolledCourseIds = freshUser.enrolledCourses?.map((c) => String(c.courseId || c._id || c)) || [];
        const allCourses = coursesRes.data.courses || coursesRes.data || [];

        const filteredCourses = allCourses.filter((c) =>
          enrolledCourseIds.includes(String(c._id || c.id))
        );

        setMyCourses(filteredCourses);
        setSubscription(subData);
      } catch (err) {
        console.error("Failed to load enrolled courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const isPremium = subscription?.isPremium || subscription?.plan === "premium";
  const coursesWatched = subscription?.coursesWatchedCount || 0;
  const coursesLimit = subscription?.coursesWatchedLimit && subscription.coursesWatchedLimit > 0 ? subscription.coursesWatchedLimit : 10;

  // Compute categories among enrolled courses
  const categories = useMemo(() => {
    const set = new Set(["All"]);
    myCourses.forEach((c) => {
      if (c.category && c.category.trim()) set.add(c.category.trim());
    });
    return Array.from(set);
  }, [myCourses]);

  // Filtered enrolled courses
  const filteredMyCourses = useMemo(() => {
    return myCourses.filter((course) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        course.title?.toLowerCase().includes(q) ||
        course.description?.toLowerCase().includes(q) ||
        course.educatorName?.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "All" ||
        course.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [myCourses, search, selectedCategory]);

  if (loading) {
    return (
      <PageShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-500">
            Loading your enrolled courses...
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        
        {/* ============================================================ */}
        {/* HEADER SECTION */}
        {/* ============================================================ */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-200/50">
                Personal Library
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              My Enrolled Courses
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Pick up right where you left off and continue your learning journey.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Direct Link to Explore Catalog */}
            <Link
              to="/student/explore"
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Compass className="w-4 h-4" />
              <span>Explore All Courses</span>
            </Link>

            {/* Plan Status Banner in Header */}
            {subscription && (
              <div className="flex items-center gap-3 bg-white p-2.5 px-3.5 rounded-2xl border border-slate-100 shadow-sm">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isPremium ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {isPremium ? "⚡" : "📚"}
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 font-semibold block uppercase text-[9px]">
                    {isPremium ? "Premium Access" : "Monthly Limit"}
                  </span>
                  <span className="font-black text-slate-800 text-xs">
                    {isPremium ? "Unlimited Streaming" : `${coursesWatched} / ${coursesLimit} Used`}
                  </span>
                </div>
                {!isPremium && (
                  <Link
                    to="/student/plans"
                    className="ml-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] hover:bg-emerald-100 transition-colors"
                  >
                    Upgrade
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 mb-8 border-b border-slate-200/80 pb-4">
          <Link
            to="/student/courses"
            className="px-4 py-2 rounded-2xl bg-slate-800 text-white text-xs font-black shadow-sm flex items-center gap-1.5"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Enrolled Courses ({myCourses.length})</span>
          </Link>
          <Link
            to="/student/explore"
            className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Explore Catalog</span>
          </Link>
        </div>

        {/* Search & Filter Bar (if user has enrolled courses) */}
        {myCourses.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs mb-8 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your enrolled courses..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-emerald-500"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {categories.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* COURSE GRID */}
        {/* ============================================================ */}
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {filteredMyCourses.map((course) => {
            const lessonCount =
              course.content?.items?.length || course.content?.modules?.length || 0;

            return (
              <div
                key={course._id || course.id}
                className="group flex flex-col bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* 🖼️ Image Container with Hover Zoom */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={
                      course.thumbnailUrl ||
                      course.thumbnail ||
                      "https://placehold.co/600x400/e2e8f0/64748b?text=EduPath+Course"
                    }
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/600x400/e2e8f0/64748b?text=EduPath+Course";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* 📝 Content Body */}
                <div className="flex flex-col flex-1 p-6 sm:p-8">
                  {/* Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100/50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {course.category || "General"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase tracking-wider">
                      {course.level || "All Levels"}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-800 leading-tight mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6">
                    {course.description || "Continue watching lessons and tracking your learning progress."}
                  </p>

                  {/* Footer: Educator & Action Button */}
                  <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shadow-inner">
                        {course.educatorName ? course.educatorName.charAt(0).toUpperCase() : "E"}
                      </div>
                      <span className="text-xs font-semibold text-slate-600 truncate max-w-[120px]">
                        {course.educatorName || "EduPath"}
                      </span>
                    </div>

                    <Link
                      to={`/student/courses/${course._id || course.id}`}
                      className="bg-slate-800 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md group-hover:bg-emerald-500 group-hover:shadow-emerald-500/40 transition-all active:scale-95 flex items-center gap-1"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 🟢 Empty State UI */}
          {myCourses.length === 0 && (
            <div className="col-span-full rounded-[36px] border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm mb-5">
                🎓
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                You haven't enrolled in any courses yet
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                Your personal library is empty. Browse through published courses by top educators and enroll according to your active plan!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/student/explore"
                  className="bg-emerald-500 text-white px-8 py-3 text-sm font-bold rounded-full shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Browse All Courses</span>
                </Link>
                <Link
                  to="/student/journey"
                  className="bg-white text-slate-700 border border-slate-200 px-6 py-3 text-sm font-bold rounded-full shadow-sm hover:bg-slate-50 transition-all"
                >
                  <span>Explore Learning Journey</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default StudentCourses;
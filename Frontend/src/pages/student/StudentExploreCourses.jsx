import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import { getSubscriptionStatus } from "../../api/subscriptionApi.js";
import { isPremiumUser } from "../../utils/subscriptionUtils.js";
import PlanLimitModal from "../../components/student/PlanLimitModal.jsx";
import UpgradeModal from "../../components/student/UpgradeModal.jsx";
import toast from "react-hot-toast";
import {
  Search,
  Sparkles,
  BookOpen,
  Clock,
  Star,
  User,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  Layers,
  Filter,
  SlidersHorizontal,
  X,
  Lock,
  ChevronRight,
  Flame,
  Info,
  GraduationCap
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const LEVEL_COLORS = {
  Beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Intermediate: "bg-blue-50 text-blue-700 border-blue-200",
  Advanced: "bg-purple-50 text-purple-700 border-purple-200",
  "All Levels": "bg-slate-100 text-slate-700 border-slate-200"
};

const StudentExploreCourses = () => {
  const navigate = useNavigate();
  const { currentUser, enrollInCourse } = useApp();

  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search, filter and sort state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("all"); // "all", "not_enrolled", "enrolled"
  const [sortBy, setSortBy] = useState("popular"); // "popular", "newest", "rating", "az"

  // Modals & Enrollment state
  const [enrollingId, setEnrollingId] = useState(null);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [monthlyResetDate, setMonthlyResetDate] = useState(null);
  const [previewCourse, setPreviewCourse] = useState(null);

  // Fetch courses, user profile, and subscription data
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("edupath_token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const [coursesRes, userRes, subData] = await Promise.all([
        axios.get(`${API_BASE_URL}/courses`, config).catch(() => ({ data: { courses: [] } })),
        axios.get(`${API_BASE_URL}/auth/me`, config).catch(() => ({ data: {} })),
        getSubscriptionStatus().catch(() => null)
      ]);

      const allCourses = coursesRes.data.courses || coursesRes.data || [];
      const user = userRes.data.user || userRes.data || currentUser;
      const enrolled = (user?.enrolledCourses || []).map((c) => String(c.courseId || c._id || c));

      setCourses(allCourses);
      setEnrolledCourseIds(enrolled);
      setSubscription(subData);
    } catch (err) {
      console.error("Error loading explore courses data:", err);
      toast.error("Failed to load courses. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute available categories dynamically
  const categories = useMemo(() => {
    const set = new Set(["All"]);
    courses.forEach((c) => {
      if (c.category && c.category.trim()) {
        set.add(c.category.trim());
      }
    });
    return Array.from(set);
  }, [courses]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        // Search matching
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          course.title?.toLowerCase().includes(q) ||
          course.description?.toLowerCase().includes(q) ||
          course.educatorName?.toLowerCase().includes(q) ||
          course.category?.toLowerCase().includes(q) ||
          course.specializationTag?.toLowerCase().includes(q);

        // Category matching
        const matchesCategory =
          selectedCategory === "All" ||
          course.category?.toLowerCase() === selectedCategory.toLowerCase();

        // Level matching
        const matchesLevel =
          selectedLevel === "All" ||
          (course.level || "All Levels").toLowerCase() === selectedLevel.toLowerCase();

        // Enrollment status matching
        const courseIdStr = String(course._id || course.id);
        const isEnrolled = enrolledCourseIds.includes(courseIdStr);
        let matchesStatus = true;
        if (selectedStatus === "enrolled") matchesStatus = isEnrolled;
        if (selectedStatus === "not_enrolled") matchesStatus = !isEnrolled;

        return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "popular") {
          return (b.enrolledCount || 0) - (a.enrolledCount || 0);
        }
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === "rating") {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (sortBy === "az") {
          return (a.title || "").localeCompare(b.title || "");
        }
        return 0;
      });
  }, [courses, search, selectedCategory, selectedLevel, selectedStatus, sortBy, enrolledCourseIds]);

  // Handle direct enrollment with plan check
  const handleEnroll = async (courseId, courseTitle, e) => {
    if (e) e.stopPropagation();
    try {
      setEnrollingId(courseId);
      const res = await enrollInCourse(courseId);

      if (res.success) {
        toast.success(`Successfully enrolled in "${courseTitle}"!`);
        setEnrolledCourseIds((prev) => [...prev, String(courseId)]);

        // Refresh subscription counters
        const subData = await getSubscriptionStatus().catch(() => null);
        if (subData) setSubscription(subData);

        if (previewCourse && String(previewCourse._id || previewCourse.id) === String(courseId)) {
          setPreviewCourse((prev) => ({ ...prev, isEnrolled: true }));
        }
      } else {
        if (res.limitReached) {
          setMonthlyResetDate(res.monthlyResetDate);
          setLimitModalOpen(true);
        } else {
          toast.error(res.message || "Enrollment failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      toast.error("An unexpected error occurred during enrollment.");
    } finally {
      setEnrollingId(null);
    }
  };

  const isPremium = isPremiumUser(subscription, currentUser);
  const coursesWatched = subscription?.coursesWatchedCount || 0;
  const coursesLimit = subscription?.coursesWatchedLimit && subscription.coursesWatchedLimit > 0 ? subscription.coursesWatchedLimit : 10;
  const coursesRemaining = Math.max(0, coursesLimit - coursesWatched);

  return (
    <PageShell>
      {/* Plan limit & Upgrade Modals */}
      <PlanLimitModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        limitType="course_monthly"
        onUpgradeClick={() => {
          setLimitModalOpen(false);
          setUpgradeModalOpen(true);
        }}
        resetDate={monthlyResetDate}
      />

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onSuccess={() => {
          setUpgradeModalOpen(false);
          fetchData();
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        
        {/* ============================================================ */}
        {/* 🌟 HERO BANNER & HEADER */}
        {/* ============================================================ */}
        <div className="relative rounded-[36px] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 sm:p-12 text-white shadow-2xl overflow-hidden mb-10 border border-slate-700/50">
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-24 w-72 h-72 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EduPath Course Catalog</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
                Explore Courses from Expert Educators
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Discover verified courses published across various engineering, design, and business fields. Enroll seamlessly according to your active plan and start mastering new skills today.
              </p>

              {/* Navigation Tabs between Explore and My Courses */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/student/explore"
                  className="px-5 py-2.5 rounded-full bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-500/30 flex items-center gap-2 hover:bg-emerald-400 transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Browse All Courses ({courses.length})</span>
                </Link>
                <Link
                  to="/student/courses"
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/10 flex items-center gap-2 transition-all"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>My Enrolled Courses ({enrolledCourseIds.length})</span>
                </Link>
              </div>
            </div>

            {/* 🛡️ Real-Time Subscription Plan Widget */}
            {subscription && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-xl max-w-sm w-full shrink-0">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isPremium ? "bg-emerald-400/20 text-emerald-300" : "bg-white/15 text-white"
                    }`}>
                      {isPremium ? "⚡" : "📚"}
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-300 block">
                        Your Active Plan
                      </span>
                      <span className="font-black text-sm text-white">
                        {isPremium ? "Premium Unlimited" : "Free Plan"}
                      </span>
                    </div>
                  </div>

                  {!isPremium ? (
                    <button
                      onClick={() => setUpgradeModalOpen(true)}
                      className="px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 text-[11px] font-black shadow-md hover:brightness-110 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Upgrade</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-full">
                      VIP
                    </span>
                  )}
                </div>

                {/* Progress bar / quota info */}
                <div className="space-y-2 mt-4 pt-4 border-t border-white/10 text-xs">
                  <div className="flex justify-between font-semibold text-slate-300 text-[11px]">
                    <span>Monthly Course Quota</span>
                    <span className="text-white font-bold">
                      {isPremium ? "Unlimited" : `${coursesWatched} / ${coursesLimit} Used`}
                    </span>
                  </div>

                  {!isPremium ? (
                    <>
                      <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            coursesRemaining === 0 ? "bg-rose-400" : "bg-emerald-400"
                          }`}
                          style={{ width: `${Math.min(100, (coursesWatched / coursesLimit) * 100)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-300 flex items-center justify-between">
                        <span>{coursesRemaining} enrollments left this cycle</span>
                        {subscription.monthlyResetDate && (
                          <span className="text-emerald-300">
                            Resets {new Date(subscription.monthlyResetDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="text-[11px] text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Stream & enroll in any course anytime with no limits</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 🔍 SEARCH, FILTER & SORT TOOLBAR */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by course title, educator, topic, or keywords..."
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Level Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer text-slate-800 font-bold"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer text-slate-800 font-bold"
                >
                  <option value="all">All Courses</option>
                  <option value="not_enrolled">Available to Enroll</option>
                  <option value="enrolled">Already Enrolled</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer text-slate-800 font-bold"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="az">Title (A - Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Categories:
            </span>
            {categories.map((cat) => {
              const active = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-slate-800 text-white shadow-md shadow-slate-900/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Header Count */}
        <div className="flex items-center justify-between mb-6 px-1">
          <p className="text-sm font-bold text-slate-600">
            Showing <span className="text-slate-900 font-black">{filteredCourses.length}</span> published {filteredCourses.length === 1 ? "course" : "courses"}
            {selectedCategory !== "All" && ` in "${selectedCategory}"`}
            {search && ` matching "${search}"`}
          </p>

          {(search || selectedCategory !== "All" || selectedLevel !== "All" || selectedStatus !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setSelectedLevel("All");
                setSelectedStatus("all");
              }}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* ============================================================ */}
        {/* 📚 COURSE GRID */}
        {/* ============================================================ */}
        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm animate-pulse space-y-4">
                <div className="h-48 bg-slate-200 rounded-2xl w-full" />
                <div className="h-4 bg-slate-200 rounded-full w-1/3" />
                <div className="h-6 bg-slate-200 rounded-full w-3/4" />
                <div className="h-12 bg-slate-100 rounded-2xl w-full" />
                <div className="h-10 bg-slate-200 rounded-full w-full mt-4" />
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-[36px] border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner mb-4">
              🔍
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No courses match your criteria</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              Try adjusting your search terms, changing the category filter, or clearing your selected filters.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setSelectedLevel("All");
                setSelectedStatus("all");
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const courseIdStr = String(course._id || course.id);
              const isEnrolled = enrolledCourseIds.includes(courseIdStr);
              const isEnrollingThis = enrollingId === courseIdStr;
              const lessonCount = course.content?.items?.length || course.content?.modules?.length || 0;
              const levelBadgeStyle = LEVEL_COLORS[course.level] || LEVEL_COLORS["All Levels"];

              return (
                <div
                  key={courseIdStr}
                  className="group flex flex-col bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300"
                >
                  {/* 🖼️ Thumbnail Container with Badge Overlay */}
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

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                      <span className="bg-white/90 backdrop-blur-md text-slate-800 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                        {course.category || "General"}
                      </span>

                      {isEnrolled ? (
                        <span className="bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Enrolled</span>
                        </span>
                      ) : (
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md ${levelBadgeStyle}`}>
                          {course.level || "All Levels"}
                        </span>
                      )}
                    </div>

                    {/* Quick Preview Button */}
                    <button
                      onClick={() => setPreviewCourse(course)}
                      className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md backdrop-blur-md flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all hover:scale-105 cursor-pointer"
                    >
                      <Info className="w-3 h-3 text-emerald-600" />
                      <span>Preview Syllabus</span>
                    </button>
                  </div>

                  {/* 📝 Content Body */}
                  <div className="flex flex-col flex-1 p-6 sm:p-7">
                    
                    {/* Rating & Stats Bar */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{course.rating ? course.rating.toFixed(1) : "5.0"}</span>
                        <span className="text-slate-400 font-normal">
                          ({course.enrolledCount || 0} students)
                        </span>
                      </div>

                      {lessonCount > 0 && (
                        <div className="flex items-center gap-1 text-slate-500 font-semibold text-[11px]">
                          <PlayCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}</span>
                        </div>
                      )}
                    </div>

                    {/* Course Title & Description */}
                    <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 mb-6">
                      {course.description || "Learn from industry experts with structured lessons and practical guidance."}
                    </p>

                    {/* Footer: Educator & Action CTA */}
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 shadow-inner">
                          {course.educatorName ? course.educatorName.charAt(0).toUpperCase() : "E"}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-700 block truncate">
                            {course.educatorName || "Verified Educator"}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            Educator
                          </span>
                        </div>
                      </div>

                      {/* ACTION BUTTON (ENROLL vs CONTINUE) */}
                      {isEnrolled ? (
                        <Link
                          to={`/student/courses/${courseIdStr}`}
                          className="bg-slate-800 hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-md hover:shadow-emerald-500/30 flex items-center gap-1 transition-all active:scale-95 shrink-0"
                        >
                          <span>Continue</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <button
                          onClick={(e) => handleEnroll(courseIdStr, course.title, e)}
                          disabled={isEnrollingThis}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-black shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-60 cursor-pointer shrink-0"
                        >
                          {isEnrollingThis ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Enrolling...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              <span>Enroll Now</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/* 📖 COURSE PREVIEW MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {previewCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewCourse(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[36px] bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setPreviewCourse(null)}
                className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Preview Header */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-200/60">
                    {previewCourse.category || "General"}
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full">
                    {previewCourse.level || "All Levels"}
                  </span>
                  {previewCourse.rating > 0 && (
                    <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{previewCourse.rating.toFixed(1)}</span>
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {previewCourse.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Published by <strong className="text-slate-700">{previewCourse.educatorName || "EduPath Educator"}</strong>
                </p>
              </div>

              {/* Course Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  About this course
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {previewCourse.description || "No description provided for this course."}
                </p>
              </div>

              {/* Course Syllabus / Curriculum Playlist preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Course Curriculum
                  </h4>
                  <span className="text-xs text-slate-500 font-semibold">
                    {previewCourse.content?.items?.length || 0} Lessons & Materials
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
                  {previewCourse.content?.items && previewCourse.content.items.length > 0 ? (
                    previewCourse.content.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs text-xs font-medium text-slate-700"
                      >
                        <span className="w-5 text-center font-bold text-slate-400 text-[11px]">{idx + 1}</span>
                        <PlayCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="truncate flex-1 font-semibold text-slate-800">{item.name || item.title || "Lesson"}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold px-2 py-0.5 bg-slate-100 rounded-md">
                          {item.type || "Lesson"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-400 font-medium">
                      Curriculum items will unlock upon course enrollment.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewCourse(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>

                {enrolledCourseIds.includes(String(previewCourse._id || previewCourse.id)) ? (
                  <Link
                    to={`/student/courses/${String(previewCourse._id || previewCourse.id)}`}
                    className="bg-slate-800 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>Go to Course Player</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      const id = String(previewCourse._id || previewCourse.id);
                      handleEnroll(id, previewCourse.title);
                    }}
                    disabled={enrollingId === String(previewCourse._id || previewCourse.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-7 py-2.5 rounded-full text-xs font-black shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{enrollingId === String(previewCourse._id || previewCourse.id) ? "Enrolling..." : "Enroll with Your Plan"}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default StudentExploreCourses;

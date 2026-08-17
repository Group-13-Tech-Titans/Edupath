import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const TYPE_META = {
  Lesson: { icon: "📘", pill: "bg-black/5 text-text-dark border-black/10" },
  Video: { icon: "🎬", pill: "bg-violet-50 text-violet-700 border-violet-200" },
  Document: { icon: "📄", pill: "bg-blue-50 text-blue-700 border-blue-200" },
  PowerPoint: { icon: "📊", pill: "bg-orange-50 text-orange-700 border-orange-200" },
  Certificate: { icon: "🏆", pill: "bg-amber-50 text-amber-700 border-amber-200" },
  Quiz: { icon: "📝", pill: "bg-primary/5 text-primary border-primary/20" }
};

function normalizeType(type) {
  const raw = String(type || "").toLowerCase();
  if (raw === "video") return "Video";
  if (raw === "pdf" || raw === "document") return "Document";
  if (raw === "ppt" || raw === "pptx" || raw === "powerpoint") return "PowerPoint";
  if (raw === "certificate") return "Certificate";
  if (raw === "quiz") return "Quiz";
  if (raw === "lesson") return "Lesson";
  return type || "Document";
}

function normalizeItems(course) {
  const items = course?.content?.items;
  if (Array.isArray(items) && items.length) return items;

  const modules = course?.content?.modules;
  if (!Array.isArray(modules)) return [];

  const flat = [];
  for (const m of modules) {
    for (const lesson of m?.lessons || []) {
      flat.push({
        id: lesson.id,
        name: lesson.title,
        type: "Lesson",
        url: null,
        materials: Array.isArray(lesson.materials) ? lesson.materials : []
      });
    }
  }
  return flat;
}

function firstPlayableItem(items) {
  return items.find((i) => normalizeType(i?.type) === "Video" && i?.url) || items[0] || null;
}

function notesKey({ userEmail, courseId, itemId }) {
  return `edupath_notes_v1:${userEmail || "anon"}:${courseId}:${itemId || "none"}`;
}

const StudentCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, lessonProgress, markLessonCompleted, enrollInCourse } = useApp();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  // 🟢 NEW: Store enrollment status locally so we can fetch it fresh!
  const [localIsEnrolled, setLocalIsEnrolled] = useState(false);

  const handleEnrollClick = async () => {
    setEnrolling(true);
    const res = await enrollInCourse(id);
    if (res.success) {
      alert("Successfully enrolled! You can now watch the course.");
      setLocalIsEnrolled(true); // Unlock UI instantly
    } else {
      alert(res.message);
    }
    setEnrolling(false);
  };

  useEffect(() => {
    const fetchCourseAndStatus = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // 1. Fetch Course Data
        const { data: courseData } = await axios.get("http://localhost:5000/api/courses", config);
        const allCourses = courseData.courses || courseData || [];
        const foundCourse = allCourses.find(c => String(c._id || c.id) === String(id));

        if (foundCourse) {
          setCourse(foundCourse);
        } else {
          setError("Course not found.");
          return;
        }

        // 🟢 2. Fetch Fresh User Profile to check Enrollment Status
        const { data: userData } = await axios.get("http://localhost:5000/api/auth/me", config);
        const freshUser = userData.user || userData;
        
        const isUserEnrolled = freshUser.enrolledCourses?.some(
          c => String(c.courseId) === String(id) || String(c.courseId) === String(foundCourse._id)
        );
        
        setLocalIsEnrolled(isUserEnrolled || false);

      } catch (err) {
        console.error(err);
        setError("Failed to fetch course details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseAndStatus();
  }, [id]);

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("materials");

  const items = useMemo(() => normalizeItems(course), [course]);
  const [activeItemId, setActiveItemId] = useState(null);

  const activeItem = useMemo(() => items.find((i) => i?.id === activeItemId) || null, [items, activeItemId]);
  const studentEmail = currentUser?.email || "";

  const studentProgress = useMemo(() => {
    return (lessonProgress[studentEmail] || {})[id] || [];
  }, [lessonProgress, studentEmail, id]);

  const completedCount = studentProgress.length;

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const name = String(it?.name || "").toLowerCase();
      const type = String(it?.type || "").toLowerCase();
      return name.includes(q) || type.includes(q);
    });
  }, [items, query]);

  const materials = useMemo(() => {
    if (normalizeType(activeItem?.type) === "Lesson") return Array.isArray(activeItem?.materials) ? activeItem.materials : [];
    return items.filter((it) => {
      const t = normalizeType(it?.type);
      return t !== "Video" && t !== "Quiz";
    });
  }, [items, activeItem]);

  const progressPct = useMemo(() => {
    const total = items.length || 0;
    if (!total) return 0;
    return Math.round((completedCount / total) * 100);
  }, [items.length, completedCount]);

  useEffect(() => {
    const first = firstPlayableItem(items);
    setActiveItemId(first?.id || null);
  }, [id, items]);

  const [notes, setNotes] = useState("");
  useEffect(() => {
    const key = notesKey({ userEmail: studentEmail, courseId: id, itemId: activeItemId });
    try {
      const saved = window.localStorage.getItem(key);
      setNotes(saved || "");
    } catch {
      setNotes("");
    }
  }, [studentEmail, id, activeItemId]);

  const saveNotes = (value) => {
    setNotes(value);
    const key = notesKey({ userEmail: studentEmail, courseId: id, itemId: activeItemId });
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  };

  const canMark = Boolean(studentEmail) && Boolean(activeItemId);
  const isMarked = activeItemId ? studentProgress.includes(activeItemId) : false;

  const handleMarkCompleted = () => {
    if (!canMark || isMarked) return;
    markLessonCompleted(studentEmail, id, activeItemId);
  };

  const handleBack = () => navigate(-1);

  if (loading) {
    return (
      <PageShell>
        <div className="space-y-4">
          <div className="glass-card p-5 animate-pulse">
            <div className="h-7 w-2/5 rounded-full bg-black/10" />
            <div className="mt-4 h-72 rounded-2xl bg-black/5" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !course) {
    return (
      <PageShell>
        <div className="glass-card px-6 py-10 text-center">
          <p className="text-sm font-semibold text-rose-600">{error || "Course not found."}</p>
          <button type="button" onClick={handleBack} className="btn-soft mt-4 px-5 py-2 text-xs font-bold">
            ← Go Back
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-5">
        <div className="glass-card p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <button
              type="button"
              onClick={handleBack}
              className="text-xs font-semibold text-muted hover:text-text-dark transition"
            >
              ← Back
            </button>
            <h1 className="mt-1 text-lg font-semibold text-text-dark truncate">
              {course.title}
            </h1>
            {course.category && (
              <p className="mt-1 text-xs text-muted truncate">{course.category}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleMarkCompleted}
              disabled={!canMark || isMarked || !localIsEnrolled}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${
                isMarked ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "btn-primary"
              }`}
            >
              {isMarked ? "Completed" : "Mark as completed"}
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="glass-card p-4 relative overflow-hidden">
              
              {/* 🟢 CONDITIONAL UI: Checked against fresh backend data */}
              {localIsEnrolled ? (
                <>
                  {normalizeType(activeItem?.type) === "Video" && activeItem?.url ? (
                    <video src={activeItem.url} controls className="w-full max-h-[480px] rounded-2xl bg-black" />
                  ) : (
                    <div className="grid min-h-[320px] place-items-center rounded-2xl bg-black/5">
                      <div className="text-center px-6">
                        <p className="text-xs font-semibold text-muted">Select a lesson from the playlist</p>
                        <p className="mt-1 text-sm font-semibold text-text-dark">
                          {activeItem?.name || "No lesson selected"}
                        </p>
                        {activeItem?.url && (
                          <a href={activeItem.url} target="_blank" rel="noreferrer" className="btn-soft mt-4 inline-flex px-5 py-2 text-xs">
                            Open resource ↗
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 rounded-2xl bg-white/70 border border-black/5 px-4 py-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">
                        {completedCount} / {items.length} completed
                      </span>
                      <span className="font-semibold text-primary">{progressPct}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/10">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid min-h-[360px] place-items-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200">
                  <div className="text-center px-6 max-w-md">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl mx-auto shadow-md mb-4">🎓</div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Enroll to unlock this course</h2>
                    <p className="text-sm text-slate-600 mb-6">Join this course to get full access to all video lessons, reading materials, quizzes, and your personal progress tracker.</p>
                    <button 
                      onClick={handleEnrollClick}
                      disabled={enrolling}
                      className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-emerald-600 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70"
                    >
                      {enrolling ? "Enrolling..." : "Enroll Now for Free"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("materials")}
                  className={`rounded-full px-4 py-2 text-xs font-semibold border transition ${
                    activeTab === "materials"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-white/60 text-muted border-black/10 hover:text-text-dark"
                  }`}
                >
                  Materials
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("notes")}
                  className={`rounded-full px-4 py-2 text-xs font-semibold border transition ${
                    activeTab === "notes"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-white/60 text-muted border-black/10 hover:text-text-dark"
                  }`}
                >
                  Notes
                </button>
              </div>

              {activeTab === "materials" ? (
                <div className="mt-4 space-y-2">
                  {materials.length === 0 && (
                    <p className="text-xs text-muted">No materials added yet.</p>
                  )}
                  {materials.map((m, idx) => {
                    const rawType = normalizeType(m?.type);
                    const displayName = m?.name || m?.title || "Material";
                    const meta = TYPE_META[rawType] || TYPE_META.Document;
                    return (
                      <div
                        key={m.id || `${rawType}_${displayName}_${idx}`}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 border border-black/5 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`rounded-xl border px-2.5 py-1 text-sm ${meta.pill}`}>{meta.icon}</span>
                            <p className="text-xs font-semibold text-text-dark truncate">{displayName}</p>
                          </div>
                          <p className="mt-1 text-[11px] text-muted">{rawType}</p>
                        </div>
                        {m.url && localIsEnrolled && (
                          <a href={m.url} target="_blank" rel="noreferrer" className="btn-soft px-4 py-2 text-xs">
                            Open ↗
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-[11px] font-semibold text-muted">Saved per lesson (local to this browser)</p>
                  <textarea
                    value={notes}
                    onChange={(e) => saveNotes(e.target.value)}
                    rows={7}
                    placeholder="Write your notes here…"
                    disabled={!localIsEnrolled}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-xs outline-none ring-primary/40 focus:ring disabled:opacity-50"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-5 h-fit">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-dark">Course Playlist</p>
              <span className="text-[11px] font-semibold text-muted">{items.length} items</span>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-3 py-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search lesson…"
                className="w-full bg-transparent text-xs text-text-dark outline-none placeholder:text-muted"
              />
            </div>

            <div className="mt-3 space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20">
              {filteredItems.length === 0 && (
                <p className="text-xs text-muted">No lessons found.</p>
              )}
              {filteredItems.map((it, idx) => {
                const displayType = normalizeType(it?.type);
                const meta = TYPE_META[displayType] || TYPE_META.Document;
                const selected = it.id === activeItemId;
                const done = studentProgress.includes(it.id);
                return (
                  <button
                    key={it.id || idx}
                    type="button"
                    onClick={() => localIsEnrolled && setActiveItemId(it.id)}
                    className={`w-full text-left rounded-2xl border px-4 py-3 transition ${
                      selected ? "border-primary/30 bg-primary/5" : "border-black/10 bg-white/60 hover:bg-white/80"
                    } ${!localIsEnrolled ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-[11px] font-bold text-muted w-5 text-center">{idx + 1}</span>
                      <span className={`rounded-xl border px-2.5 py-1 text-sm ${meta.pill}`}>{meta.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-text-dark truncate">{it.name}</p>
                        <p className="mt-1 text-[11px] text-muted">{displayType}</p>
                      </div>
                      <span
                        className={`ml-2 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold border ${
                          done
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-white text-muted border-black/10"
                        }`}
                      >
                        {done ? "Done" : "—"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default StudentCourseDetail;
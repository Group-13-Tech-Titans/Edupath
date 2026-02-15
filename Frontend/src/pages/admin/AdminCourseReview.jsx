
import React, { useEffect, useMemo, useState } from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import AdminFooter from "./AdminFooter.jsx";

const LS_KEY = "edupath_courses_v1";

const mockCourses = [
  {
    id: "CRS-1001",
    title: "React Fundamentals for Beginners",
    description:
      "Learn React basics: components, props, state, hooks, routing and best practices with hands-on mini projects.",
    category: "Web Development",
    specializationTag: "React",
    level: "Beginner",
    rating: 4.6,
    educatorName: "Kamal perera",
    educatorEmail: "kamal.perera@edupath.com",
    status: "pending",
    createdAt: "2026-02-10T09:30:00.000Z",
    content: {
      modules: [
        {
          title: "Getting Started",
          lessons: [
            { title: "What is React?", materials: ["Slides", "Notes"] },
            { title: "JSX Basics", materials: ["Video", "Quiz"] },
          ],
        },
        {
          title: "State & Props",
          lessons: [
            { title: "Props Deep Dive", materials: ["Notes"] },
            { title: "useState + events", materials: ["Video"] },
          ],
        },
      ],
    },
  },
  {
    id: "CRS-1002",
    title: "UI/UX Design Essentials",
    description:
      "Practical UI/UX foundations: design thinking, wireframes, color, typography, and real-world portfolio tasks.",
    category: "Design",
    specializationTag: "UI/UX",
    level: "Intermediate",
    rating: 4.3,
    educatorName: "Amal Fernando",
    educatorEmail: "amal.fernando@edupath.com",
    status: "pending",
    createdAt: "2026-02-11T15:05:00.000Z",
    content: {
      modules: [
        {
          title: "User Research",
          lessons: [{ title: "Personas", materials: ["Template"] }],
        },
        {
          title: "Wireframing",
          lessons: [
            { title: "Low-fidelity sketches", materials: ["Examples"] },
            { title: "Figma wireframes", materials: ["Video"] },
          ],
        },
      ],
    },
  },
  {
    id: "CRS-1003",
    title: "SQL Crash Course",
    description:
      "Learn SQL basics to advanced queries: joins, grouping, subqueries and database design fundamentals.",
    category: "Databases",
    specializationTag: "SQL",
    level: "Beginner",
    rating: 4.7,
    educatorName: "Kevin Silva",
    educatorEmail: "kevin.silva@edupath.com",
    status: "approved",
    createdAt: "2026-02-05T09:10:00.000Z",
    content: {
      modules: [{ title: "SQL Basics", lessons: [{ title: "SELECT", materials: ["Quiz"] }] }],
    },
  },
];

const AdminCourseReview = () => {
  const app = useApp();
  const coursesFromApp = app.courses || [];
  const setCourses = app.setCourses; // optional if your provider supports it

  const [courses, setLocalCourses] = useState(coursesFromApp);

  useEffect(() => {
    if (coursesFromApp?.length) {
      setLocalCourses(coursesFromApp);
      return;
    }

    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setLocalCourses(parsed);
          return;
        }
      } catch {
        // ignore
      }
    }

    setLocalCourses(mockCourses);
    localStorage.setItem(LS_KEY, JSON.stringify(mockCourses));
  }, [coursesFromApp]);

  // Keep context updated if supported
  useEffect(() => {
    if (typeof setCourses === "function" && courses?.length) setCourses(courses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);

  const [tab, setTab] = useState("pending"); // pending | approved | rejected
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2200);
  };

  const persist = (next) => {
    setLocalCourses(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  const counts = useMemo(() => {
    const pending = courses.filter((c) => c.status === "pending").length;
    const approved = courses.filter((c) => c.status === "approved").length;
    const rejected = courses.filter((c) => c.status === "rejected").length;
    return { pending, approved, rejected };
  }, [courses]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses
      .filter((c) => c.status === tab)
      .filter((c) => {
        if (!q) return true;
        const hay = `${c.title} ${c.description} ${c.category} ${c.specializationTag} ${c.educatorName} ${c.educatorEmail}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [courses, tab, query]);

  const setStatus = (courseId, status, reason = "") => {
    const next = courses.map((c) =>
      c.id === courseId
        ? {
            ...c,
            status,
            decisionReason: reason,
            reviewedAt: new Date().toISOString(),
          }
        : c
    );
    persist(next);

    if (selected?.id === courseId) {
      const updated = next.find((c) => c.id === courseId);
      setSelected(updated || null);
    }

    showToast("success", status === "approved" ? "Course approved ✅" : "Course rejected ❌");
  };

  const reloadMock = () => {
    localStorage.setItem(LS_KEY, JSON.stringify(mockCourses));
    setLocalCourses(mockCourses);
    setSelected(null);
  };

  const TabBtn = ({ value, label, count }) => (
    <button
      onClick={() => {
        setTab(value);
        setSelected(null);
      }}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        tab === value ? "bg-primary/60 text-white shadow" : "bg-white/70 text-text-dark hover:bg-white/90"
      }`}
    >
      {label}
      <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs">{count}</span>
    </button>
  );

  return (
    <PageShell>
      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-20 z-50">
          <div
            className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur bg-white/80 ${
              toast.type === "success" ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-600"
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-text-dark">Course Review</h1>
              <p className="mt-1 text-xs text-muted">
                Review pending courses, approve or reject submissions, and track decisions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={reloadMock}
                className="rounded-full bg-primary/15 px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-primary/20"
              >
                view
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Pending" value={counts.pending} />
          <StatCard label="Approved" value={counts.approved} />
          <StatCard label="Rejected" value={counts.rejected} />
        </div>

        <div className="rounded-[28px] border border-black/5 bg-white/70 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <TabBtn value="pending" label="Pending" count={counts.pending} />
              <TabBtn value="approved" label="Approved" count={counts.approved} />
              <TabBtn value="rejected" label="Rejected" count={counts.rejected} />
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                🔎
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full lg:w-[360px] rounded-2xl border border-black/10 bg-white/70 pl-9 pr-4 py-3 text-sm text-text-dark shadow-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: course list */}
          <div className="lg:col-span-1 rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-dark">Queue</h2>
              <span className="text-xs text-muted">
                Showing <span className="font-semibold text-text-dark">{list.length}</span>
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {list.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full text-left rounded-[22px] border p-4 transition shadow-sm ${
                    selected?.id === c.id
                      ? "border-primary/30 bg-primary/10"
                      : "border-black/5 bg-white/80 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-dark">{c.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {c.educatorName} • {c.category}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-black/5 px-3 py-1 text-[11px] text-muted">
                      {c.level}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-muted">{c.description}</p>
                </button>
              ))}

              {list.length === 0 && (
                <div className="rounded-2xl border border-black/5 bg-white/60 p-4 text-sm text-muted">
                  No courses in this tab.
                </div>
              )}
            </div>
          </div>

          {/* Right: details */}
          <div className="lg:col-span-2 rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
            {!selected ? (
              <div className="rounded-[22px] border border-dashed border-black/10 bg-white/60 p-10 text-center text-sm text-muted">
                Select a course from the queue to review details.
              </div>
            ) : (
              <CourseDetails
                course={selected}
                tab={tab}
                onApprove={() => setStatus(selected.id, "approved")}
                onReject={(reason) => setStatus(selected.id, "rejected", reason)}
              />
            )}
          </div>
        </div>
        <div>
              <AdminFooter/>
        </div>
      </div>
    </PageShell>
  );
};


const StatCard = ({ label, value }) => (
  <div className="rounded-[22px] border border-black/5 bg-white/75 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.08)] backdrop-blur">
    <p className="text-sm text-text-dark/70">{label}</p>
    <p className="mt-2 text-4xl font-extrabold tracking-tight text-text-dark">{value}</p>
  </div>
);

const CourseDetails = ({ course, tab, onApprove, onReject }) => {
  const [reason, setReason] = useState("");

  useEffect(() => setReason(""), [course?.id]);

  const modules = course?.content?.modules || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-text-dark">{course.title}</h3>
            <Badge status={course.status} />
          </div>

          <p className="mt-1 text-sm text-muted">{course.description}</p>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted">
            <Pill label={`ID: ${course.id}`} />
            <Pill label={`Category: ${course.category}`} />
            <Pill label={`Tag: ${course.specializationTag}`} />
            <Pill label={`Level: ${course.level}`} />
            <Pill label={`Rating: ${course.rating}`} />
          </div>

          <div className="mt-3 rounded-[22px] border border-black/5 bg-white/70 p-4 text-sm">
            <p className="text-xs font-semibold text-muted">Educator</p>
            <p className="mt-1 font-semibold text-text-dark">{course.educatorName}</p>
            <p className="text-xs text-muted">{course.educatorEmail}</p>
          </div>
        </div>

        {/* Actions */}
        {tab === "pending" ? (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onReject(reason || "Not enough details / missing materials.")}
              className="rounded-full bg-black/5 px-5 py-2 text-sm font-semibold text-text-dark hover:bg-black/10"
            >
              Reject
            </button>
            <button
              onClick={onApprove}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow hover:brightness-95"
            >
              Approve
            </button>
          </div>
        ) : (
          <div className="rounded-[22px] border border-black/5 bg-white/70 p-4 text-xs text-muted">
            <p>
              Reviewed at:{" "}
              <span className="font-semibold text-text-dark">
                {course.reviewedAt ? new Date(course.reviewedAt).toLocaleString() : "—"}
              </span>
            </p>
            {course.decisionReason && (
              <p className="mt-2">
                Reason: <span className="font-semibold text-text-dark">{course.decisionReason}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Reject reason (only when pending) */}
      {tab === "pending" && (
        <div className="rounded-[22px] border border-black/5 bg-white/70 p-4">
          <p className="text-xs font-semibold text-muted">Rejection Reason (optional)</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Example: Missing lesson materials / unclear module structure / incomplete description..."
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-text-dark shadow-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 min-h-[90px] resize-none"
          />
        </div>
      )}

      {/* Modules / Lessons */}
      <div className="rounded-[22px] border border-black/5 bg-white/70 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text-dark">Course Content</p>
          <span className="text-xs text-muted">
            Modules: <span className="font-semibold text-text-dark">{modules.length}</span>
          </span>
        </div>

        <div className="mt-3 space-y-3">
          {modules.map((m, idx) => (
            <div key={`${m.title}-${idx}`} className="rounded-2xl border border-black/5 bg-white/80 p-4">
              <p className="text-sm font-semibold text-text-dark">
                Module {idx + 1}: {m.title}
              </p>

              <ul className="mt-2 space-y-2">
                {(m.lessons || []).map((l, i) => (
                  <li key={`${l.title}-${i}`} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-text-dark/90">• {l.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {(l.materials || []).map((x) => (
                        <span key={x} className="rounded-full bg-black/5 px-3 py-1 text-[11px] text-muted">
                          {x}
                        </span>
                      ))}
                    </div>
                    
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {modules.length === 0 && (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white/60 p-4 text-sm text-muted">
              No module/lesson data found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Pill = ({ label }) => <span className="rounded-full bg-black/5 px-3 py-1">{label}</span>;

const Badge = ({ status }) => {
  const map = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-600",
  };
  const text = status?.charAt(0)?.toUpperCase() + status?.slice(1);
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[status] || "bg-black/5 text-muted"}`}>{text}</span>;
};

export default AdminCourseReview;

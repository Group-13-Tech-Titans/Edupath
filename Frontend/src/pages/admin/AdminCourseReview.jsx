
import React, { useEffect, useMemo, useState } from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import AdminFooter from "./AdminFooter.jsx";
import ComingSoon from "../ComingSoon.jsx";



const LS_KEY = "edupath_courses_v1";



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





  return (
    <PageShell>
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
                onClick={() => window.location.href = "/admin/view-courses"}
                className="rounded-full bg-primary/15 px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-primary/20"
              >
                view All Courses
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Pending" value={counts.pending} />
          <StatCard label="Approved" value={counts.approved} />
          <StatCard label="Rejected" value={counts.rejected} />
        </div>

        

        
          
          <div className="lg:col-span-1 rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-dark">Recent Courses</h2>
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





export default AdminCourseReview;

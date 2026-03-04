import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const EducatorDashboard = () => {
  const { currentUser, courses } = useApp();

  const normalizeStatus = (status) => {
    const s = String(status ?? "").toLowerCase().trim();
    if (s === "approved" || s.includes("approve")) return "approved";
    if (s === "pending" || s.includes("pending")) return "pending";
    if (s === "rejected" || s.includes("reject")) return "rejected";
    return "approved";
  };

  // Same source of truth as EducatorCourses.jsx
  const myCourses = useMemo(() => {
    return courses.filter((c) => c.createdByEducatorEmail === currentUser?.email);
  }, [courses, currentUser?.email]);

  // Keep the existing list UI exactly the same; only swap the data
  const courseRows = useMemo(() => {
    return myCourses.map((c) => {
      const st = normalizeStatus(c.status);

      const statusLabel =
        st === "approved" ? "Published" : st === "pending" ? "Pending Approval" : "Rejected";

      const meta =
        st === "pending"
          ? "Pending admin review"
          : st === "rejected"
            ? "Requires changes"
            : `Rating ${c.rating ?? "—"} · ${c.level ?? "All levels"}`;

      return {
        id: c.id,
        title: c.title,
        meta,
        status: statusLabel
      };
    });
  }, [myCourses]);

  const statusStyle = (status) => {
    if (status === "Published")
      return "bg-green-100/70 text-green-700 border-green-200/70";
    if (status === "Pending Approval")
      return "bg-yellow-100/70 text-yellow-800 border-yellow-200/70";
    if (status === "Rejected")
      return "bg-red-100/70 text-red-700 border-red-200/70";
    return "bg-white/70 text-text-dark border-black/10";
  };

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card p-6 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-text-dark">
              Educator Dashboard
            </h1>
            <p className="text-xs text-muted mt-1">
              Track your courses, earnings and performance.
            </p>
          </div>

          {/* same width, no animation */}
          <div className="flex flex-col gap-3 items-end">
            {/* ✅ Restored Link to EducatorProfile.jsx route */}
            <Link to="/educator/profile" className="btn-primary w-52 px-6 py-2 text-sm text-center">
              View Profile
            </Link>

            {/* placeholder button, no link for now */}
            <button className="btn-soft w-52 px-6 py-2 text-sm">
              Register as Mentor
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="glass-card p-5">
            <p className="text-xs text-muted">Published Courses</p>
            <p className="text-3xl font-semibold mt-2">6</p>
          </div>

          <div className="glass-card p-5">
            <p className="text-xs text-muted">Active Students</p>
            <p className="text-3xl font-semibold mt-2">1,248</p>
          </div>

          <div className="glass-card p-5">
            <p className="text-xs text-muted">This Month Earnings</p>
            <p className="text-3xl font-semibold mt-2">Rs 182,000</p>
          </div>

          <div className="glass-card p-5">
            <p className="text-xs text-muted">Pending Requests</p>
            <p className="text-3xl font-semibold mt-2">12</p>
          </div>
        </div>

        {/* Your Courses */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-text-dark">Your Courses</h2>

            {/* View All restored */}
            <Link
              to="/educator/courses"
              className="text-sm font-semibold text-primary hover:opacity-90"
            >
              View All
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {courseRows.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl bg-white/80 border border-black/5 px-4 py-3 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-sm text-text-dark">{c.title}</p>
                  <p className="text-xs text-muted mt-1">{c.meta}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-1 text-xs rounded-full border ${statusStyle(
                      c.status
                    )}`}
                  >
                    {c.status}
                  </span>

                  {/* placeholder course inner view */}
                  <Link
                    to={`/educator/courses/${c.id}`}
                    className="btn-primary px-5 py-2 text-xs"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Performance */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-text-dark">Course Performance</h2>

          <div className="mt-4 rounded-2xl border border-dashed border-black/10 bg-white/60 px-4 py-24 text-center text-sm text-muted">
            Revenue / Enrollment graph placeholder
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default EducatorDashboard;

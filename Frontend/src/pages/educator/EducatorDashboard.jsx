import React, { useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const EducatorDashboard = () => {
  const { currentUser, courses, fetchMyCourses } = useApp();

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  const normalizeStatus = (status) => {
    const s = String(status ?? "").toLowerCase().trim();
    if (s === "draft") return "draft";
    if (s === "approved" || s.includes("approve")) return "approved";
    if (s === "pending" || s.includes("pending")) return "pending";
    if (s === "rejected" || s.includes("reject")) return "rejected";
    return "approved";
  };

  // Same source of truth as EducatorCourses.jsx
  const myCourses = useMemo(() => {
    return courses.filter((c) => c.createdByEducatorEmail === currentUser?.email);
  }, [courses, currentUser?.email]);

  const publishedCount = useMemo(
    () => myCourses.filter((c) => normalizeStatus(c.status) === "approved").length,
    [myCourses]
  );

  // Keep the existing list UI exactly the same; only swap the data
  const courseRows = useMemo(() => {
    return myCourses.map((c) => {
      const st = normalizeStatus(c.status);

      const statusLabel =
        st === "draft" ? "Draft"
        : st === "approved" ? "Published"
        : st === "pending" ? "Pending Approval"
        : "Rejected";

      const meta =
        st === "draft"
          ? "Not submitted yet — continue editing"
          : st === "pending"
            ? "Pending admin review"
            : st === "rejected"
              ? "Requires changes — see reviewer feedback below"
              : `Rating ${c.rating ?? "—"} · ${c.level ?? "All levels"}`;

      // Pull reviewer feedback from the course review object
      const reviewNotes = c.review?.notes || null;
      const reviewerName = c.review?.reviewerName || null;
      const reviewRating = c.review?.rating ?? null;

      return {
        id: c.id,
        title: c.title,
        meta,
        status: statusLabel,
        isDraft: st === "draft",
        isRejected: st === "rejected",
        reviewNotes,
        reviewerName,
        reviewRating
      };
    });
  }, [myCourses]);

  const statusStyle = (status) => {
    if (status === "Draft")
      return "bg-slate-100/70 text-slate-600 border-slate-200/70";
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
            {/* placeholder button, no link for now */}
            <button className="btn-soft w-52 px-6 py-2 text-sm">
              Register as Mentor
            </button>

            {/* ✅ Link to Publish new Course */}
            <Link to="/educator/publish" className="btn-primary w-52 px-6 py-2 text-sm text-center">
              Publish new Course
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="glass-card p-5">
            <p className="text-xs text-muted">Published Courses</p>
            <p className="text-3xl font-semibold mt-2">{publishedCount}</p>
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
                className="rounded-2xl bg-white/80 border border-black/5 px-4 py-3 shadow-sm flex flex-col gap-2"
              >
                {/* Top row: title + actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-sm text-text-dark">{c.title}</p>
                    <p className="text-xs text-muted mt-1">{c.meta}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-4 py-1 text-xs rounded-full border ${statusStyle(c.status)}`}
                    >
                      {c.status}
                    </span>

                    <Link
                      to={(c.isDraft || c.isRejected) ? `/educator/edit/${c.id}` : `/educator/courses/${c.id}`}
                      className="btn-primary px-5 py-2 text-xs"
                    >
                      {(c.isDraft || c.isRejected) ? "Edit" : "Manage"}
                    </Link>
                  </div>
                </div>

                {/* Reviewer feedback — only shown on rejected courses */}
                {c.isRejected && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-rose-700">
                        Reviewer Feedback
                        {c.reviewerName && (
                          <span className="font-normal text-rose-500"> — {c.reviewerName}</span>
                        )}
                      </p>
                      {c.reviewRating != null && (
                        <span className="text-[11px] text-rose-500 font-medium">
                          Rating: {c.reviewRating}/5
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-rose-700">
                      {c.reviewNotes || "No specific notes were provided. Please review your course content and resubmit."}
                    </p>
                  </div>
                )}
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

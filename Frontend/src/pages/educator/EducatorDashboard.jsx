import React, { useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const normalizeStatus = (status) => {
  const s = String(status ?? "").toLowerCase().trim();
  if (s === "draft") return "draft";
  if (s === "approved" || s.includes("approve")) return "approved";
  if (s === "pending" || s.includes("pending")) return "pending";
  if (s === "rejected" || s.includes("reject")) return "rejected";
  return "approved";
};

const statusMeta = (st) => {
  if (st === "draft")    return { label: "Draft",           cls: "bg-slate-100 text-slate-600 border-slate-200" };
  if (st === "approved") return { label: "Published",       cls: "bg-primary/10 text-primary border-primary/20" };
  if (st === "pending")  return { label: "Pending Approval",cls: "bg-amber-50 text-amber-700 border-amber-200" };
  return                        { label: "Rejected",        cls: "bg-rose-50 text-rose-600 border-rose-200" };
};

const StatCard = ({ label, value }) => (
  <div className="glass-card p-5">
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold text-text-dark">{value}</p>
    </div>
  </div>
);

const EducatorDashboard = () => {
  const { currentUser, courses, fetchMyCourses } = useApp();

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  const myCourses = useMemo(
    () => courses.filter((c) => c.createdByEducatorEmail === currentUser?.email),
    [courses, currentUser?.email]
  );

  const publishedCount = useMemo(
    () => myCourses.filter((c) => !c.trashedAt && normalizeStatus(c.status) === "approved").length,
    [myCourses]
  );

  const pendingCount = useMemo(
    () => myCourses.filter((c) => !c.trashedAt && normalizeStatus(c.status) === "pending").length,
    [myCourses]
  );

  const courseRows = useMemo(() => {
    return myCourses
      .filter((c) => !c.trashedAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((c) => {
        const st = normalizeStatus(c.status);
        const { label, cls } = statusMeta(st);

        const reviewNotes = c.review?.notes || null;
        const reviewerName = c.review?.reviewerName || null;
        const reviewRating = c.review?.rating ?? c.rating ?? null;

        const meta =
          st === "draft"    ? "Not submitted yet - continue editing" :
          st === "pending"  ? "Pending admin review" :
          st === "rejected" ? "Requires changes - see feedback below" :
          `Rating ${reviewRating ?? "-"} - ${c.level ?? "All levels"}`;

        return {
          id: c.id,
          title: c.title,
          meta,
          statusLabel: label,
          statusCls: cls,
          isDraft: st === "draft",
          isRejected: st === "rejected",
          hasReview: Boolean(reviewNotes || reviewerName || reviewRating != null),
          reviewNotes,
          reviewerName,
          reviewRating,
        };
      });
  }, [myCourses]);

  return (
    <PageShell>
      <div className="space-y-6">

        {/* Header */}
        <div className="glass-card p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text-dark">Educator Dashboard</h1>
            <p className="mt-1 text-xs text-muted">Track your courses, earnings and performance.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button className="btn-soft px-6 py-2 text-sm">Register as Mentor</button>
            <Link to="/educator/publish" className="btn-primary px-6 py-2 text-sm text-center">
              Publish New Course
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Published Courses" value={publishedCount} />
          <StatCard label="Active Students"   value="1,248" />
          <StatCard label="Monthly Earnings"  value="Rs 182,000" />
          <StatCard label="Pending Reviews"   value={pendingCount} />
        </div>

        {/* Your Courses */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-text-dark">Recent Courses</h2>
              <p className="mt-0.5 text-xs text-muted">Your 5 most recently created courses.</p>
            </div>
            <Link to="/educator/courses" className="text-xs font-semibold text-primary hover:opacity-80 transition">
              View All
            </Link>
          </div>

          {courseRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white/50 px-6 py-12 text-center">
              <p className="text-sm font-medium text-muted">No courses yet.</p>
              <p className="mt-1 text-xs text-muted">Create your first course to get started.</p>
              <Link to="/educator/publish" className="btn-primary mt-4 inline-flex px-6 py-2 text-xs">
                + Create Course
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {courseRows.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl bg-white/80 border border-black/5 px-4 py-4 shadow-sm flex flex-col gap-2 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-text-dark truncate">{c.title}</p>
                      <p className="text-xs text-muted mt-0.5">{c.meta}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-3 py-1 text-[11px] font-semibold rounded-full border ${c.statusCls}`}>
                        {c.statusLabel}
                      </span>
                      <Link
                        to={(c.isDraft || c.isRejected) ? `/educator/edit/${c.id}` : `/educator/courses/${c.id}`}
                        className="btn-primary px-5 py-2 text-xs"
                      >
                        {(c.isDraft || c.isRejected) ? "Edit" : "Manage"}
                      </Link>
                    </div>
                  </div>

                  {c.hasReview && (
                    <div className={`rounded-xl border px-4 py-3 space-y-1 ${
                      c.isRejected
                        ? "border-rose-200 bg-rose-50"
                        : "border-primary/20 bg-primary/5"
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs font-semibold ${c.isRejected ? "text-rose-700" : "text-primary"}`}>
                          Reviewer Feedback
                          {c.reviewerName && (
                            <span className={`font-normal ${c.isRejected ? "text-rose-500" : "text-primary/80"}`}> - {c.reviewerName}</span>
                          )}
                        </p>
                        {c.reviewRating != null && (
                          <span className={`text-[11px] font-medium ${c.isRejected ? "text-rose-500" : "text-primary/80"}`}>
                            Rating: {c.reviewRating}/5
                          </span>
                        )}
                      </div>
                      <p className={`text-xs ${c.isRejected ? "text-rose-700" : "text-text-dark"}`}>
                        {c.reviewNotes || "No specific notes provided."}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Course Performance */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-text-dark">Course Performance</h2>
              <p className="mt-0.5 text-xs text-muted">Revenue and enrollment trends.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-black/10 bg-white/50 px-4 py-20 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-xl">
              Chart
            </div>
            <p className="text-sm font-medium text-muted">Analytics coming soon</p>
            <p className="mt-1 text-xs text-muted">Revenue and enrollment charts will appear here.</p>
          </div>
        </div>

      </div>
    </PageShell>
  );
};

export default EducatorDashboard;

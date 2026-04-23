import React from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const EducatorDashboard = () => {
  const { currentUser, users, courses } = useApp();
  const educator = users.find((u) => u.email === currentUser?.email);
  const myCourses = courses.filter(
    (c) => c.createdByEducatorEmail === currentUser?.email
  );

  const stats = {
    published: myCourses.filter((c) => c.status === "approved").length,
    pending: myCourses.filter((c) => c.status === "pending").length,
    rejected: myCourses.filter((c) => c.status === "rejected").length
  };

  return (
    <PageShell>
      <div className="space-y-5">
        <div className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Educator overview
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-text-dark">
            {educator?.name || "Educator"}
          </h1>
          <p className="mt-2 text-xs text-muted">
            Publish high quality courses and track your performance.
          </p>
          {educator?.status === "PENDING_VERIFICATION" && (
            <div className="mt-3 rounded-2xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
              Your account is pending admin verification. Publishing is temporarily
              disabled.
            </div>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass-card p-4 text-xs">
            <p className="text-muted">Published courses</p>
            <p className="mt-1 text-2xl font-semibold text-text-dark">
              {stats.published}
            </p>
          </div>
          <div className="glass-card p-4 text-xs">
            <p className="text-muted">Pending review</p>
            <p className="mt-1 text-2xl font-semibold text-text-dark">
              {stats.pending}
            </p>
          </div>
          <div className="glass-card p-4 text-xs">
            <p className="text-muted">Rejected / changes</p>
            <p className="mt-1 text-2xl font-semibold text-text-dark">
              {stats.rejected}
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default EducatorDashboard;


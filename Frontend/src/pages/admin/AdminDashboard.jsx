import React from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const AdminDashboard = () => {
  const { users, courses, reviewHistory } = useApp();
  const educators = users.filter((u) => u.role === "educator");
  const pendingEducators = educators.filter((e) => e.status === "PENDING_VERIFICATION");
  const pendingCourses = courses.filter((c) => c.status === "pending");

  return (
    <PageShell>
      <div className="space-y-5">
        <div className="glass-card p-5">
          <h1 className="text-xl font-semibold text-text-dark">System dashboard</h1>
          <p className="mt-1 text-xs text-muted">
            High-level overview of users, approvals, and review activity.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs">
            <div className="rounded-2xl bg-white/80 p-4 shadow">
              <p className="text-muted">Total users</p>
              <p className="mt-1 text-2xl font-semibold text-text-dark">{users.length}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow">
              <p className="text-muted">Pending educator approvals</p>
              <p className="mt-1 text-2xl font-semibold text-text-dark">
                {pendingEducators.length}
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow">
              <p className="text-muted">Pending course reviews</p>
              <p className="mt-1 text-2xl font-semibold text-text-dark">
                {pendingCourses.length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 text-xs">
          <h2 className="text-sm font-semibold text-text-dark">Recent review actions</h2>
          <ul className="mt-3 space-y-2">
            {reviewHistory.slice(0, 5).map((item) => (
              <li key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-dark">
                    Course {item.courseId} — {item.decision}
                  </p>
                  <p className="text-[11px] text-muted">
                    Reviewer: {item.reviewerEmail || "N/A"} ·{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
            {reviewHistory.length === 0 && (
              <li className="text-muted">No review actions recorded yet.</li>
            )}
          </ul>
        </div>
      </div>
    </PageShell>
  );
};

export default AdminDashboard;


import React from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const AdminReviewDashboard = () => {
  const { courses, reviewHistory } = useApp();
  const pending = courses.filter((c) => c.status === "pending");
  const approved = courses.filter((c) => c.status === "approved");
  const rejected = courses.filter((c) => c.status === "rejected");

  return (
    <PageShell>
      <div className="space-y-5">
        <div className="glass-card p-5 text-xs">
          <h1 className="text-xl font-semibold text-text-dark">Review activity</h1>
          <p className="mt-1 text-muted">
            Monitor course review pipeline across reviewers.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/80 p-4 shadow">
              <p className="text-muted">Pending</p>
              <p className="mt-1 text-2xl font-semibold text-text-dark">
                {pending.length}
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow">
              <p className="text-muted">Approved</p>
              <p className="mt-1 text-2xl font-semibold text-text-dark">
                {approved.length}
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow">
              <p className="text-muted">Rejected</p>
              <p className="mt-1 text-2xl font-semibold text-text-dark">
                {rejected.length}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5 text-xs">
          <h2 className="text-sm font-semibold text-text-dark">Recent actions</h2>
          <ul className="mt-3 space-y-2">
            {reviewHistory.slice(0, 10).map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-2xl bg-white/80 px-3 py-2"
              >
                <div>
                  <p className="font-medium text-text-dark">
                    {item.decision.toUpperCase()} — course {item.courseId}
                  </p>
                  <p className="text-[11px] text-muted">
                    Reviewer: {item.reviewerEmail || "N/A"} ·{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                {item.notes && (
                  <span className="rounded-full bg-yellow-50 px-3 py-1 text-[11px] text-yellow-700">
                    Notes
                  </span>
                )}
              </li>
            ))}
            {reviewHistory.length === 0 && (
              <li className="text-muted">No review actions yet.</li>
            )}
          </ul>
        </div>
      </div>
    </PageShell>
  );
};

export default AdminReviewDashboard;


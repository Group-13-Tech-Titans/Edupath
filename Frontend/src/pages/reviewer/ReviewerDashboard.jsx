import React from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const ReviewerDashboard = () => {
  const { currentUser, courses } = useApp();
  const pending = courses.filter((c) => c.status === "pending");

  return (
    <PageShell>
      <div className="space-y-5">
        <div className="glass-card p-5">
          <h1 className="text-xl font-semibold text-text-dark">Review dashboard</h1>
          <p className="mt-1 text-xs text-muted">
            Welcome, {currentUser?.name || currentUser?.email}. Review courses for
            quality and guideline alignment.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs">
            <div className="rounded-2xl bg-white/80 p-4 shadow">
              <p className="text-muted">Pending queue</p>
              <p className="mt-1 text-2xl font-semibold text-text-dark">
                {pending.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default ReviewerDashboard;


import React from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const ReviewerHistory = () => {
  const { reviewHistory, currentUser } = useApp();
  const myHistory = reviewHistory.filter(
    (h) => !currentUser || !currentUser.email || h.reviewerEmail === currentUser.email
  );

  return (
    <PageShell>
      <div className="glass-card p-5 text-xs">
        <h1 className="text-xl font-semibold text-text-dark">Review history</h1>
        <p className="mt-1 text-muted">
          A log of your previous approvals and rejections stored locally.
        </p>
        <ul className="mt-3 space-y-2">
          {myHistory.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-2xl bg-white/80 px-3 py-2"
            >
              <div>
                <p className="font-medium text-text-dark">
                  {item.decision.toUpperCase()} — course {item.courseId}
                </p>
                <p className="text-[11px] text-muted">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
                {item.notes && (
                  <p className="mt-1 text-[11px] text-muted">Notes: {item.notes}</p>
                )}
              </div>
            </li>
          ))}
          {myHistory.length === 0 && (
            <li className="text-sm text-muted">No history yet.</li>
          )}
        </ul>
      </div>
    </PageShell>
  );
};

export default ReviewerHistory;


import React, { useMemo, useState } from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const decisionMeta = (decision) => {
  const d = (decision || "").toLowerCase();
  if (d === "approved") return { label: "Approved", cls: "bg-primary/10 text-primary border-primary/20" };
  if (d === "rejected") return { label: "Rejected", cls: "bg-rose-50 text-rose-600 border-rose-200" };
  if (d === "minor_changes") return { label: "Minor Changes", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  if (d === "major_changes") return { label: "Major Changes", cls: "bg-orange-50 text-orange-700 border-orange-200" };
  return { label: decision || "Reviewed", cls: "bg-slate-100 text-slate-500 border-slate-200" };
};

const ReviewerHistory = () => {
  const { reviewHistory, currentUser } = useApp();
  const [query, setQuery] = useState("");

  const myHistory = useMemo(() => {
    const base = reviewHistory.filter(
      (h) => !currentUser || !currentUser.email || h.reviewerEmail === currentUser.email
    );
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (h) =>
        (h.courseId || "").toLowerCase().includes(q) ||
        (h.decision || "").toLowerCase().includes(q) ||
        (h.notes || "").toLowerCase().includes(q)
    );
  }, [reviewHistory, currentUser, query]);

  return (
    <PageShell>
      <div className="space-y-6">

        {/* Header */}
        <div className="glass-card p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text-dark">Review History</h1>
            <p className="mt-1 text-xs text-muted">
              A log of all your past review decisions.
            </p>
          </div>
          {myHistory.length > 0 && (
            <span className="self-start sm:self-auto rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold text-primary">
              {reviewHistory.filter(
                (h) => !currentUser?.email || h.reviewerEmail === currentUser.email
              ).length} total reviews
            </span>
          )}
        </div>

        {/* Search */}
        {reviewHistory.length > 0 && (
          <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white/80 px-4 py-2.5 sm:w-80">
            <svg className="h-3.5 w-3.5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-text-dark outline-none placeholder:text-muted"
              placeholder="Search by course ID or decision..."
            />
          </div>
        )}

        {/* Empty state */}
        {myHistory.length === 0 && (
          <div className="glass-card px-6 py-16 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-text-dark">No history yet</p>
            <p className="mt-1 text-xs text-muted">
              {query ? "No entries match your search." : "Your review decisions will appear here once you start reviewing courses."}
            </p>
          </div>
        )}

        {/* History list */}
        {myHistory.length > 0 && (
          <div className="space-y-3">
            {myHistory.map((item) => {
              const { label, cls } = decisionMeta(item.decision);
              const date = item.createdAt
                ? new Date(item.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : null;

              return (
                <div
                  key={item.id}
                  className="glass-card p-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between transition hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${cls}`}>
                        {label}
                      </span>
                      <span className="text-xs font-semibold text-text-dark truncate">
                        Course: {item.courseId || "—"}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="mt-2 text-xs text-muted line-clamp-2">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  {date && (
                    <p className="shrink-0 text-[11px] text-muted">{date}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default ReviewerHistory;

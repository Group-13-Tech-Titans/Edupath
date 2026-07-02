import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

// Picks the label and color for a review decision
const decisionMeta = (decision) => {
  const d = (decision || "").toLowerCase();
  if (d === "approved") return { label: "Approved", cls: "text-primary" };
  if (d === "minor_changes") return { label: "Minor Changes", cls: "text-amber-700" };
  if (d === "major_changes") return { label: "Major Changes", cls: "text-orange-700" };
  return { label: "Rejected", cls: "text-rose-600" };
};

// Builds the reviewer history page
const ReviewerHistory = () => {
  const { reviewHistory, currentUser, fetchReviewerHistory } = useApp();
  const navigate = useNavigate();
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Loads the review history when the page opens
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchReviewerHistory().finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [fetchReviewerHistory]);

  // Filters history by reviewer and selected decision
  const myHistory = useMemo(() => {
    const base = reviewHistory
      .filter((h) => !currentUser || !currentUser.email || h.reviewerEmail === currentUser.email)
      .sort((a, b) => new Date(b.reviewedAt || b.createdAt || 0) - new Date(a.reviewedAt || a.createdAt || 0));

    if (decisionFilter === "all") return base;
    return base.filter(
      (h) => (h.decision || h.course?.status || "").toLowerCase() === decisionFilter,
    );
  }, [reviewHistory, currentUser, decisionFilter]);

  // Counts all reviews done by this reviewer
  const totalReviews = reviewHistory.filter(
    (h) => !currentUser?.email || h.reviewerEmail === currentUser.email,
  ).length;

  return (
    <PageShell>
      {/* Holds all review history sections */}
      <div className="space-y-6">
        {/* Shows the page title and total reviews */}
        <div className="glass-card p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Shows the review history heading */}
          <div>
            <h1 className="text-lg font-semibold text-text-dark">Review History</h1>
            <p className="mt-1 text-xs text-muted">
              A log of all courses you have reviewed.
            </p>
          </div>
          {totalReviews > 0 && (
            <span className="self-start rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold text-primary sm:self-auto">
              {totalReviews} total reviews
            </span>
          )}
        </div>

        {totalReviews > 0 && (
          /* Filters history by decision */
          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="rounded-2xl border border-black/10 bg-white/80 px-4 py-2.5 text-xs font-medium text-text-dark outline-none sm:w-56"
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="minor_changes">Minor Changes</option>
            <option value="major_changes">Major Changes</option>
            <option value="rejected">Rejected</option>
          </select>
        )}

        {loading && (
          /* Shows while review history is loading */
          <div className="glass-card px-6 py-12 text-center">
            <p className="text-sm font-semibold text-text-dark">Loading review history...</p>
          </div>
        )}

        {!loading && myHistory.length === 0 && (
          /* Shows when there are no matching history items */
          <div className="glass-card px-6 py-16 text-center">
            {/* Shows the empty history icon */}
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-text-dark">No history yet</p>
            <p className="mt-1 text-xs text-muted">
              {decisionFilter !== "all" ? "No entries match this decision filter." : "Your reviewed courses will appear here after you submit decisions."}
            </p>
          </div>
        )}

        {!loading && myHistory.length > 0 && (
          /* Holds the review history cards */
          <div className="space-y-3">
            {myHistory.map((item) => {
              const course = item.course || {};
              const courseId = item.courseId || course.id || course._id;
              const decision = item.decision || course.status;
              const { label, cls } = decisionMeta(decision);
              const reviewedDate = item.reviewedAt || item.createdAt;
              const date = reviewedDate
                ? new Date(reviewedDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "date unavailable";
              const reviewItem = {
                id: courseId,
                type: "course",
                title: item.title || course.title || "Untitled course",
                subjectDomain: course.subject || course.category || "General",
                description: course.description || "",
              };

              return (
                /* Shows one reviewed course */
                <div
                  key={item.id || courseId}
                  className="glass-card p-5 flex flex-col gap-4 transition hover:-translate-y-0.5 hover:shadow-2xl sm:flex-row sm:items-start sm:justify-between"
                >
                  {/* Shows the reviewed course details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="truncate text-sm font-semibold text-text-dark">
                        {reviewItem.title}
                      </p>
                      <span className={`text-xs font-semibold ${cls}`}>
                        {label}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted">
                      Reviewed on {date}
                    </p>
                    {item.notes && (
                      <p className="mt-2 line-clamp-2 text-xs text-muted">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  {/* Opens the reviewed item */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/reviewer/queue/${courseId}?type=course`, {
                        state: { reviewItem },
                      })
                    }
                    className="btn-soft self-start px-4 py-2 text-xs sm:self-auto"
                  >
                    Open
                  </button>
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

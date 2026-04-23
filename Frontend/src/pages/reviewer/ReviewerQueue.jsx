import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const ReviewerQueue = () => {
  const { currentUser, courses, fetchReviewerQueue } = useApp();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchReviewerQueue()
      .then((result) => {
        if (alive && !result.success) setError(result.message || "Failed to load reviewer queue.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [fetchReviewerQueue]);

  const pending = useMemo(
    () => courses.filter((c) => c.status === "pending"),
    [courses]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pending;
    return pending.filter(
      (c) =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.category || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
    );
  }, [pending, query]);

  const reviewerTags = useMemo(() => {
    const profile = currentUser?.profile || {};
    return [
      ...(Array.isArray(currentUser?.specializationTags) ? currentUser.specializationTags : []),
      currentUser?.specializationTag,
      ...(Array.isArray(profile.specializationTags) ? profile.specializationTags : []),
      ...(Array.isArray(profile.specializations)
        ? profile.specializations.map((item) => item?.slug || item)
        : []),
      profile.specialization?.slug,
    ].filter(Boolean);
  }, [currentUser]);

  return (
    <PageShell>
      <div className="space-y-6">

        {/* Header */}
        <div className="glass-card p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text-dark">Review Queue</h1>
            <p className="mt-1 text-xs text-muted">
              Pending courses matched to your specialization.
            </p>
          </div>

          {/* Specialization tags */}
          <div className="flex flex-wrap gap-2">
            {reviewerTags.length > 0 ? (
              reviewerTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[11px] font-semibold text-primary"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[11px] font-semibold text-amber-700">
                No specialization assigned
              </span>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
            {error}
          </div>
        )}

        {/* Search + count */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white/80 px-4 py-2.5 sm:w-80">
            <svg className="h-3.5 w-3.5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-text-dark outline-none placeholder:text-muted"
              placeholder="Search by title or category..."
            />
          </div>
          {!loading && (
            <p className="text-xs text-muted">
              {filtered.length} course{filtered.length !== 1 ? "s" : ""} pending review
            </p>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-3 w-1/3 rounded-full bg-black/10 mb-3" />
                <div className="h-4 w-3/4 rounded-full bg-black/10 mb-2" />
                <div className="h-3 w-full rounded-full bg-black/10 mb-1" />
                <div className="h-3 w-2/3 rounded-full bg-black/10" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="glass-card px-6 py-16 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-text-dark">Queue is empty</p>
            <p className="mt-1 text-xs text-muted">
              {query ? "No courses match your search." : "No pending courses match your specialization."}
            </p>
          </div>
        )}

        {/* Course cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <div
                key={course.id}
                className="glass-card flex flex-col p-5 transition hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Category pill */}
                <span className="self-start rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-semibold text-primary">
                  {course.category || "General"}
                </span>

                {/* Title */}
                <h3 className="mt-3 text-sm font-semibold text-text-dark leading-snug line-clamp-2">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-xs text-muted line-clamp-3 flex-1">
                  {course.description || "No description provided."}
                </p>

                {/* Specialization tag */}
                {course.specializationTag && (
                  <div className="mt-3">
                    <span className="rounded-full bg-black/5 border border-black/10 px-2.5 py-1 text-[10px] font-semibold text-muted">
                      #{course.specializationTag}
                    </span>
                  </div>
                )}

                {/* Educator & submitted */}
                <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between text-[10px] text-muted">
                  <span className="truncate">{course.createdByEducatorEmail || course.educatorName || "—"}</span>
                  {course.createdAt && (
                    <span className="shrink-0 ml-2">
                      {String(course.createdAt).slice(0, 10)}
                    </span>
                  )}
                </div>

                {/* Action */}
                <Link
                  to={`/reviewer/queue/${course.id}?type=course`}
                  state={{ reviewItem: {
                    id: course.id,
                    type: "course",
                    title: course.title,
                    subjectDomain: course.category || "General",
                    description: course.description || "",
                  }}}
                  className="btn-primary mt-4 w-full text-xs py-2"
                >
                  Review Course
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default ReviewerQueue;

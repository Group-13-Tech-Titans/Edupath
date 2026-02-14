import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const ReviewerQueue = () => {
  const { currentUser, courses } = useApp();
  const [filterTag, setFilterTag] = useState("mine");

  const pending = useMemo(
    () => courses.filter((c) => c.status === "pending"),
    [courses]
  );

  const filtered = pending.filter((c) => {
    if (filterTag === "all") return true;
    if (!currentUser?.specializationTag) return true;
    return c.specializationTag === currentUser.specializationTag;
  });

  return (
    <PageShell>
      <div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-dark">Review queue</h1>
            <p className="text-xs text-muted">
              Only pending courses are shown here. Filter by your specialization tag.
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setFilterTag("mine")}
              className={`rounded-full px-4 py-1 ${
                filterTag === "mine"
                  ? "bg-primary text-white"
                  : "bg-white/80 text-muted hover:bg-white"
              }`}
            >
              My specialization
            </button>
            <button
              onClick={() => setFilterTag("all")}
              className={`rounded-full px-4 py-1 ${
                filterTag === "all"
                  ? "bg-primary text-white"
                  : "bg-white/80 text-muted hover:bg-white"
              }`}
            >
              All pending
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="glass-card flex flex-col p-4 text-xs transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <p className="text-muted">{course.category}</p>
              <h3 className="mt-1 text-sm font-semibold text-text-dark">
                {course.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-muted">{course.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="rounded-full bg-primary/5 px-3 py-1 text-[11px] text-primary">
                  {course.specializationTag}
                </span>
              </div>
              <Link
                to={`/reviewer/queue/${course.id}`}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-text-dark px-4 py-2 text-[11px] font-medium text-white hover:bg-text-dark/90"
              >
                Open review
              </Link>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted">
              No pending courses for your current filter.
            </p>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default ReviewerQueue;


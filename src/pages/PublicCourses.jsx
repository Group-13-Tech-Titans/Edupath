import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import { useApp } from "../context/AppProvider.jsx";

const PublicCourses = () => {
  const { courses } = useApp();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const approvedCourses = useMemo(
    () => courses.filter((c) => c.status === "approved"),
    [courses]
  );

  const filtered = approvedCourses.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !category || c.category === category;
    return matchSearch && matchCategory;
  });

  const categories = Array.from(new Set(approvedCourses.map((c) => c.category)));

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-dark">Explore courses</h1>
            <p className="text-xs text-muted">
              Browse approved courses. Sign in as a student to enroll.
            </p>
          </div>
          <Link to="/login" className="btn-outline text-xs">
            Sign in to start learning
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            className="flex-1 rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring md:w-56"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="glass-card flex flex-col p-4 transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {course.category}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-text-dark">
                {course.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-xs text-muted">
                {course.description}
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
                <span>Level: {course.level}</span>
                <span>Rating: {course.rating.toFixed(1)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
                <span>By {course.educatorName}</span>
              </div>
              <Link
                to="/login"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-text-dark px-4 py-2 text-xs font-medium text-white hover:bg-text-dark/90"
              >
                View as student
              </Link>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted">
              No approved courses match your filters yet.
            </p>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default PublicCourses;


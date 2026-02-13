import React from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const StudentCourses = () => {
  const { courses } = useApp();
  const approved = courses.filter((c) => c.status === "approved");

  return (
    <PageShell>
      <div>
        <h1 className="text-xl font-semibold text-text-dark">My Courses</h1>
        <p className="text-xs text-muted">
          Explore approved courses and continue your learning path.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {approved.map((course) => (
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
              <Link
                to={`/student/courses/${course.id}`}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-text-dark px-4 py-2 text-xs font-medium text-white hover:bg-text-dark/90"
              >
                View course
              </Link>
            </div>
          ))}
          {approved.length === 0 && (
            <p className="text-sm text-muted">
              No approved courses yet. Check back soon.
            </p>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default StudentCourses;


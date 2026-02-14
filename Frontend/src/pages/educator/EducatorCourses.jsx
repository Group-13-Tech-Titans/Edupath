import React from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const EducatorCourses = () => {
  const { currentUser, courses } = useApp();
  const myCourses = courses.filter(
    (c) => c.createdByEducatorEmail === currentUser?.email
  );

  return (
    <PageShell>
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-text-dark">My courses</h1>
            <p className="text-xs text-muted">
              Manage your courses, edit details, and add content.
            </p>
          </div>
          <Link to="/educator/publish" className="btn-primary text-xs">
            + Create course
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myCourses.map((course) => (
            <div
              key={course.id}
              className="glass-card flex flex-col p-4 text-xs transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <p className="text-muted">{course.category}</p>
              <h3 className="mt-1 text-sm font-semibold text-text-dark">
                {course.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-muted">{course.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                    course.status === "approved"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : course.status === "pending"
                      ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {course.status}
                </span>
                <div className="flex gap-2">
                  <Link
                    to={`/educator/edit/${course.id}`}
                    className="rounded-full border border-primary px-3 py-1 text-[11px] text-primary hover:bg-primary/5"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/educator/add-content/${course.id}`}
                    className="rounded-full border border-text-dark px-3 py-1 text-[11px] text-text-dark hover:bg-text-dark/5"
                  >
                    Add content
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {myCourses.length === 0 && (
            <p className="text-sm text-muted">
              You don&apos;t have any courses yet. Start by publishing a new one.
            </p>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default EducatorCourses;


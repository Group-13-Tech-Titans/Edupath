import React from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const StudentDashboard = () => {
  const { currentUser, courses, lessonProgress } = useApp();
  const email = currentUser?.email;
  const progress = lessonProgress[email] || {};
  const approvedCourses = courses.filter((c) => c.status === "approved");

  const completedCount = Object.values(progress).reduce(
    (acc, lessons) => acc + (lessons ? lessons.length : 0),
    0
  );

  return (
    <PageShell>
      <div className="space-y-5">
        <div className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Welcome back
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-text-dark">
            {currentUser?.name || "Student"}
          </h1>
          <p className="mt-2 text-xs text-muted">
            Keep your momentum going. Your study streak and progress are below.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-primary/5 px-4 py-3 text-xs">
              <p className="text-muted">Active courses</p>
              <p className="mt-1 text-xl font-semibold text-text-dark">
                {approvedCourses.length}
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/5 px-4 py-3 text-xs">
              <p className="text-muted">Lessons completed</p>
              <p className="mt-1 text-xl font-semibold text-text-dark">
                {completedCount}
              </p>
            </div>
            <div className="rounded-2xl bg-text-dark/90 px-4 py-3 text-xs text-white">
              <p>Study streak</p>
              <p className="mt-1 text-xl font-semibold">7 days</p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default StudentDashboard;


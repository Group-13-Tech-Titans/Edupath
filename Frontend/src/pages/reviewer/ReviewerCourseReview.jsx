import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const ReviewerCourseReview = () => {
  const { id } = useParams();
  const { courses, currentUser, approveCourse, rejectCourse } = useApp();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === id);
  const [notes, setNotes] = useState("");

  if (!course) {
    return (
      <PageShell>
        <p className="text-sm text-muted">Course not found.</p>
      </PageShell>
    );
  }

  const handleDecision = (decision) => {
    if (decision === "approved") {
      approveCourse(course.id, currentUser);
    } else {
      rejectCourse(course.id, currentUser, notes);
    }
    navigate("/reviewer/queue");
  };

  return (
    <PageShell>
      <div className="space-y-4">
        <div className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {course.category}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-text-dark">{course.title}</h1>
          <p className="mt-1 text-xs text-muted">
            Educator: {course.educatorName} · Tag: {course.specializationTag}
          </p>
          <p className="mt-2 text-xs text-muted">{course.description}</p>
        </div>
        <div className="glass-card p-5 text-xs">
          <h2 className="text-sm font-semibold text-text-dark">Course content</h2>
          <div className="mt-3 space-y-3">
            {course.content?.modules?.map((m) => (
              <div key={m.id} className="rounded-2xl bg-primary/5 p-3">
                <p className="font-medium text-text-dark">{m.title}</p>
                <ul className="mt-2 space-y-1">
                  {m.lessons?.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="rounded-2xl bg-white/80 px-3 py-2 text-[11px]"
                    >
                      <p className="font-medium text-text-dark">{lesson.title}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-muted">
                        {lesson.materials?.map((mat) => (
                          <span
                            key={mat.title}
                            className="rounded-full bg-primary/5 px-2 py-0.5"
                          >
                            {mat.type.toUpperCase()} · {mat.title}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {(!course.content?.modules || course.content.modules.length === 0) && (
              <p className="text-muted">No content added yet.</p>
            )}
          </div>
        </div>
        <div className="glass-card p-5 text-xs">
          <h2 className="text-sm font-semibold text-text-dark">
            Decision &amp; review notes
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Optional: add notes for the educator (e.g., improve audio in Module 2, clarify quiz explanations)."
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => handleDecision("approved")}
              className="rounded-full bg-emerald-500 px-4 py-2 text-[11px] font-medium text-white hover:bg-emerald-600"
            >
              Approve course
            </button>
            <button
              onClick={() => handleDecision("rejected")}
              className="rounded-full bg-red-500 px-4 py-2 text-[11px] font-medium text-white hover:bg-red-600"
            >
              Reject / request changes
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default ReviewerCourseReview;


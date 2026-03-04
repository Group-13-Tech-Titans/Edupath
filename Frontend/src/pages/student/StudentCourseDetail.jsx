import React from "react";
import { useParams } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const StudentCourseDetail = () => {
  const { id } = useParams();
  const { courses, currentUser, lessonProgress, markLessonCompleted } = useApp();
  const course = courses.find((c) => c.id === id);
  const email = currentUser?.email;
  const userProgress = (lessonProgress[email] || {})[id] || [];

  if (!course) {
    return (
      <PageShell>
        <p className="text-sm text-muted">Course not found.</p>
      </PageShell>
    );
  }

  const handleToggleLesson = (lessonId) => {
    if (!email) return;
    if (!userProgress.includes(lessonId)) {
      markLessonCompleted(email, id, lessonId);
    }
  };

  return (
    <PageShell>
      <div className="space-y-4">
        <div className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {course.category}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-text-dark">{course.title}</h1>
          <p className="mt-2 text-xs text-muted">{course.description}</p>
        </div>
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-text-dark">Course content</h2>
          <div className="mt-3 space-y-4">
            {course.content?.modules?.map((m) => (
              <div key={m.id} className="rounded-2xl bg-primary/5 p-3">
                <p className="text-xs font-semibold text-text-dark">{m.title}</p>
                <div className="mt-2 space-y-2">
                  {m.lessons?.map((lesson) => {
                    const completed = userProgress.includes(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-start justify-between rounded-2xl bg-white/70 px-3 py-2 text-xs"
                      >
                        <div>
                          <p className="font-medium text-text-dark">{lesson.title}</p>
                          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted">
                            {lesson.materials?.map((mat) => (
                              <span
                                key={mat.title}
                                className="rounded-full bg-primary/5 px-2 py-0.5"
                              >
                                {mat.type.toUpperCase()} · {mat.title}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleLesson(lesson.id)}
                          className={`ml-3 rounded-full px-3 py-1 text-[11px] font-medium ${
                            completed
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "border border-primary text-primary hover:bg-primary/5"
                          }`}
                        >
                          {completed ? "Completed" : "Mark done"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default StudentCourseDetail;


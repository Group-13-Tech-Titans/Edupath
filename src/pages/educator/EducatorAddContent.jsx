import React, { useState } from "react";
import { useParams } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const tabs = [
  { id: "video", label: "Video" },
  { id: "pdfppt", label: "PDF/PPT" },
  { id: "quiz", label: "Quiz" }
];

const EducatorAddContent = () => {
  const { id } = useParams();
  const { courses, updateCourse } = useApp();
  const course = courses.find((c) => c.id === id);
  const [activeTab, setActiveTab] = useState("video");
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [meta, setMeta] = useState("");

  if (!course) {
    return (
      <PageShell>
        <p className="text-sm text-muted">Course not found.</p>
      </PageShell>
    );
  }

  const handleAddContent = (e) => {
    e.preventDefault();
    if (!moduleTitle || !lessonTitle) return;
    const modules = course.content?.modules ? [...course.content.modules] : [];
    let module = modules.find((m) => m.title === moduleTitle);
    if (!module) {
      module = {
        id: `m-${Date.now()}`,
        title: moduleTitle,
        lessons: []
      };
      modules.push(module);
    }
    const lesson = {
      id: `l-${Date.now()}`,
      title: lessonTitle,
      materials: [
        {
          type: activeTab === "video" ? "video" : activeTab === "quiz" ? "quiz" : "pdf",
          title:
            activeTab === "video"
              ? "Video lesson"
              : activeTab === "quiz"
              ? "Quiz"
              : "Document",
          url: meta || "#"
        }
      ]
    };
    module.lessons.push(lesson);
    updateCourse(id, {
      content: { modules }
    });
    setLessonTitle("");
    setMeta("");
  };

  return (
    <PageShell>
      <div className="glass-card max-w-2xl p-5 text-xs">
        <h1 className="text-xl font-semibold text-text-dark">Add course content</h1>
        <p className="mt-1 text-muted">
          Select a content type and fill basic details. This demo stores items locally.
        </p>
        <div className="mt-4 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-1 text-xs font-medium ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-white/80 text-muted hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleAddContent} className="mt-4 space-y-3">
          <div>
            <label className="font-medium">Module title</label>
            <input
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              placeholder="Eg: Module 01 - Basics"
              required
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
            />
          </div>
          <div>
            <label className="font-medium">Lesson title</label>
            <input
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="Eg: Intro to Python data types"
              required
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
            />
          </div>
          <div>
            <label className="font-medium">
              {activeTab === "video"
                ? "Video URL (optional)"
                : activeTab === "quiz"
                ? "Quiz notes / URL (optional)"
                : "File URL (mock)"}
            </label>
            <input
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Add content item
          </button>
        </form>
        <div className="mt-5 rounded-2xl bg-primary/5 p-3">
          <p className="text-[11px] font-medium text-text-dark">
            Current content (demo summary)
          </p>
          <ul className="mt-2 space-y-1 text-[11px] text-muted">
            {course.content?.modules?.map((m) => (
              <li key={m.id}>
                <span className="font-semibold text-text-dark">{m.title}</span> —{" "}
                {m.lessons?.length || 0} lessons
              </li>
            ))}
            {(!course.content?.modules || course.content.modules.length === 0) && (
              <li>No content added yet.</li>
            )}
          </ul>
        </div>
      </div>
    </PageShell>
  );
};

export default EducatorAddContent;


import React, { useState, useMemo } from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const contentTypes = [
  { id: "video", label: "Video", icon: "▶" },
  { id: "pdfppt", label: "PDF/PPT", icon: "📄" },
  { id: "quiz", label: "Quiz", icon: "📝" }
];

const MentorShareResource = () => {
  const { currentUser, assignedStudents, users, addSharedResource } = useApp();
  const [activeType, setActiveType] = useState("video");
  const [form, setForm] = useState({
    studentEmail: "",
    title: "",
    section: "",
    description: "",
    url: "",
    notes: ""
  });

  const mentorEmail = currentUser?.email;
  const myAssigned = useMemo(
    () => assignedStudents.filter((a) => a.mentorEmail === mentorEmail),
    [assignedStudents, mentorEmail]
  );

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.studentEmail) return;
    addSharedResource({
      mentorEmail,
      studentEmail: form.studentEmail,
      type: activeType,
      title: form.title.trim(),
      section: form.section || null,
      description: form.description || null,
      url: form.url || null,
      notes: form.notes || null,
      createdAt: new Date().toISOString()
    });
    setForm({
      studentEmail: "",
      title: "",
      section: "",
      description: "",
      url: "",
      notes: ""
    });
  };

  return (
    <PageShell>
      <div className="glass-card max-w-2xl p-5">
        <h1 className="text-xl font-semibold text-text-dark">Share resource</h1>
        <p className="mt-1 text-xs text-muted">
          Select content type and fill details. Students can use these to enhance their knowledge.
        </p>

        <div className="mt-4 flex gap-2">
          {contentTypes.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveType(tab.id)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-medium transition ${
                activeType === tab.id
                  ? "bg-primary text-white"
                  : "bg-white/80 text-muted border border-black/10 hover:bg-white"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="font-medium">Share with student</label>
            <select
              name="studentEmail"
              value={form.studentEmail}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
            >
              <option value="">Select student</option>
              {myAssigned.map((a) => {
                const u = users.find((x) => x.email === a.studentEmail);
                return (
                  <option key={a.id} value={a.studentEmail}>
                    {u?.name || a.studentEmail}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="font-medium">Content title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Python data types, Resume tips"
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
            />
          </div>
          <div>
            <label className="font-medium">Section / module (optional)</label>
            <input
              name="section"
              value={form.section}
              onChange={handleChange}
              placeholder="e.g. Module 01 – Basics"
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
            />
          </div>
          <div>
            <label className="font-medium">Description (optional)</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              placeholder="Short note about this resource..."
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
            />
          </div>
          {(activeType === "video" || activeType === "pdfppt") && (
            <div>
              <label className="font-medium">URL (optional)</label>
              <input
                name="url"
                value={form.url}
                onChange={handleChange}
                type="url"
                placeholder="https://..."
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
              />
            </div>
          )}
          <div>
            <label className="font-medium">Notes for student (optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary text-xs">
              Share resource
            </button>
            <button
              type="button"
              onClick={() =>
                setForm({
                  studentEmail: "",
                  title: "",
                  section: "",
                  description: "",
                  url: "",
                  notes: ""
                })
              }
              className="btn-outline text-xs"
            >
              Reset
            </button>
          </div>
        </form>

        {myAssigned.length === 0 && (
          <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
            You have no assigned students yet. Resources can be shared once students are assigned to you.
          </p>
        )}
      </div>
    </PageShell>
  );
};

export default MentorShareResource;

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const EducatorEditCourse = () => {
  const { id } = useParams();
  const { courses, updateCourse } = useApp();
  const course = courses.find((c) => c.id === id);
  const navigate = useNavigate();

  const [form, setForm] = useState(() =>
    course
      ? {
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level
        }
      : { title: "", description: "", category: "", level: "Beginner" }
  );

  if (!course) {
    return (
      <PageShell>
        <p className="text-sm text-muted">Course not found.</p>
      </PageShell>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateCourse(id, form);
    navigate("/educator/courses");
  };

  return (
    <PageShell>
      <div className="glass-card max-w-xl p-5 text-xs">
        <h1 className="text-xl font-semibold text-text-dark">Edit course</h1>
        <p className="mt-1 text-muted">
          Update the basic details. Content can be managed from the &quot;Add
          content&quot; page.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="font-medium">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
            />
          </div>
          <div>
            <label className="font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              required
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
            />
          </div>
          <div>
            <label className="font-medium">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
            />
          </div>
          <div>
            <label className="font-medium">Level</label>
            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">
            Save changes
          </button>
        </form>
      </div>
    </PageShell>
  );
};

export default EducatorEditCourse;


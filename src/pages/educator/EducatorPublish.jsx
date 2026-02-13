import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const EducatorPublish = () => {
  const { currentUser, users, createCourse } = useApp();
  const educator = users.find((u) => u.email === currentUser?.email);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "Beginner",
    price: "",
    specializationTag: educator?.specializationTag || ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (educator?.status !== "VERIFIED") {
      setError("Your educator profile must be verified before publishing.");
      return;
    }
    const course = createCourse({
      ...form,
      rating: 0,
      educatorName: educator?.name || "Educator",
      createdByEducatorEmail: currentUser?.email,
      content: {
        modules: []
      }
    });
    navigate(`/educator/edit/${course.id}`);
  };

  return (
    <PageShell>
      <div className="glass-card p-5">
        <h1 className="text-xl font-semibold text-text-dark">Publish new course</h1>
        <p className="mt-1 text-xs text-muted">
          Create a course draft. It will appear in the reviewer queue as{" "}
          <span className="font-semibold text-yellow-700">pending</span>.
        </p>
        {educator?.status !== "VERIFIED" && (
          <div className="mt-3 rounded-2xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
            Publishing is disabled until an admin verifies your educator profile.
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 text-xs">
          <div className="md:col-span-2">
            <label className="font-medium">Course title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              disabled={educator?.status !== "VERIFIED"}
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>
          <div className="md:col-span-2">
            <label className="font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              required
              disabled={educator?.status !== "VERIFIED"}
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="font-medium">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              disabled={educator?.status !== "VERIFIED"}
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="font-medium">Level</label>
            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              required
              disabled={educator?.status !== "VERIFIED"}
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div>
            <label className="font-medium">Price (mock)</label>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Eg 5000"
              disabled={educator?.status !== "VERIFIED"}
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="font-medium">Specialization tag</label>
            <input
              name="specializationTag"
              value={form.specializationTag}
              onChange={handleChange}
              placeholder="e.g. web-dev, data-science"
              required
              disabled={educator?.status !== "VERIFIED"}
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>
          {error && (
            <div className="md:col-span-2">
              <p className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            </div>
          )}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={educator?.status !== "VERIFIED"}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save draft &amp; send for review
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
};

export default EducatorPublish;


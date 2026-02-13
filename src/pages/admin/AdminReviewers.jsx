import React, { useState } from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const AdminReviewers = () => {
  const { reviewerAccounts, createReviewer } = useApp();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specializationTag: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = createReviewer(form);
    if (!res.success) {
      setError(res.message || "Unable to create reviewer");
      setSuccess("");
    } else {
      setError("");
      setSuccess("Reviewer account created");
      setForm({ name: "", email: "", password: "", specializationTag: "" });
    }
  };

  return (
    <PageShell>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="glass-card p-5 text-xs">
          <h1 className="text-xl font-semibold text-text-dark">Reviewer accounts</h1>
          <p className="mt-1 text-muted">
            Create reviewer logins. They will use the same login page.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="font-medium">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
              />
            </div>
            <div>
              <label className="font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
              />
            </div>
            <div>
              <label className="font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
              />
            </div>
            <div>
              <label className="font-medium">Specialization tag</label>
              <input
                name="specializationTag"
                value={form.specializationTag}
                onChange={handleChange}
                placeholder="Eg: web-dev, data-science"
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
              />
            </div>
            {error && (
              <p className="rounded-2xl bg-red-50 px-3 py-2 text-[11px] text-red-600">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
                {success}
              </p>
            )}
            <button type="submit" className="btn-primary w-full">
              Create reviewer
            </button>
          </form>
        </div>
        <div className="glass-card p-5 text-xs">
          <h2 className="text-sm font-semibold text-text-dark">Existing reviewers</h2>
          <ul className="mt-3 space-y-2">
            {reviewerAccounts.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-2xl bg-white/80 px-3 py-2"
              >
                <div>
                  <p className="font-medium text-text-dark">{r.name}</p>
                  <p className="text-[11px] text-muted">{r.email}</p>
                </div>
                <span className="rounded-full bg-primary/5 px-3 py-1 text-[11px] text-primary">
                  {r.specializationTag}
                </span>
              </li>
            ))}
            {reviewerAccounts.length === 0 && (
              <li className="text-muted">No reviewer accounts yet.</li>
            )}
          </ul>
        </div>
      </div>
    </PageShell>
  );
};

export default AdminReviewers;


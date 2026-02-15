// src/pages/admin/AdminReviewers.jsx
import React, { useEffect, useMemo, useState } from "react";

const LS_KEY = "edupath_reviewers_v1";

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function AdminReviewers() {
  const [reviewers, setReviewers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specializationTag: "",
  });

  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Load reviewers
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    setReviewers(stored);
  }, []);

  // Save reviewers
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(reviewers));
  }, [reviewers]);

  // Search filter
  const filteredReviewers = useMemo(() => {
    return reviewers.filter((r) =>
      `${r.name} ${r.email} ${r.specializationTag}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [reviewers, search]);

  // Form handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required!");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const exists = reviewers.some((r) => r.email === form.email);
    if (exists) {
      setError("Reviewer email already exists.");
      return;
    }

    const newReviewer = {
      id: Date.now(),
      name: form.name,
      email: form.email,
      specializationTag: form.specializationTag || "data",
    };

    setReviewers([newReviewer, ...reviewers]);

    setSuccess("Reviewer account created ✅");

    setForm({
      name: "",
      email: "",
      password: "",
      specializationTag: "",
    });
  };

  return (
    <div className="min-h-screen from-emerald-50 to-white px-5 py-3 text-size-sm">
      <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-2">
        
        <div className="rounded-[30px] bg-white/70 shadow-xl p-10 ring-1 ring-emerald-100">
          <h2 className="text-2xl font-bold text-slate-900">
            Create Reviewer
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Fill the form and create a new reviewer login.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Name */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Eg: Nuwan Silva"
                className="mt-2 w-full rounded-full border px-5 py-4 outline-none focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="reviewer@edupath.com"
                className="mt-2 w-full rounded-full border px-5 py-4 outline-none focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full rounded-full border px-5 py-4 outline-none focus:ring-4 focus:ring-emerald-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-4 text-slate-400 hover:text-slate-600"
                >
                  👁
                </button>
              </div>
            </div>

            {/* Tag */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Specialization Tag
              </label>
              <input
                name="specializationTag"
                value={form.specializationTag}
                onChange={handleChange}
                placeholder="Eg: web-dev, ui-ux, data-science"
                className="mt-2 w-full rounded-full border px-5 py-4 outline-none focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            {/* Alerts */}
            {error && (
              <p className="text-sm text-red-500 font-semibold">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600 font-semibold">{success}</p>
            )}

            {/* Button */}
            <button
              type="submit"
              className="w-full rounded-full bg-emerald-500 py-4 font-bold text-white shadow-md hover:bg-emerald-600 transition"
            >
              Create reviewer
            </button>

            <p className="text-xs text-slate-500 mt-3">
              Tip: Use specialization tags to assign reviewers for specific
              course categories.
            </p>
          </form>
        </div>

        {/* RIGHT LIST */}
        <div className="rounded-[30px] bg-white/70 shadow-xl p-10 ring-1 ring-emerald-100">
          <h2 className="text-xl font-bold text-slate-900">
            Existing reviewers
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Search and view created reviewer accounts.
          </p>

          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviewers..."
            className="mt-5 w-full rounded-full border px-5 py-4 outline-none focus:ring-4 focus:ring-emerald-100"
          />

          {/* Reviewer List */}
          <div className="mt-6 space-y-4">
            {filteredReviewers.length === 0 && (
              <p className="text-sm text-slate-400">
                No reviewers found...
              </p>
            )}

            {filteredReviewers.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-2xl border bg-white px-5 py-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
                    {getInitials(r.name)}
                  </div>

                  {/* Info */}
                  <div>
                    <p className="font-semibold text-slate-800">{r.name}</p>
                    <p className="text-sm text-slate-500">{r.email}</p>
                  </div>
                </div>

                {/* Tag */}
                <span className="rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold text-emerald-700">
                  {r.specializationTag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

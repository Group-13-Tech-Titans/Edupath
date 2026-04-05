import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminFooter from "./AdminFooter.jsx";



//add update delete reviewer accounts
const API_BASE = "http://localhost:5000/api/reviewers";

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "R";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function AdminReviewers() {
  const [reviewers, setReviewers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    expertise: "",
  });
  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch reviewers from database
  const fetchReviewers = async () => {
    try {
      const res = await axios.get(API_BASE);
      setReviewers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch reviewers");
    }
  };

  useEffect(() => {
    fetchReviewers();
  }, []);

  // Form handler
  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password || !form.expertise) {
      setError("All fields are required!");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      const res = await axios.post(API_BASE, form);
      setReviewers((prev) => [res.data, ...prev]);
      setSuccess("Reviewer account created ✅");

      setForm({
        name: "",
        email: "",
        password: "",
        expertise: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create reviewer");
    }
  };

  const filteredReviewers = reviewers.filter((r) =>
    `${r.name} ${r.email} ${r.expertise}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen from-emerald-50 to-white px-4 py-4">
      <div className="mx-auto max-w-6xl grid gap-5 lg:grid-cols-2">
        {/* Create Reviewer Form */}
        <div className="rounded-[26px] bg-white/80 shadow-lg p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-bold text-slate-900">Create Reviewer</h2>
          <p className="text-sm text-slate-500 mt-1">
            Fill the form and create a new reviewer login.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            <div>
              <label className="text-sm font-semibold text-slate-700">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Eg: Nuwan Silva"
                className="mt-2 w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="reviewer@edupath.com"
                className="mt-2 w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  👁
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Expertise
              </label>
              <input
                name="expertise"
                value={form.expertise}
                onChange={handleChange}
                placeholder="Eg: web-dev, ui-ux, data-science"
                className="mt-2 w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-emerald-500 py-3 font-bold text-white shadow-md hover:bg-emerald-600 transition"
            >
              Create reviewer
            </button>
          </form>
        </div>

        {/* Existing Reviewers List */}
        <div className="rounded-[26px] bg-white/80 shadow-lg p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-bold text-slate-900">Existing reviewers</h2>
          <p className="text-sm text-slate-500 mt-1">
            Search and view created reviewer accounts.
          </p>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviewers..."
            className="mt-4 w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
          />

          <div className="mt-4 space-y-3 lg:max-h-[520px] lg:overflow-y-auto pr-1">
            {filteredReviewers.length === 0 && (
              <p className="text-sm text-slate-400">No reviewers found...</p>
            )}

            {filteredReviewers.map((r) => (
              <div
                key={r._id || r.id}
                className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm shrink-0">
                    {getInitials(r.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate text-sm">{r.name}</p>
                    <p className="text-sm text-slate-500 truncate">{r.email}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {r.expertise}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <br />
      <AdminFooter />
    </div>
  );
}
import React, { useMemo, useState } from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import AdminFooter from "./AdminFooter.jsx";

const AdminReviewers = () => {
  const { reviewerAccounts = [], createReviewer } = useApp();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specializationTag: "",
  });

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = createReviewer(form);

    if (!res?.success) {
      setError(res?.message || "Unable to create reviewer");
      return;
    }

    setSuccess("Reviewer account created successfully ");
    setForm({ name: "", email: "", password: "", specializationTag: "" });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviewerAccounts;
    return reviewerAccounts.filter((r) => {
      const hay = `${r.name || ""} ${r.email || ""} ${r.specializationTag || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [reviewerAccounts, search]);

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-text-dark">Create Reviewer</h1>
              <p className="mt-1 text-xs text-muted">
                Add reviewer accounts to approve or reject course submissions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Pill label={`Total reviewers: ${reviewerAccounts.length}`} />
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
            <h2 className="text-base font-semibold text-text-dark">Create   Reviewer </h2>
            <p className="mt-1 text-xs text-muted">
              Fill the form and create a new reviewer login.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <Field label="Name">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Eg: Nuwan Silva"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="reviewer@edupath.com"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Password">
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Specialization tag">
                <input
                  name="specializationTag"
                  value={form.specializationTag}
                  onChange={handleChange}
                  placeholder="Eg: web-dev, ui-ux, data-science"
                  required
                  className={inputClass}
                />
              </Field>

              {error && (
                <p className="rounded-2xl border border-red-200 bg-red-50/70 px-3 py-2 text-xs font-semibold text-red-600">
                  {error}
                </p>
              )}

              {success && (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs font-semibold text-emerald-700">
                  {success}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow hover:brightness-95"
              >
                Create reviewer
              </button>

              <p className="text-[11px] text-muted">
                Tip: Use specialization tags to assign reviewers for specific course categories.
              </p>
            </form>
          </div>

          
          <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-text-dark">Existing reviewers</h2>
                <p className="mt-1 text-xs text-muted">
                  Search and view created reviewer accounts.
                </p>
              </div>

              <div className="w-full sm:w-64">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reviewers..."
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-3 rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar name={r.name || r.email} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-dark">
                        {r.name || "Reviewer"}
                      </p>
                      <p className="truncate text-xs text-muted">{r.email}</p>
                    </div>
                  </div>

                  <span className="w-fit rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                    {r.specializationTag || "general"}
                  </span>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="rounded-2xl border border-black/5 bg-white/60 p-4 text-sm text-muted">
                  No reviewer accounts found.
                </div>
              )}
            </div>
          </div>
        </div>

        <AdminFooter />
      </div>
    </PageShell>
  );
};


const inputClass =
  "mt-1 w-full rounded-full border border-black/10 bg-white/80 px-4 py-2.5 text-sm outline-none ring-primary/30 placeholder:text-gray-400 focus:border-emerald-300 focus:ring";

const Field = ({ label, children }) => (
  <div>
    <label className="text-xs font-semibold text-text-dark">{label}</label>
    {children}
  </div>
);

const Pill = ({ label }) => (
  <span className="rounded-full border border-black/5 bg-white/70 px-3 py-1 text-xs font-semibold text-text-dark">
    {label}
  </span>
);

const Avatar = ({ name }) => (
  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-sm">
    <div className="flex h-full w-full items-center justify-center text-sm font-extrabold text-primary">
      {getInitials(name)}
    </div>
  </div>
);

function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "R";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

export default AdminReviewers;

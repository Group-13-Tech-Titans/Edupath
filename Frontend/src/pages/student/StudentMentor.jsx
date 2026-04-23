import React, { useState } from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const StudentMentor = () => {
  const { currentUser, saveMentorRequest } = useApp();
  const [form, setForm] = useState({
    fullName: currentUser?.name || "",
    email: currentUser?.email || "",
    field: "",
    sessionType: "",
    date: "",
    time: "",
    duration: "",
    notes: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMentorRequest({ ...form, userEmail: currentUser?.email });
    setSubmitted(true);
  };

  return (
    <PageShell>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card p-5">
          <h1 className="text-xl font-semibold text-text-dark">
            Request a mentor session
          </h1>
          <p className="mt-1 text-xs text-muted">
            Choose your field, session type, and preferred time.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
            <div>
              <label className="font-medium">Full name</label>
              <input
                name="fullName"
                value={form.fullName}
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
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="font-medium">Field / specialization</label>
                <select
                  name="field"
                  value={form.field}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
                >
                  <option value="">Select</option>
                  <option>Web Development</option>
                  <option>Data Science</option>
                  <option>Design</option>
                  <option>Career Guidance</option>
                </select>
              </div>
              <div>
                <label className="font-medium">Session type</label>
                <select
                  name="sessionType"
                  value={form.sessionType}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
                >
                  <option value="">Select</option>
                  <option>Portfolio review</option>
                  <option>Mock interview</option>
                  <option>Career planning</option>
                </select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="font-medium">Preferred date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
                />
              </div>
              <div>
                <label className="font-medium">Preferred time</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
                />
              </div>
              <div>
                <label className="font-medium">Duration</label>
                <select
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
                >
                  <option value="">Select</option>
                  <option>30 min</option>
                  <option>60 min</option>
                </select>
              </div>
            </div>
            <div>
              <label className="font-medium">What do you need help with?</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
              />
            </div>
            <button type="submit" className="btn-primary w-full text-sm">
              Submit request
            </button>
            {submitted && (
              <p className="text-xs text-emerald-600">
                Request saved. A mentor will review it shortly. (Demo only)
              </p>
            )}
          </form>
        </div>
        <div className="glass-card p-5 text-xs">
          <p className="text-sm font-semibold text-text-dark">What happens next?</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
            <li>Mentor reviews your request and profile.</li>
            <li>You&apos;ll receive confirmation with meeting details.</li>
            <li>Join the call and bring your questions.</li>
          </ol>
          <div className="mt-4 rounded-2xl bg-primary/5 p-3">
            <p className="font-medium text-text-dark">Tip</p>
            <p className="mt-1 text-[11px] text-muted">
              The more context you provide, the better your mentor can prepare.
              Mention your current level, goals, and any blockers.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default StudentMentor;


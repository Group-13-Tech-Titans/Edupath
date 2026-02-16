import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminFooter from "./AdminFooter";

const mockCourses = [
  {
    id: "c1",
    title: "HTML + CSS Bootcamp",
    category: "Web Development",
    educator: "Alex Johnson",
    status: "pending",
    durationHrs: 22,
    videoCount: 12,
    fileCount: 4,
    quizCount: 2,
    description:
      "Beginner friendly course that teaches core web skills step-by-step with practical exercises and quizzes.",
    checklist: [
      "Video/audio quality is clear",
      "Original content (no copyright issues)",
      "Lessons are structured and consistent",
      "Quizzes include answers/explanations",
    ],
  },
  {
    id: "c2",
    title: "JavaScript Essentials",
    category: "Web Development",
    educator: "Maya Perera",
    status: "pending",
    durationHrs: 18,
    videoCount: 10,
    fileCount: 3,
    quizCount: 3,
    description:
      "Learn DOM, events, APIs, best practices, and hands-on exercises for real-world JavaScript development.",
    checklist: [
      "Examples are practical and modern",
      "No broken links/resources",
      "Consistent lesson naming",
      "Quiz difficulty matches lesson level",
    ],
  },
  {
    id: "c3",
    title: "Python for Data Analysis",
    category: "Data",
    educator: "Dr. Liam Chen",
    status: "approved",
    durationHrs: 24,
    videoCount: 14,
    fileCount: 5,
    quizCount: 2,
    description:
      "Work with Pandas, NumPy, charts, and real datasets to build strong data analysis foundations.",
    checklist: [
      "Datasets are provided or linked",
      "Code examples run correctly",
      "Visualizations are explained",
      "Exercises have expected outputs",
    ],
  },
];

const decisionOptions = [
  { value: "approve", label: "Approve" },
  { value: "minor", label: "Approve with minor changes" },
  { value: "major", label: "Approve with major changes" },
  { value: "reject", label: "Reject" },
];

const statusPill = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function AdminCourseRating() {
  const { id } = useParams();
  const navigate = useNavigate();

  const course = useMemo(
    () => mockCourses.find((c) => c.id === id) || mockCourses[0],
    [id]
  );

  const [decision, setDecision] = useState("approve");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const needsNotes = decision === "minor" || decision === "major" || decision === "reject";

  const handleSubmit = () => {
    setError("");
    setSuccess("");

    if (needsNotes && notes.trim().length < 10) {
      setError("Notes are required for Minor/Major changes or Reject (min 10 characters).");
      return;
    }
    if (rating === 0) {
      setError("Please give an admin rating (1–5).");
      return;
    }

    // ✅ Later: POST to backend
    // await axios.post(`/api/admin/courses/${id}/decision`, { decision, rating, notes })

    setSuccess("Decision published successfully ✅");
  };

  return (
    <div className="min-h-screen ">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Top Bar */}
        <div className="rounded-[30px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">Course Review</p>
              <h1 className="mt-1 truncate text-xl font-semibold text-slate-900">
                {course.title}
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Review details, rate the course, and publish your decision.
              </p>
            </div>

            <div className="flex items-center gap-2">
             
              <button
                className={`text-m font-semibold text-slate-900 rounded-full border px-3 py-1 bg-slate-100 hover:bg-slate-200`}
                onClick={() => navigate(`/coming-soon`)}
              >
                View course 
              </button>
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {/* LEFT: Summary */}
          <div className="lg:col-span-2 space-y-5">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <InfoCard label="Educator" value={course.educator} icon="👨‍🏫" />
              <InfoCard label="Subject" value={course.category} icon="📚" />
              <InfoCard
                label="Content Items"
                value={`Videos: ${course.videoCount} • Files: ${course.fileCount} • Quizzes: ${course.quizCount}`}
                icon="🧩"
              />
            </div>

            {/* Description */}
            <div className="rounded-[26px] border border-black/5 bg-white/70 p-5 shadow-[0_12px_34px_rgba(0,0,0,0.07)] backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-900">Course summary</h2>
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  ⏱ {course.durationHrs}h
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{course.description}</p>
            </div>

            {/* Checklist */}
            <div className="rounded-[26px] border border-black/5 bg-white/70 p-5 shadow-[0_12px_34px_rgba(0,0,0,0.07)] backdrop-blur">
              <h2 className="text-sm font-semibold text-slate-900">Checklist</h2>
              <p className="mt-1 text-xs text-slate-500">
                Use this quick list before approving or requesting changes.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {course.checklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded-2xl border border-black/5 bg-white/60 px-3 py-3"
                  >
                    <span className="mt-0.5">✅</span>
                    <p className="text-sm text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Decision + Rating */}
          <div className="space-y-5">
            <div className="rounded-[26px] border border-black/5 bg-white/70 p-5 shadow-[0_12px_34px_rgba(0,0,0,0.07)] backdrop-blur">
              <h2 className="text-sm font-semibold text-slate-900">Admin decision</h2>
              <p className="mt-1 text-xs text-slate-500">
                Choose decision, give rating, and leave notes for the educator.
              </p>

              {/* Decision */}
              <div className="mt-4">
                <label className="text-xs font-semibold text-slate-700">Decision</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  className={inputClass}
                >
                  {decisionOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-[11px] text-emerald-700">
                  Rule: Notes are required for Minor Changes, Major Changes, or Reject.
                </p>
              </div>

              {/* Rating */}
              <div className="mt-4">
                <label className="text-xs font-semibold text-slate-700">Admin rating (1–5)</label>
                <div className="mt-2 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={
                        n <= rating
                          ? "text-2xl leading-none"
                          : "text-2xl leading-none opacity-40 hover:opacity-70"
                      }
                      aria-label={`Rate ${n}`}
                      title={`Rate ${n}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {rating ? `${rating}/5` : "Not rated"}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4">
                <label className="text-xs font-semibold text-slate-700">
                  Notes to educator {needsNotes ? "(required)" : "(optional)"}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write clear notes (e.g., improve audio in Module 2, add quiz explanations, remove copyrighted uploads...)"
                  className={`${inputClass} min-h-[120px] rounded-xl`}
                />
              </div>

              {/* Alerts */}
              {error && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  {success}
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-full border border-black/10 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-white/70"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-full bg-emerald-500 px-6 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-600"
                >
                  Publish decision
                </button>
              </div>
            </div>

            
          </div>
        </div>
      </div>

      <AdminFooter />
    </div>
  );
}


function cap(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : "";
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="rounded-[22px] border border-black/5 bg-white/70 p-4 shadow-[0_10px_26px_rgba(0,0,0,0.06)] backdrop-blur">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <div className="mt-2 flex items-start gap-2">
        <span className="text-lg">{icon}</span>
        <p className="text-sm font-semibold text-slate-900 leading-snug">{value}</p>
      </div>
    </div>
  );
}

const inputClass =
  "mt-2 w-full rounded-full border border-black/10 bg-white/80 px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-emerald-100";

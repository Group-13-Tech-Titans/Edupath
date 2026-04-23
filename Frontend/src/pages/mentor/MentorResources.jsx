import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

// ── Mock data (replace with real API calls later) ──────────────
const MOCK_STUDENTS = [
  { id: "S001", name: "Priya Sharma", track: "Web Development" },
  { id: "S002", name: "Rahul Mehta", track: "Data Science & ML" },
  { id: "S003", name: "Anjali Kumar", track: "React & TypeScript" },
  { id: "S004", name: "Nimal Perera", track: "Networking" },
  { id: "S005", name: "Sahana Jayasinghe", track: "Web Development" },
  { id: "S006", name: "Kavindu Fernando", track: "Web Development" },
];

const MOCK_RESOURCES = [
  {
    id: "R001", title: "Advanced React Patterns Guide", type: "pdfppt",
    shareWith: "all", studentName: "All Students", courseGroup: null,
    description: "Covers custom hooks, render props, compound components.",
    url: "https://drive.google.com/example", notes: "Read before Friday session.",
    createdAt: "2026-04-10T10:00:00Z",
  },
  {
    id: "R002", title: "Python Data Types Tutorial", type: "video",
    shareWith: "specific", studentName: "Priya Sharma", courseGroup: null,
    description: "Great intro video covering lists, dicts, and sets.",
    url: "https://youtube.com/example", notes: "Watch all 3 parts.",
    createdAt: "2026-04-12T14:30:00Z",
  },
  {
    id: "R003", title: "CSS Flexbox & Grid Quiz", type: "quiz",
    shareWith: "all", studentName: "All Students", courseGroup: null,
    description: "Test your CSS layout knowledge.",
    url: null, notes: "Complete by next Monday.",
    createdAt: "2026-04-15T09:00:00Z",
  },
  {
    id: "R004", title: "ML Roadmap PDF", type: "pdfppt",
    shareWith: "specific", studentName: "Rahul Mehta", courseGroup: null,
    description: "Step-by-step ML learning plan.",
    url: "https://drive.google.com/example2", notes: "",
    createdAt: "2026-04-17T16:00:00Z",
  },
];

const TRACKS = [...new Set(MOCK_STUDENTS.map((s) => s.track))];

const TYPE_META = {
  video: { label: "Video", icon: <VideoIcon />, badge: "bg-sky-100 text-sky-800" },
  pdfppt: { label: "PDF / PPT", icon: <DocIcon />, badge: "bg-amber-100 text-amber-800" },
  quiz: { label: "Quiz", icon: <QuizIcon />, badge: "bg-purple-100 text-purple-800" },
};

const SHARE_META = {
  all: { label: "All Students", badge: "bg-emerald-100 text-emerald-800" },
  specific: { label: "Specific Student", badge: "bg-blue-100 text-blue-800" },
};

// ── Helpers ─────────────────────────────────────────────────────
function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Main Page ────────────────────────────────────────────────────
export default function MentorResources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState(MOCK_RESOURCES);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterShare, setFilterShare] = useState("all");
  const [search, setSearch] = useState("");
  const [detailRes, setDetailRes] = useState(null);

  // Form state
  const emptyForm = {
    shareWith: "all", studentId: "",
    type: "video", title: "", description: "", url: "", notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation — show message for each missing required field
    if (!form.title.trim()) {
      alert("Please enter a Resource Title.");
      return;
    }
    if (form.shareWith === "specific" && !form.studentId) {
      alert("Please select a Student to share with.");
      return;
    }
    if ((form.type === "video" || form.type === "pdfppt" || form.type === "quiz") && !form.url.trim()) {
      alert("Please enter a URL for this " + (form.type === "video" ? "Video" : form.type === "pdfppt" ? "PDF/PPT" : "Quiz") + " resource.");
      return;
    }

    const student = MOCK_STUDENTS.find((s) => s.id === form.studentId);

    const newResource = {
      id: "R" + Date.now(),
      title: form.title.trim(),
      type: form.type,
      shareWith: form.shareWith,
      studentName: form.shareWith === "specific" ? student?.name : null,
      courseGroup: null,
      description: form.description,
      url: form.url,
      notes: form.notes,
      createdAt: new Date().toISOString(),
    };

    setResources((prev) => [newResource, ...prev]);
    setForm(emptyForm);
    setModalOpen(false);
    alert("Resource shared successfully!");
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this resource?")) return;
    setResources((prev) => prev.filter((r) => r.id !== id));
    if (detailRes?.id === id) setDetailRes(null);
  };

  // Filtering
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return resources.filter((r) => {
      const typeOk = filterType === "all" || r.type === filterType;
      const shareOk = filterShare === "all" || r.shareWith === filterShare;
      const searchOk = !q || r.title.toLowerCase().includes(q) ||
        (r.studentName || "").toLowerCase().includes(q);
      return typeOk && shareOk && searchOk;
    });
  }, [resources, filterType, filterShare, search]);

  // Stats
  const stats = useMemo(() => ({
    total: resources.length,
    videos: resources.filter((r) => r.type === "video").length,
    docs: resources.filter((r) => r.type === "pdfppt").length,
    quizzes: resources.filter((r) => r.type === "quiz").length,
  }), [resources]);

  return (
    <>
      {/* ── Page Title + Share Button ───────────────────────────── */}
      <section className="mb-5 flex flex-col justify-between gap-4 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold">Resources</h1>
          <p className="mt-1 text-sm text-slate-500">Share learning materials with your students — videos, PDFs, or quizzes.</p>
        </div>
        <button
          type="button" onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-500 hover:-translate-y-[1px]"
        >
          <PlusIcon /> Share Resource
        </button>
      </section>

      {/* ── Stats Row ───────────────────────────────────────────── */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Shared", value: stats.total, accent: "border-teal-400" },
          { label: "Videos", value: stats.videos, accent: "border-sky-400" },
          { label: "PDFs / PPTs", value: stats.docs, accent: "border-amber-400" },
          { label: "Quizzes", value: stats.quizzes, accent: "border-purple-400" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-l-4 ${s.accent}`}>
            <div className="text-sm text-slate-500">{s.label}</div>
            <div className="mt-1 text-2xl font-extrabold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Main Content ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2.2fr_1fr]">

        {/* Resource List */}
        <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">

          {/* Toolbar */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-teal-400 focus-within:bg-white">
              <SearchIcon />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or student..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            {/* Type filter */}
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400">
              <option value="all">All Types</option>
              <option value="video">Video</option>
              <option value="pdfppt">PDF / PPT</option>
              <option value="quiz">Quiz</option>
            </select>

            {/* Share filter */}
            <select value={filterShare} onChange={(e) => setFilterShare(e.target.value)}
              className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400">
              <option value="all">All Students</option>
              <option value="specific">Specific Student</option>
            </select>

            {/* Reset */}
            <button type="button"
              onClick={() => { setSearch(""); setFilterType("all"); setFilterShare("all"); }}
              className="rounded-xl bg-emerald-100 px-4 py-2 text-sm font-bold text-teal-600 transition hover:bg-emerald-200">
              Reset
            </button>
          </div>

          {/* Resource Cards */}
          <div className="flex flex-col gap-3">
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                No resources found. Click "Share Resource" to add one!
              </div>
            ) : (
              filtered.map((r) => {
                const tm = TYPE_META[r.type] || TYPE_META.video;
                const sm = SHARE_META[r.shareWith] || SHARE_META.specific;
                return (
                  <div key={r.id}
                    className="flex flex-col gap-3 rounded-xl border border-black/5 bg-slate-50 p-4 transition hover:translate-x-1 hover:bg-emerald-50 border-l-4 border-l-teal-400 md:flex-row md:items-center">

                    {/* Type icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-500">
                      {tm.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-base font-extrabold">{r.title}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${tm.badge}`}>{tm.label}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${sm.badge}`}>
                          {r.shareWith === "specific" ? r.studentName : "All Students"}
                        </span>
                      </div>
                      {r.description && (
                        <p className="text-sm text-slate-500 line-clamp-1">{r.description}</p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">{timeAgo(r.createdAt)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 gap-2">
                      <button type="button" onClick={() => setDetailRes(r)}
                        className="rounded-lg bg-teal-400 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-teal-500">
                        View
                      </button>
                      {r.url && (
                        <a href={r.url} target="_blank" rel="noreferrer"
                          className="rounded-lg border-2 border-teal-400 bg-white px-3 py-2 text-xs font-extrabold text-teal-600 transition hover:bg-teal-400 hover:text-white">
                          Open
                        </a>
                      )}
                      <button type="button" onClick={() => handleDelete(r.id)}
                        className="rounded-lg border-2 border-red-200 bg-white px-3 py-2 text-xs font-extrabold text-red-400 transition hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 text-sm text-slate-500">
            Showing <span className="font-bold">{filtered.length}</span> resource(s)
          </div>
        </section>

        {/* Sidebar */}
        <aside className="flex flex-col gap-5">
          {/* Overview */}
          <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="mb-4 text-lg font-extrabold">Overview</div>
            {[
              { label: "Total Shared", value: stats.total, accent: "border-teal-400" },
              { label: "Videos", value: stats.videos, accent: "border-sky-400" },
              { label: "PDFs / PPTs", value: stats.docs, accent: "border-amber-400" },
              { label: "Quizzes", value: stats.quizzes, accent: "border-purple-400" },
            ].map((s) => (
              <div key={s.label} className={`mb-3 flex items-center justify-between rounded-xl border-l-4 ${s.accent} bg-slate-50 p-4`}>
                <div className="text-sm text-slate-500">{s.label}</div>
                <div className="text-lg font-extrabold">{s.value}</div>
              </div>
            ))}
          </section>

          {/* Tip */}
          <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="mb-2 text-sm font-extrabold">Tips</div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-slate-700">
              <strong>Share with All</strong> to send the same material to every student at once.
              Use <strong>Specific Student</strong> for personalised resources.
            </div>
          </section>

          {/* Quick share button */}
          <button type="button" onClick={() => setModalOpen(true)}
            className="w-full rounded-2xl bg-teal-400 py-4 text-sm font-extrabold text-white transition hover:bg-teal-500 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            + Share New Resource
          </button>
        </aside>
      </div>

      {/* ── Share Resource Modal ─────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-auto">

            <div className="mb-5 flex items-center justify-between border-b-2 border-slate-200 pb-4">
              <h2 className="text-xl font-extrabold">Share Learning Resource</h2>
              <button type="button" onClick={() => setModalOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 hover:bg-slate-200">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Share With</label>
                <select name="shareWith" value={form.shareWith} onChange={handleChange}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400">
                  <option value="all">All Students</option>
                  <option value="specific">Specific Student</option>
                </select>
              </div>

              {/* Specific student picker */}
              {form.shareWith === "specific" && (
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">Select Student</label>
                  <select name="studentId" value={form.studentId} onChange={handleChange} required
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400">
                    <option value="">Choose a student...</option>
                    {MOCK_STUDENTS.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} — {s.track}</option>
                    ))}
                  </select>
                </div>
              )}


              {/* Resource Type */}
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Resource Type</label>
                <div className="flex gap-2">
                  {[
                    { value: "video", label: "Video" },
                    { value: "pdfppt", label: "PDF / PPT" },
                    { value: "quiz", label: "Quiz" },
                  ].map((t) => (
                    <button key={t.value} type="button"
                      onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                      className={`flex-1 rounded-xl border-2 py-2 text-sm font-bold transition ${form.type === t.value
                          ? "border-teal-400 bg-teal-400 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"
                        }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Resource Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required
                  placeholder="e.g. Advanced React Patterns Guide"
                  className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400" />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Description <span className="font-normal text-slate-400">(optional)</span></label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                  placeholder="Brief description of this resource..."
                  className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 resize-none" />
              </div>

              {/* URL */}
              {(form.type === "video" || form.type === "pdfppt" || form.type === "quiz") && (
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">Resource URL {form.type === "quiz" ? "(Quiz Link)" : ""} <span className="font-normal text-red-400">*</span></label>
                  <input name="url" value={form.url} onChange={handleChange} type="url"
                    placeholder="https://..."
                    className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400" />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Notes for Student <span className="font-normal text-slate-400">(optional)</span></label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                  placeholder="Any extra instructions..."
                  className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 resize-none" />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 rounded-xl bg-teal-400 py-3 text-sm font-extrabold text-white transition hover:bg-teal-500">
                  Share Resource
                </button>
                <button type="button" onClick={() => { setForm(emptyForm); setModalOpen(false); }}
                  className="flex-1 rounded-xl border-2 border-slate-300 bg-white py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Detail Modal ─────────────────────────────────────────── */}
      {detailRes && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setDetailRes(null); }}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <h2 className="text-xl font-extrabold">Resource Details</h2>
              <button type="button" onClick={() => setDetailRes(null)}
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 hover:bg-slate-200">✕</button>
            </div>
            <div className="rounded-xl border border-black/5 bg-slate-50 p-4">
              {[
                { k: "Title", v: detailRes.title },
                { k: "Type", v: TYPE_META[detailRes.type]?.label },
                {
                  k: "Shared With", v: detailRes.shareWith === "specific" ? detailRes.studentName :
                    detailRes.shareWith === "group" ? detailRes.courseGroup : "All Students"
                },
                { k: "Description", v: detailRes.description || "—" },
                { k: "Notes", v: detailRes.notes || "—" },
                { k: "Shared", v: timeAgo(detailRes.createdAt) },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between gap-3 border-b border-slate-200 py-2 last:border-b-0">
                  <span className="text-sm text-slate-500">{k}</span>
                  <span className="text-sm font-extrabold text-slate-800 text-right">{v}</span>
                </div>
              ))}
              {detailRes.url && (
                <a href={detailRes.url} target="_blank" rel="noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-400 py-2.5 text-sm font-extrabold text-white transition hover:bg-teal-500">
                  Open Resource
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── SVG Icons ─────────────────────────────────────────────────── */
function PlusIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>;
}
function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>;
}
function VideoIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>;
}
function DocIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
}
function QuizIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>;
}

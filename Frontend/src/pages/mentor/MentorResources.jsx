import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

// ── Mock data (replace with real API calls later) ──────────────
const MOCK_STUDENTS = [
  { id: "S001", name: "Priya Sharma",      track: "Web Development" },
  { id: "S002", name: "Rahul Mehta",       track: "Data Science & ML" },
  { id: "S003", name: "Anjali Kumar",      track: "React & TypeScript" },
  { id: "S004", name: "Nimal Perera",      track: "Networking" },
  { id: "S005", name: "Sahana Jayasinghe", track: "Web Development" },
  { id: "S006", name: "Kavindu Fernando",  track: "Web Development" },
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
    shareWith: "group", studentName: null, courseGroup: "Web Development",
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
  video:  { label: "Video",        icon: <VideoIcon />,    badge: "bg-sky-100 text-sky-800" },
  pdfppt: { label: "PDF / PPT",    icon: <DocIcon />,      badge: "bg-amber-100 text-amber-800" },
  quiz:   { label: "Quiz",         icon: <QuizIcon />,     badge: "bg-purple-100 text-purple-800" },
};

const SHARE_META = {
  all:      { label: "All Students",      badge: "bg-emerald-100 text-emerald-800" },
  specific: { label: "Specific Student",  badge: "bg-blue-100 text-blue-800" },
  group:    { label: "Course Group",      badge: "bg-orange-100 text-orange-800" },
};

// ── Helpers ─────────────────────────────────────────────────────
function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Main Page ────────────────────────────────────────────────────
export default function MentorResources() {
  const navigate = useNavigate();
  const [resources, setResources]   = useState(MOCK_RESOURCES);
  const [modalOpen, setModalOpen]   = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterShare, setFilterShare] = useState("all");
  const [search, setSearch]         = useState("");
  const [detailRes, setDetailRes]   = useState(null);

  // Form state
  const emptyForm = {
    shareWith: "all", studentId: "", courseGroup: "",
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
    if (!form.title.trim()) return;

    const student = MOCK_STUDENTS.find((s) => s.id === form.studentId);

    const newResource = {
      id: "R" + Date.now(),
      title: form.title.trim(),
      type: form.type,
      shareWith: form.shareWith,
      studentName: form.shareWith === "specific" ? student?.name : null,
      courseGroup: form.shareWith === "group" ? form.courseGroup : null,
      description: form.description,
      url: form.url,
      notes: form.notes,
      createdAt: new Date().toISOString(),
    };

    setResources((prev) => [newResource, ...prev]);
    setForm(emptyForm);
    setModalOpen(false);
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
      const typeOk  = filterType  === "all" || r.type      === filterType;
      const shareOk = filterShare === "all" || r.shareWith === filterShare;
      const searchOk = !q || r.title.toLowerCase().includes(q) ||
        (r.studentName || "").toLowerCase().includes(q) ||
        (r.courseGroup  || "").toLowerCase().includes(q);
      return typeOk && shareOk && searchOk;
    });
  }, [resources, filterType, filterShare, search]);

  // Stats
  const stats = useMemo(() => ({
    total:   resources.length,
    videos:  resources.filter((r) => r.type === "video").length,
    docs:    resources.filter((r) => r.type === "pdfppt").length,
    quizzes: resources.filter((r) => r.type === "quiz").length,
  }), [resources]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-200 to-teal-300 p-5 text-slate-800">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="mb-5 flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <EduPathLogo />
          <span>EduPath</span>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
          <Link to="/MentorDashboard" className="font-medium text-slate-800 transition-colors hover:text-teal-500">Dashboard</Link>
          <Link to="/MentorStudents"  className="font-medium text-slate-800 transition-colors hover:text-teal-500">My Students</Link>
          <Link to="/MentorSessions"  className="font-medium text-slate-800 transition-colors hover:text-teal-500">Sessions</Link>
          <Link to="/MentorProfile"   className="font-medium text-slate-800 transition-colors hover:text-teal-500">Profile</Link>
          <Link to="/MentorResources" className="font-medium text-teal-500">Resources</Link>

        </nav>

        <div className="w-[150px] flex justify-end">
          <button
            type="button" onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
          >
            <LogoutIcon /> Logout
          </button>
        </div>
      </header>

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
          { label: "Total Shared",  value: stats.total,   accent: "border-teal-400" },
          { label: "Videos",        value: stats.videos,  accent: "border-sky-400" },
          { label: "PDFs / PPTs",   value: stats.docs,    accent: "border-amber-400" },
          { label: "Quizzes",       value: stats.quizzes, accent: "border-purple-400" },
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
              <option value="all">All Recipients</option>
              <option value="all">All Students</option>
              <option value="specific">Specific Student</option>
              <option value="group">Course Group</option>
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
                const tm = TYPE_META[r.type]  || TYPE_META.video;
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
                          {r.shareWith === "specific" ? r.studentName :
                           r.shareWith === "group"    ? r.courseGroup  : "All Students"}
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
              { label: "Total Shared",  value: stats.total,   accent: "border-teal-400" },
              { label: "Videos",        value: stats.videos,  accent: "border-sky-400" },
              { label: "PDFs / PPTs",   value: stats.docs,    accent: "border-amber-400" },
              { label: "Quizzes",       value: stats.quizzes, accent: "border-purple-400" },
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
              Use <strong>Course Group</strong> to target students on the same track.
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

              {/* Share With */}
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Share With</label>
                <select name="shareWith" value={form.shareWith} onChange={handleChange}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400">
                  <option value="all">All Students</option>
                  <option value="specific">Specific Student</option>
                  <option value="group">Specific Course Group</option>
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

              {/* Group picker */}
              {form.shareWith === "group" && (
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">Select Course Group</label>
                  <select name="courseGroup" value={form.courseGroup} onChange={handleChange} required
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400">
                    <option value="">Choose a group...</option>
                    {TRACKS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}

              {/* Resource Type */}
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Resource Type</label>
                <div className="flex gap-2">
                  {[
                    { value: "video",  label: "Video" },
                    { value: "pdfppt", label: "PDF / PPT" },
                    { value: "quiz",   label: "Quiz" },
                  ].map((t) => (
                    <button key={t.value} type="button"
                      onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                      className={`flex-1 rounded-xl border-2 py-2 text-sm font-bold transition ${
                        form.type === t.value
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
              {(form.type === "video" || form.type === "pdfppt") && (
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">Resource URL <span className="font-normal text-slate-400">(optional)</span></label>
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
                { k: "Title",       v: detailRes.title },
                { k: "Type",        v: TYPE_META[detailRes.type]?.label },
                { k: "Shared With", v: detailRes.shareWith === "specific" ? detailRes.studentName :
                                       detailRes.shareWith === "group" ? detailRes.courseGroup : "All Students" },
                { k: "Description", v: detailRes.description || "—" },
                { k: "Notes",       v: detailRes.notes || "—" },
                { k: "Shared",      v: timeAgo(detailRes.createdAt) },
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

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="mt-5 rounded-2xl bg-white px-7 py-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <div className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
                <EduPathLogo /><span>EduPath</span>
              </div>
              <p className="mb-4 text-sm leading-6 text-slate-700">
                Empowering learners worldwide with quality education and personalized learning paths.
              </p>
              <div className="flex gap-3">
                <SocialIcon><FacebookIcon /></SocialIcon>
                <SocialIcon><TwitterIcon /></SocialIcon>
                <SocialIcon><LinkedInIcon /></SocialIcon>
                <SocialIcon><InstagramIcon /></SocialIcon>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 md:gap-12">
              <FooterCol title="Quick Links" links={[{ label: "Mentor Guidelines", href: "#" }, { label: "Best Practices", href: "#" }, { label: "Resources", href: "#" }]} />
              <FooterCol title="Support"     links={[{ label: "Help Center", href: "#" }, { label: "Contact Us", href: "#" }, { label: "FAQs", href: "#" }]} />
              <FooterCol title="Legal"       links={[{ label: "Terms & Conditions", href: "#" }, { label: "Privacy Policy", href: "#" }, { label: "Cookie Policy", href: "#" }]} />
            </div>
          </div>
          <div className="mt-8 border-t-2 border-slate-200 pt-5 text-center">
            <p className="text-sm text-slate-500">© 2026 EduPath. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Small reusable components ─────────────────────────────────── */
function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-800">{title}</h4>
      <div className="flex flex-col gap-2">
        {links.map((l) => <a key={l.label} href={l.href} className="text-sm text-slate-500 hover:text-teal-500">{l.label}</a>)}
      </div>
    </div>
  );
}
function SocialIcon({ children }) {
  return <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-[#D9F3EC] text-[#5DD9C1]">{children}</button>;
}

/* ── SVG Icons ─────────────────────────────────────────────────── */
function EduPathLogo() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none">
      <circle cx="20" cy="20" r="18" fill="#5DD9C1" opacity="0.2" />
      <path d="M20 8L12 12L20 16L28 12L20 8Z" fill="#5DD9C1" />
      <path d="M12 20L20 24L28 20" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 26L20 30L28 26" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2" fill="#5DD9C1" />
    </svg>
  );
}
function LogoutIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>;
}
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
function FacebookIcon()  { return <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M22 12.073C22 6.504 17.523 2 12 2S2 6.504 2 12.073c0 5.016 3.657 9.175 8.438 9.927v-7.025H7.898v-2.902h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.095 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.562v1.874h2.773l-.443 2.902h-2.33V22C18.343 21.248 22 17.089 22 12.073z"/></svg>; }
function TwitterIcon()   { return <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 8.09V9a10.66 10.66 0 01-9-4.5s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>; }
function LinkedInIcon()  { return <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.984V9h3.108v1.561h.046c.433-.82 1.494-1.684 3.074-1.684 3.287 0 3.894 2.164 3.894 4.977v6.598zM5.337 7.433a1.96 1.96 0 110-3.92 1.96 1.96 0 010 3.92zM6.919 20.452H3.756V9h3.163v11.452z"/></svg>; }
function InstagramIcon() { return <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M7 2C4.8 2 3 3.8 3 6v12c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4V6c0-2.2-1.8-4-4-4H7zm5 5a5 5 0 110 10 5 5 0 010-10zm6.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0zM12 9a3 3 0 100 6 3 3 0 000-6z"/></svg>; }

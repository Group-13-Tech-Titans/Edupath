import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getMentorResources, 
  shareResource, 
  deleteResource, 
  getMentorStudents,
  getMentorSessions
} from "../../api/mentorApi.js";

const TYPE_META = {
  video: { label: "Video", icon: <VideoIcon />, badge: "bg-sky-100 text-sky-800" },
  pdfppt: { label: "PDF / PPT", icon: <DocIcon />, badge: "bg-amber-100 text-amber-800" },
  quiz: { label: "Quiz", icon: <QuizIcon />, badge: "bg-purple-100 text-purple-800" },
};

// ── Helpers ─────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return "long ago";
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function MentorResources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [detailRes, setDetailRes] = useState(null);

  // Form state
  const emptyForm = {
    studentId: "",
    type: "video", 
    title: "", 
    url: "", 
    notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resData, studentData, sessionData] = await Promise.all([
        getMentorResources(),
        getMentorStudents(),
        getMentorSessions()
      ]);
      
      // Merge students from MentorStudent and from Sessions (for historical data)
      const studentMap = new Map();
      
      // 1. Add students from relationships
      (studentData || []).forEach(s => {
        const sId = String(s.studentId);
        studentMap.set(sId, {
          studentId: sId,
          studentName: s.studentName,
          track: s.track || "Student"
        });
      });
      
      // 2. Add students from accepted sessions
      (sessionData || []).forEach(s => {
        if ((s.status === 'scheduled' || s.status === 'completed') && s.studentId) {
          const sId = String(s.studentId);
          if (!studentMap.has(sId)) {
            studentMap.set(sId, {
              studentId: sId,
              studentName: s.studentName,
              track: s.topic || "Mentorship"
            });
          }
        }
      });

      setResources(resData || []);
      setStudents(Array.from(studentMap.values()));
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return alert("Please enter a title.");
    if (!form.studentId) return alert("Please select a student.");
    if (!form.url.trim()) return alert("Please enter a URL.");

    try {
      const selectedStudent = students.find(s => String(s.studentId) === String(form.studentId));
      const payload = {
        ...form,
        studentName: selectedStudent?.studentName || "Student",
        shareWith: "specific"
      };
      const response = await shareResource(payload);
      setResources((prev) => [response.resource, ...prev]);
      setForm(emptyForm);
      setModalOpen(false);
      alert("Resource shared successfully!");
    } catch (err) {
      alert("Failed to share resource: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await deleteResource(id);
      setResources((prev) => prev.filter((r) => (r._id || r.id) !== id));
      if (detailRes?._id === id || detailRes?.id === id) setDetailRes(null);
    } catch (err) {
      alert("Failed to delete resource");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return resources.filter((r) => {
      const typeOk = filterType === "all" || r.type === filterType;
      const searchOk = !q || r.title.toLowerCase().includes(q) ||
        (r.studentName || "").toLowerCase().includes(q);
      return typeOk && searchOk;
    });
  }, [resources, filterType, search]);

  const stats = useMemo(() => ({
    total: resources.length,
    videos: resources.filter((r) => r.type === "video").length,
    docs: resources.filter((r) => r.type === "pdfppt").length,
    quizzes: resources.filter((r) => r.type === "quiz").length,
  }), [resources]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-500"></div>
      </div>
    );
  }

  return (
    <>
      <section className="mb-5 flex flex-col justify-between gap-4 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold">Resources</h1>
          <p className="mt-1 text-sm text-slate-500">Share learning materials with your students who have accepted sessions.</p>
        </div>
        <button
          type="button" onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-500 shadow-md"
        >
          <PlusIcon /> Share Resource
        </button>
      </section>

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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2.2fr_1fr]">
        <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-teal-400 focus-within:bg-white">
              <SearchIcon />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400">
              <option value="all">All Types</option>
              <option value="video">Video</option>
              <option value="pdfppt">PDF / PPT</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>

          <div className="flex flex-col gap-3">
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                No resources found.
              </div>
            ) : (
              filtered.map((r) => {
                const tm = TYPE_META[r.type] || TYPE_META.video;
                return (
                  <div key={r._id || r.id}
                    className="flex flex-col gap-3 rounded-xl border border-black/5 bg-slate-50 p-4 transition hover:bg-emerald-50 border-l-4 border-l-teal-400 md:flex-row md:items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-500 font-bold">
                      {tm.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-base font-extrabold">{r.title}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${tm.badge}`}>{tm.label}</span>
                        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase bg-blue-100 text-blue-800">
                          {r.studentName && r.studentName !== "Student" 
                           ? r.studentName 
                           : (students.find(s => String(s.studentId) === String(r.studentId))?.studentName || "Student")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{r.description || "No description"}</p>
                      <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{timeAgo(r.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => setDetailRes(r)} className="rounded-lg bg-teal-400 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-500 shadow-sm">
                        View
                      </button>
                      <button onClick={() => handleDelete(r._id || r.id)} className="rounded-lg border-2 border-red-100 bg-white px-4 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-5">
          <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="mb-4 text-lg font-extrabold text-slate-800">Tips</div>
            <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm leading-relaxed text-slate-700 font-medium">
              You can only share resources with students who have <strong>accepted sessions</strong> with you.
            </div>
          </section>
        </aside>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-800">Share Resource</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-400">Select Student</label>
                <select name="studentId" value={form.studentId} onChange={handleChange} required
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-teal-400 focus:bg-white transition-all">
                  <option value="">Choose a student...</option>
                  {students.map((s) => (
                    <option key={s.studentId} value={s.studentId}>{s.studentName} — {s.track}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-400">Resource Type</label>
                <div className="flex gap-2">
                  {Object.entries(TYPE_META).map(([key, meta]) => (
                    <button key={key} type="button"
                      onClick={() => setForm((f) => ({ ...f, type: key }))}
                      className={`flex-1 rounded-2xl border-2 py-3 text-xs font-bold transition-all ${form.type === key
                        ? "border-teal-400 bg-teal-400 text-white shadow-lg shadow-teal-100"
                        : "border-slate-100 bg-slate-50 text-slate-500 hover:border-teal-200"
                        }`}>
                      {meta.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-400">Title</label>
                <input name="title" value={form.title} onChange={handleChange} required
                  placeholder="Resource Title"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-teal-400 focus:bg-white transition-all" />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-400">URL</label>
                <input name="url" value={form.url} onChange={handleChange} type="url" required
                  placeholder="https://..."
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-teal-400 focus:bg-white transition-all" />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-400">Notes (Optional)</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                  placeholder="Instructions for the student..."
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-teal-400 focus:bg-white transition-all resize-none" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 rounded-2xl bg-teal-400 py-4 text-sm font-extrabold text-white transition hover:bg-teal-500 shadow-lg shadow-teal-100">
                  Share Now
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-2xl bg-slate-100 py-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-200">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailRes && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setDetailRes(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-800">Resource Details</h2>
              <button onClick={() => setDetailRes(null)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            </div>
            <div className="space-y-4">
               <DetailRow label="Title" value={detailRes.title} />
               <DetailRow label="Type" value={TYPE_META[detailRes.type]?.label} />
               <DetailRow 
                 label="Student" 
                 value={
                   detailRes.studentName && detailRes.studentName !== "Student" 
                   ? detailRes.studentName 
                   : (students.find(s => String(s.studentId) === String(detailRes.studentId))?.studentName || "Student")
                 } 
               />
               
               <div className="pt-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Mentor Notes</p>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium">
                   {detailRes.notes || "—"}
                 </div>
               </div>

               {detailRes.url && (
                <a href={detailRes.url} target="_blank" rel="noreferrer"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-400 py-4 text-sm font-extrabold text-white transition hover:bg-teal-500 shadow-lg shadow-teal-100">
                  Open Resource Link
                </a>
               )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            <span className="text-sm font-extrabold text-slate-800">{value}</span>
        </div>
    );
}

function PlusIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>; }
function SearchIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>; }
function VideoIcon() { return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>; }
function DocIcon() { return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>; }
function QuizIcon() { return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>; }

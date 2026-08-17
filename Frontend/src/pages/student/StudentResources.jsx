import React, { useState, useEffect, useMemo } from "react";
import { getMyResources } from "../../api/mentorApi.js";
import PageShell from "../../components/PageShell.jsx";

const TYPE_META = {
  video: { label: "Video", icon: <VideoIcon />, badge: "bg-[#5DD9C1]/10 text-[#5DD9C1] border-[#5DD9C1]/20" },
  pdfppt: { label: "PDF / PPT", icon: <DocIcon />, badge: "bg-[#5DD9C1]/10 text-[#5DD9C1] border-[#5DD9C1]/20" },
  quiz: { label: "Quiz", icon: <QuizIcon />, badge: "bg-[#5DD9C1]/10 text-[#5DD9C1] border-[#5DD9C1]/20" },
};

function timeAgo(iso) {
  if (!iso) return "long ago";
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function StudentResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedRes, setSelectedRes] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await getMyResources();
      setResources(data || []);
    } catch (err) {
      console.error("Failed to fetch resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return resources.filter((r) => {
      const typeOk = filterType === "all" || r.type === filterType;
      const searchOk = !q || r.title.toLowerCase().includes(q) || 
                       (r.mentorId?.name || "").toLowerCase().includes(q);
      return typeOk && searchOk;
    });
  }, [resources, filterType, search]);

  const stats = useMemo(() => ({
    total: resources.length,
    videos: resources.filter(r => r.type === "video").length,
    docs: resources.filter(r => r.type === "pdfppt").length,
    quizzes: resources.filter(r => r.type === "quiz").length,
  }), [resources]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5DD9C1]/20 border-t-[#5DD9C1]"></div>
      </div>
    );
  }

  return (
    <PageShell>
      <div className="min-h-screen bg-[#f8f9fa] pb-12">
        <div className="mx-auto max-w-6xl px-4 py-8">
            
            {/* TOP HEADER */}
            <header className="mb-10 flex flex-col justify-between gap-6 rounded-3xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border-l-8 border-[#5DD9C1] md:flex-row md:items-center">
                <div>
                    <h1 className="text-[28px] font-black text-[#2c3e50]">My Learning Library</h1>
                    <p className="mt-1 text-[#7f8c8d] font-bold text-sm tracking-tight">Access all study materials and guides shared by your mentors.</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5DD9C1]/10 text-[#5DD9C1]">
                    <DocIcon className="h-8 w-8" />
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2.2fr_1fr]">
                
                {/* LEFT COLUMN: RESOURCES */}
                <div className="space-y-6">
                    
                    {/* Search & Filter */}
                    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex flex-1 min-w-[240px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 focus-within:border-[#5DD9C1] focus-within:bg-white transition-all">
                            <SearchIcon />
                            <input 
                                value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by title or mentor..."
                                className="w-full bg-transparent text-[14px] font-bold outline-none placeholder:text-slate-300 text-[#2c3e50]"
                            />
                        </div>
                        <select 
                            value={filterType} onChange={(e) => setFilterType(e.target.value)}
                            className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-[14px] font-bold text-[#7f8c8d] outline-none focus:border-[#5DD9C1] transition-all cursor-pointer"
                        >
                            <option value="all">All Material</option>
                            <option value="video">Videos</option>
                            <option value="pdfppt">Documents</option>
                            <option value="quiz">Quizzes</option>
                        </select>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {filtered.length === 0 ? (
                            <div className="col-span-full py-20 text-center rounded-[2.5rem] bg-white border-4 border-dashed border-slate-100">
                                <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                                    <DocIcon className="h-12 w-12" />
                                </div>
                                <h3 className="text-xl font-black text-slate-400">Library is Empty</h3>
                                <p className="text-slate-400 text-sm mt-2 font-medium">When your mentors share resources, they will appear here.</p>
                            </div>
                        ) : (
                            filtered.map((res) => {
                                const meta = TYPE_META[res.type] || TYPE_META.video;
                                return (
                                    <div 
                                        key={res._id} 
                                        className="group relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all hover:shadow-2xl hover:-translate-y-1.5"
                                    >
                                        <div className="flex items-start justify-between mb-6">
                                            <div className={`h-14 w-14 rounded-2xl ${meta.badge} border flex items-center justify-center shadow-inner`}>
                                                {meta.icon}
                                            </div>
                                            <span className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${meta.badge} border shadow-sm`}>
                                                {meta.label}
                                            </span>
                                        </div>

                                        <h3 className="mb-3 text-[19px] font-black text-[#2c3e50] leading-snug group-hover:text-[#5DD9C1] transition-colors line-clamp-2">
                                            {res.title}
                                        </h3>
                                        
                                        <div className="mb-8 flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-[#5DD9C1]/20 flex items-center justify-center text-[11px] font-black text-[#5DD9C1]">
                                                {res.mentorId?.name?.[0] || "M"}
                                            </div>
                                            <p className="text-[12px] font-bold text-[#7f8c8d] uppercase tracking-wide">
                                                By: <span className="text-[#5DD9C1] font-black hover:underline cursor-pointer">{res.mentorId?.name || "Mentor"}</span>
                                            </p>
                                        </div>

                                        <div className="mt-4 flex flex-col gap-4 border-t border-slate-50 pt-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
                                                    {timeAgo(res.createdAt)}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => setSelectedRes(res)}
                                                    className="flex-1 rounded-2xl bg-[#f8f9fa] border-2 border-slate-100 px-4 py-3 text-[13px] font-black text-[#7f8c8d] hover:bg-slate-100 transition-all shadow-sm"
                                                >
                                                    View Details
                                                </button>
                                                {res.url && (
                                                    <a 
                                                        href={res.url} target="_blank" rel="noreferrer"
                                                        className="flex-1 rounded-2xl bg-[#5DD9C1] px-4 py-3 text-center text-[13px] font-black text-white hover:bg-[#4bcbb0] transition-all shadow-lg shadow-[#5DD9C1]/20"
                                                    >
                                                        Access
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: SIDEBAR */}
                <div className="flex flex-col gap-6">
                    
                    {/* STATS SECTION */}
                    <section className="rounded-3xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                        <h3 className="mb-6 text-lg font-extrabold text-[#2c3e50] uppercase tracking-tight">Library Stats</h3>
                        <div className="space-y-4">
                            <MiniStat label="Total Material" value={stats.total} color="border-[#5DD9C1]" />
                            <MiniStat label="Video Guides" value={stats.videos} color="border-[#5DD9C1]" />
                            <MiniStat label="Docs & Slides" value={stats.docs} color="border-[#5DD9C1]" />
                            <MiniStat label="Knowledge Quizzes" value={stats.quizzes} color="border-[#5DD9C1]" />
                        </div>
                    </section>

                    {/* GUIDANCE SECTION */}
                    <section className="rounded-3xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                        <h3 className="mb-5 text-lg font-extrabold text-[#2c3e50] uppercase tracking-tight">Quick Guide</h3>
                        <div className="space-y-5 text-[14px] font-medium text-[#7f8c8d] leading-relaxed">
                            <div className="flex gap-3">
                                <span className="text-[#5DD9C1] font-black">●</span>
                                <span>Click <strong>Access</strong> to open external links directly in a new tab.</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-[#5DD9C1] font-black">●</span>
                                <span>Check <strong>View Details</strong> to read specific notes from your mentor.</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-[#5DD9C1] font-black">●</span>
                                <span>New materials are tagged at the top of your library list.</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {selectedRes && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[#2c3e50]/80 backdrop-blur-md p-6" onClick={() => setSelectedRes(null)}>
          <div className="w-full max-w-lg rounded-[3rem] bg-white p-10 shadow-2xl animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="mb-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#5DD9C1]/10 flex items-center justify-center text-[#5DD9C1]">
                    <DocIcon className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-black text-[#2c3e50]">Material Info</h2>
              </div>
              <button onClick={() => setSelectedRes(null)} className="h-12 w-12 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center font-black">✕</button>
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-[13px] font-black uppercase tracking-[0.2em] text-[#5DD9C1] mb-3 block">Topic</label>
                <p className="text-[22px] font-black text-[#2c3e50] leading-tight">{selectedRes.title}</p>
              </div>

              <div className="p-8 rounded-[2rem] bg-[#5DD9C1]/5 border-2 border-dashed border-[#5DD9C1]/20">
                <label className="text-[13px] font-black uppercase tracking-[0.2em] text-[#5DD9C1] mb-4 block underline underline-offset-8">Mentor's Notes</label>
                <div className="text-[15px] font-bold leading-relaxed text-[#2c3e50]/80 italic">
                  "{selectedRes.notes || "Your mentor has shared this resource for your review. Please go through the materials provided."}"
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t border-slate-50 pt-8">
                <div>
                   <label className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Material Type</label>
                   <p className="text-[15px] font-black text-[#2c3e50]">{TYPE_META[selectedRes.type]?.label}</p>
                </div>
                <div>
                   <label className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Shared By</label>
                   <p className="text-[15px] font-black text-[#5DD9C1]">{selectedRes.mentorId?.name || "Your Mentor"}</p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-3">
              {selectedRes.url && (
                <a 
                  href={selectedRes.url} target="_blank" rel="noreferrer"
                  className="w-full rounded-2xl bg-[#5DD9C1] py-5 text-center text-[15px] font-black text-white hover:bg-[#4bcbb0] shadow-xl shadow-[#5DD9C1]/20 transition-all"
                >
                  Go to Resource
                </a>
              )}
              <button 
                onClick={() => setSelectedRes(null)}
                className="w-full rounded-2xl bg-[#2c3e50] py-5 text-[15px] font-black text-white hover:bg-[#1a252f] transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function MiniStat({ label, value, color }) {
    return (
        <div className={`flex items-center justify-between p-4 rounded-2xl bg-slate-50 border-l-4 ${color} transition-all hover:bg-white hover:shadow-md`}>
            <span className="text-[13px] font-bold text-[#7f8c8d]">{label}</span>
            <span className="text-xl font-black text-[#2c3e50]">{value}</span>
        </div>
    );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-l-4 border-[#5DD9C1] transition-transform hover:scale-[1.02]">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#7f8c8d]">{label}</p>
      <p className="mt-1 text-3xl font-black text-[#2c3e50]">{value}</p>
    </div>
  );
}

function SearchIcon() {
  return <svg className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
}

function VideoIcon() {
  return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function DocIcon({ className = "h-6 w-6" }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}

function QuizIcon() {
  return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9.001c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppProvider.jsx";
import { getSessionStats, getMentorStudents, shareResource } from "../../api/mentorApi";

const emptyForm = {
  shareWith: "all", studentId: "",
  type: "video", title: "", description: "", url: "", notes: "",
};

export default function MentorDashboard() {
  const { currentUser, state } = useApp();
  const navigate = useNavigate();

  const [resourceOpen, setResourceOpen] = useState(false);
  const [photo, setPhoto] = useState(() => localStorage.getItem("mentorPhoto") || null);
  const [form, setForm] = useState(emptyForm);
  const [statsData, setStatsData] = useState({ pending: 0, upcoming: 0 });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onStorage = () => setPhoto(localStorage.getItem("mentorPhoto") || null);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [s, stu] = await Promise.all([
          getSessionStats(),
          getMentorStudents()
        ]);
        setStatsData(s);
        setStudents(stu);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) loadDashboard();
  }, [currentUser]);

  const mentorName = currentUser?.mentorProfile?.name || currentUser?.name || "Mentor";
  const mentorTitle = currentUser?.mentorProfile?.subjectField
    ? `${currentUser.mentorProfile.subjectField} Mentor`
    : "Technical Mentor";

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Please enter a Title.");
    if (form.shareWith === "specific" && !form.studentId) return alert("Select a student.");
    
    try {
      await shareResource({ ...form, mentorId: currentUser.id });
      alert(`Resource "${form.title}" shared successfully!`);
      setForm(emptyForm);
      setResourceOpen(false);
    } catch (err) {
      alert("Failed to share: " + err.message);
    }
  };

  const sessionRequests = useMemo(() => {
    return (state.mentorRequests || [])
      .filter(r => r.status === "pending")
      .slice(0, 3);
  }, [state.mentorRequests]);

  const upcomingSessions = useMemo(() => {
    return (state.mentorRequests || [])
      .filter(r => r.status === "scheduled")
      .slice(0, 3);
  }, [state.mentorRequests]);

  return (
    <>
      <section className="mb-5 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img className="h-14 w-14 rounded-full border-[3px] border-teal-400 object-cover" alt="Avatar"
              src={photo || "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='30' fill='%235DD9C1'/%3E%3Cpath d='M30 28C33.866 28 37 24.866 37 21C37 17.134 33.866 14 30 14C26.134 14 23 17.134 23 21C23 24.866 26.134 28 30 28Z' fill='white'/%3E%3Cpath d='M30 32C21.716 32 15 35.582 15 40V46H45V40C45 35.582 38.284 32 30 32Z' fill='white'/%3E%3C/svg%3E"}
            />
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">{mentorName}</h2>
              <p className="text-sm text-slate-500">{mentorTitle}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/educator" className="inline-block rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white">Switch to Educator</Link>
            <Link to="/mentor/profile" className="inline-block rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white">View Profile</Link>
            <Link to="/mentor/settings" className="inline-block rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500">Settings</Link>
          </div>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition hover:-translate-y-1">
          <div className="mb-2 text-sm text-slate-500">Pending Requests</div>
          <div className="text-3xl font-bold text-slate-800">{statsData.pending || 0}</div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition hover:-translate-y-1">
          <div className="mb-2 text-sm text-slate-500">Upcoming Sessions</div>
          <div className="text-3xl font-bold text-slate-800">{statsData.upcoming || 0}</div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CardSection title="Session Requests" linkText="View All" linkTo="/mentor/sessions?tab=requests">
            {sessionRequests.length > 0 ? sessionRequests.map((r) => (
              <SessionCard key={r.id} title={r.field} meta={`Student: ${r.fullName}`} desc={r.notes} timeLine={r.sessionType}
                badgeVariant="pending" badgeText={r.status}
                actions={[{ label: "Review", variant: "primary", onClick: () => navigate("/mentor/sessions?tab=requests") }]}
              />
            )) : <p className="text-sm text-slate-400 py-4">No pending requests.</p>}
          </CardSection>

          <CardSection title="Upcoming Sessions" linkText="View all" linkTo="/mentor/sessions?tab=upcoming">
            {upcomingSessions.length > 0 ? upcomingSessions.map((s) => (
              <SessionCard key={s.id} title={s.field} meta={`${s.scheduledDate} at ${s.scheduledTime}`} metaIcon="calendar" desc={s.notes}
                badgeVariant="scheduled" badgeText={s.status}
                actions={[
                  { label: "Join Session", variant: "primary", onClick: () => s.meetingLink && window.open(s.meetingLink, "_blank") },
                  { label: "Details", variant: "outline", onClick: () => navigate("/mentor/sessions?tab=upcoming") },
                ]}
              />
            )) : <p className="text-sm text-slate-400 py-4">No upcoming sessions.</p>}
          </CardSection>
        </div>

        <div className="lg:col-span-1">
          <section className="rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h2 className="mb-5 text-xl font-semibold text-slate-800">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              <QuickAction title="Review Sessions" desc="View session requests" onClick={() => navigate("/mentor/sessions")} icon={<EyeIcon />} />
              <QuickAction title="Share Resources" desc="Upload learning materials" onClick={() => setResourceOpen(true)} icon={<DocIcon />} />
              <QuickAction title="Messages" desc="Chat with students" onClick={() => navigate("/mentor/messages")} icon={<ChatIcon />} />
              <QuickAction title="View Analytics" desc="Track mentoring metrics" onClick={() => navigate("/mentor/analytics")} icon={<ChartIcon />} />
            </div>
          </section>
        </div>
      </div>

      {resourceOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setResourceOpen(false); }}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-auto">
            <div className="mb-5 flex items-center justify-between border-b-2 border-slate-200 pb-4">
              <h2 className="text-xl font-extrabold">Share Learning Resource</h2>
              <button type="button" onClick={() => setResourceOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 hover:bg-slate-200">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Share With</label>
                <select name="shareWith" value={form.shareWith} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400">
                  <option value="all">All Students</option>
                  <option value="specific">Specific Student</option>
                </select>
              </div>
              {form.shareWith === "specific" && (
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">Select Student</label>
                  <select name="studentId" value={form.studentId} onChange={handleChange} required className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400">
                    <option value="">Choose a student...</option>
                    {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Resource Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">URL *</label>
                <input name="url" value={form.url} onChange={handleChange} type="url" className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 rounded-xl bg-teal-400 py-3 text-sm font-extrabold text-white">Share</button>
                <button type="button" onClick={() => setResourceOpen(false)} className="flex-1 rounded-xl border-2 border-slate-300 py-3 text-sm font-extrabold text-slate-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function CardSection({ title, linkText, linkTo, children }) {
  return (
    <section className="mb-5 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        {linkText && <Link className="text-sm font-semibold text-teal-500 hover:text-teal-600" to={linkTo}>{linkText}</Link>}
      </div>
      {children}
    </section>
  );
}

function SessionCard({ title, meta, desc, timeLine, badgeText, badgeVariant, actions, metaIcon = "clock" }) {
  const badgeClass = badgeVariant === "pending" ? "bg-amber-100 text-amber-800" : badgeVariant === "scheduled" ? "bg-sky-100 text-sky-800" : "bg-emerald-100 text-emerald-800";
  return (
    <div className="mb-4 rounded-xl border-l-4 border-teal-400 bg-slate-50 p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 text-base font-semibold text-slate-800">{title}</div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {metaIcon === "calendar" ? <CalendarIcon /> : <ClockIcon />}
            <span>{meta}</span>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>{badgeText}</span>
      </div>
      <p className="text-sm text-slate-500 line-clamp-2">{desc}</p>
      {actions?.map((a) => (
        <button key={a.label} onClick={a.onClick} className={`mt-4 mr-2 px-4 py-2 text-sm font-semibold rounded-lg ${a.variant === "primary" ? "bg-teal-400 text-white" : "border-2 border-teal-400 text-teal-500"}`}>{a.label}</button>
      ))}
    </div>
  );
}

function QuickAction({ title, desc, onClick, icon }) {
  return (
    <button type="button" onClick={onClick} className="w-full rounded-xl bg-gradient-to-br from-teal-400 to-emerald-300 p-5 text-left text-white shadow-sm transition hover:-translate-y-1">
      <div className="mb-3">{icon}</div>
      <div className="text-base font-semibold">{title}</div>
      <div className="text-xs opacity-90">{desc}</div>
    </button>
  );
}

function ClockIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>; }
function CalendarIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>; }
function EyeIcon() { return <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>; }
function DocIcon() { return <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>; }
function ChatIcon() { return <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>; }
function ChartIcon() { return <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>; }

import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppProvider.jsx";

// Mock students for the resource form
const MOCK_STUDENTS = [
  { id: "S001", name: "Priya Sharma",      track: "Web Development" },
  { id: "S002", name: "Rahul Mehta",       track: "Data Science & ML" },
  { id: "S003", name: "Anjali Kumar",      track: "React & TypeScript" },
  { id: "S004", name: "Nimal Perera",      track: "Networking" },
  { id: "S005", name: "Sahana Jayasinghe", track: "Web Development" },
  { id: "S006", name: "Kavindu Fernando",  track: "Web Development" },
];
const TRACKS = [...new Set(MOCK_STUDENTS.map((s) => s.track))];

const emptyForm = {
  shareWith: "all", studentId: "", courseGroup: "",
  type: "video", title: "", description: "", url: "", notes: "",
};

export default function MentorDashboard() {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const [resourceOpen, setResourceOpen] = useState(false);

  // Read profile photo saved by MentorProfile page
  const [photo, setPhoto] = useState(() => localStorage.getItem("mentorPhoto") || null);

  // Listen for storage changes (if profile photo updated in another tab)
  React.useEffect(() => {
    const onStorage = () => setPhoto(localStorage.getItem("mentorPhoto") || null);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const [form, setForm] = useState(emptyForm);

  const mentorName =
    currentUser?.mentorProfile?.name || currentUser?.name || "Dr. Sarah Johnson";

  const mentorTitle = currentUser?.mentorProfile?.subjectField
    ? `${currentUser.mentorProfile.subjectField} Mentor`
    : "Senior Full-Stack Developer & Technical Mentor";

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
    if (form.shareWith === "group" && !form.courseGroup) {
      alert("Please select a Course Group to share with.");
      return;
    }
    if ((form.type === "video" || form.type === "pdfppt" || form.type === "quiz") && !form.url.trim()) {
      alert("Please enter a URL for this " + (form.type === "video" ? "Video" : form.type === "pdfppt" ? "PDF/PPT" : "Quiz") + " resource.");
      return;
    }

    alert(`✅ Resource "${form.title}" shared successfully!`);
    setForm(emptyForm);
    setResourceOpen(false);
  };

  const stats = useMemo(
    () => [
      { label: "Active Students", value: "24" },
      { label: "Upcoming Sessions", value: "8" },
      { label: "Pending Requests", value: "5" },
      { label: "Hours This Month", value: "42" },
    ],
    []
  );

  const sessionRequests = useMemo(
    () => [
      {
        title: "Career Guidance - Web Development Path",
        meta: "Requested: 2 hours ago • Priya S.",
        desc: "Student needs guidance on choosing between frontend and full-stack development career paths.",
        time: "Proposed Time: Feb 15, 2026 at 3:00 PM - 4:00 PM",
        status: "Pending",
      },
      {
        title: "Project Review - Machine Learning Model",
        meta: "Requested: 5 hours ago • Rahul M.",
        desc: "Student wants feedback on predictive model accuracy and feature engineering approach.",
        time: "Proposed Time: Feb 16, 2026 at 2:00 PM - 3:30 PM",
        status: "Pending",
      },
    ],
    []
  );

  const students = useMemo(
    () => [
      { initials: "PS", name: "Priya Sharma", subtitle: "Web Development • Enrolled 3 months ago", progress: 68 },
      { initials: "RM", name: "Rahul Mehta", subtitle: "Data Science & ML • Enrolled 1 month ago", progress: 42 },
      { initials: "AK", name: "Anjali Kumar", subtitle: "React & TypeScript • Enrolled 2 months ago", progress: 85 },
    ],
    []
  );

  const upcomingSessions = useMemo(
    () => [
      {
        title: "1-on-1: Portfolio Review with Anjali K.",
        time: "Today, 3:00 PM - 4:00 PM",
        desc: "Topics: Project showcase, GitHub profile optimization, job application strategy",
        status: "Scheduled",
        actions: ["Join Session", "View Details"],
      },
      {
        title: "Group Session: Advanced React Patterns",
        time: "Tomorrow, 5:00 PM - 6:30 PM",
        desc: "Topics: Custom hooks, Context API optimization, Performance tuning • 6 students enrolled",
        status: "Scheduled",
        actions: ["Join Session", "View Detailss"],
      },
    ],
    []
  );

  const activities = useMemo(
    () => [
      { title: "Session Completed", desc: "Career guidance with Priya S. • 2 hours ago", accent: "border-emerald-400" },
      { title: "New Feedback Received", desc: "5-star rating from Anjali K. • 5 hours ago", accent: "border-orange-400" },
      { title: "Resource Shared", desc: "React best practices guide • Yesterday", accent: "border-sky-400" },
      { title: "Student Progress Milestone", desc: "Rahul M. completed Module 5 • Yesterday", accent: "border-green-500" },
    ],
    []
  );

  const monthStats = useMemo(
    () => [
      { label: "Sessions Completed", value: "18" },
      { label: "Avg. Rating", value: "4.8 " },
      { label: "Resources Shared", value: "12" },
      { label: "Response Time", value: "< 2 hrs" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-200 to-teal-300 p-5">
      {/* Header */}
      <header className="mb-5 flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <EduPathLogo />
          <span>EduPath</span>
        </div>

        <nav className="relative z-50 hidden flex-1 items-center justify-center gap-8 md:flex">
          <Link to="/MentorDashboard" className="font-medium text-teal-500">Dashboard</Link>
          <Link to="/MentorStudents"  className="font-medium text-slate-800 transition-colors hover:text-teal-500">My Students</Link>
          <Link to="/MentorSessions"  className="font-medium text-slate-800 transition-colors hover:text-teal-500">Sessions</Link>
          <Link to="/MentorResources" className="font-medium text-slate-800 transition-colors hover:text-teal-500">Resources</Link>
          <Link to="/MentorMessages"  className="font-medium text-slate-800 transition-colors hover:text-teal-500">Messages</Link>
          <Link to="/MentorProfile"   className="font-medium text-slate-800 transition-colors hover:text-teal-500" style={{ textDecoration: "none" }}>Profile</Link>
        </nav>

        <div className="w-[150px] flex justify-end">
          <button type="button" onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white">
            <LogoutIcon /> Logout
          </button>
        </div>
      </header>

      {/* Page Header */}
      <section className="mb-5 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img className="h-14 w-14 rounded-full border-[3px] border-teal-400 object-cover" alt="Mentor Avatar"
              src={photo || "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='30' fill='%235DD9C1'/%3E%3Cpath d='M30 28C33.866 28 37 24.866 37 21C37 17.134 33.866 14 30 14C26.134 14 23 17.134 23 21C23 24.866 26.134 28 30 28Z' fill='white'/%3E%3Cpath d='M30 32C21.716 32 15 35.582 15 40V46H45V40C45 35.582 38.284 32 30 32Z' fill='white'/%3E%3C/svg%3E"}
            />
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">{mentorName}</h2>
              <p className="text-sm text-slate-500">{mentorTitle}</p>
              <span className="mt-1 inline-block rounded-full bg-teal-400 px-3 py-1 text-xs font-semibold text-white">Verified Mentor</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/MentorProfile"
              className="inline-block rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white">
              View Profile
            </Link>
            <Link to="/MentorSettings"
              className="inline-block rounded-xl bg-teal-400 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-500">
              Settings
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition hover:-translate-y-1">
            <div className="mb-2 text-sm text-slate-500">{s.label}</div>
            <div className="text-3xl font-bold text-slate-800">{s.value}</div>
          </div>
        ))}
      </section>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2">
          <CardSection title="Session Requests" linkText="View All" linkTo="/MentorSessions?tab=requests">
            {sessionRequests.map((r) => (
              <SessionCard key={r.title} title={r.title} meta={r.meta} desc={r.desc} timeLine={r.time}
                badgeVariant="pending" badgeText={r.status}
                actions={[
                  { label: "Accept", variant: "primary", onClick: () => {} },
                  { label: "Decline", variant: "outline", onClick: () => {} },
                ]}
              />
            ))}
          </CardSection>

          <CardSection title="My Students" linkText="View All (24)" linkTo="/MentorStudents">
            {students.map((st) => (
              <div key={st.name} className="mb-4 flex flex-col justify-between gap-4 rounded-xl bg-slate-50 p-5 transition hover:translate-x-1 hover:bg-emerald-50 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-300 text-lg font-bold text-white">{st.initials}</div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">{st.name}</h3>
                    <p className="text-[13px] text-slate-500">{st.subtitle}</p>
                    <div className="mt-2 h-2 w-[200px] overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-300" style={{ width: `${st.progress}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{st.progress}% Course Progress</p>
                  </div>
                </div>
                <Link to="/MentorStudents" className="inline-block rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white text-center">
                  View Progress
                </Link>
              </div>
            ))}
          </CardSection>

          <CardSection title="Upcoming Sessions" linkText="View all" linkTo="/MentorSessions?tab=upcoming">
            {upcomingSessions.map((s) => (
              <SessionCard key={s.title} title={s.title} meta={s.time} metaIcon="calendar" desc={s.desc}
                badgeVariant="scheduled" badgeText={s.status}
                actions={[
                  { label: s.actions[0], variant: "primary", onClick: () => {} },
                  { label: s.actions[1], variant: "outline", onClick: () => {} },
                ]}
              />
            ))}
          </CardSection>
        </div>

        {/* Right column */}
        <div className="lg:col-span-1">
          <section className="mb-5 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h2 className="mb-5 text-xl font-semibold text-slate-800">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <QuickAction title="Review Sessions" desc="View session requests" onClick={() => navigate("/MentorSessions")} icon={<EyeIcon />} />
              <QuickAction title="Share Resources" desc="Upload learning materials" onClick={() => setResourceOpen(true)} icon={<DocIcon />} />
              <QuickAction title="Messages" desc="Chat with students" onClick={() => navigate("/MentorMessages")} icon={<ChatIcon />} />
              <QuickAction title="View Analytics" desc="Track mentoring metrics" onClick={() => {}} icon={<ChartIcon />} />
            </div>
          </section>

          <section className="mb-5 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h2 className="mb-5 text-xl font-semibold text-slate-800">Recent Activity</h2>
            <div className="flex flex-col gap-4">
              {activities.map((a) => (
                <div key={a.title} className={`rounded-xl bg-slate-50 p-4 border-l-4 ${a.accent}`}>
                  <div className="mb-1 font-semibold text-slate-800">{a.title}</div>
                  <div className="text-sm text-slate-500">{a.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h2 className="mb-5 text-xl font-semibold text-slate-800">This Month</h2>
            <div className="flex flex-col gap-4">
              {monthStats.map((m) => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{m.label}</span>
                  <span className="text-base font-semibold text-slate-800">{m.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* ── Share Resource Modal (full featured) ─────────────────── */}
      {resourceOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) { setResourceOpen(false); setForm(emptyForm); } }}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-auto">

            <div className="mb-5 flex items-center justify-between border-b-2 border-slate-200 pb-4">
              <h2 className="text-xl font-extrabold">Share Learning Resource</h2>
              <button type="button" onClick={() => { setResourceOpen(false); setForm(emptyForm); }}
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
                <button type="button" onClick={() => { setForm(emptyForm); setResourceOpen(false); }}
                  className="flex-1 rounded-xl border-2 border-slate-300 bg-white py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-5 rounded-2xl bg-white px-7 py-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <div className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
                <EduPathLogo /><span>EduPath</span>
              </div>
              <p className="mb-4 text-sm leading-6 text-slate-700">Empowering learners worldwide with quality education and personalized learning paths.</p>
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

/* ── Small components ─────────────────────────────────────────── */
function CardSection({ title, linkText, linkTo, children, id }) {
  return (
    <section id={id} className="mb-5 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        {linkText ? <Link className="text-sm font-semibold text-teal-500 hover:text-teal-600" to={linkTo || "#"}>{linkText}</Link> : null}
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
      {desc ? <p className="text-sm text-slate-500">{desc}</p> : null}
      {timeLine ? <p className="mt-3 text-[13px] font-semibold text-slate-800">{timeLine}</p> : null}
      {actions?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map((a) => (
            <button key={a.label} onClick={a.onClick} type="button"
              className={a.variant === "primary"
                ? "rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500"
                : "rounded-lg border-2 border-teal-400 bg-white px-4 py-2 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"}>
              {a.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function QuickAction({ title, desc, onClick, icon }) {
  return (
    <button type="button" onClick={onClick}
      className="rounded-xl bg-gradient-to-br from-teal-400 to-emerald-300 p-5 text-left text-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(93,217,193,0.45)]">
      <div className="mb-3">{icon}</div>
      <div className="text-base font-semibold">{title}</div>
      <div className="text-xs opacity-90">{desc}</div>
    </button>
  );
}

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
  return <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-[#D9F3EC] text-[#5DD9C1] transition hover:bg-[#5DD9C1] hover:text-white">{children}</button>;
}

/* ── Icons ────────────────────────────────────────────────────── */
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
function LogoutIcon()   { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>; }
function ClockIcon()    { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>; }
function CalendarIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>; }
function EyeIcon()      { return <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>; }
function DocIcon()      { return <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>; }
function ChatIcon()     { return <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>; }
function ChartIcon()    { return <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>; }
function FacebookIcon()  { return <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M22 12.073C22 6.504 17.523 2 12 2S2 6.504 2 12.073c0 5.016 3.657 9.175 8.438 9.927v-7.025H7.898v-2.902h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.095 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.562v1.874h2.773l-.443 2.902h-2.33V22C18.343 21.248 22 17.089 22 12.073z" /></svg>; }
function TwitterIcon()   { return <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 8.09V9a10.66 10.66 0 01-9-4.5s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>; }
function LinkedInIcon()  { return <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.984V9h3.108v1.561h.046c.433-.82 1.494-1.684 3.074-1.684 3.287 0 3.894 2.164 3.894 4.977v6.598zM5.337 7.433a1.96 1.96 0 110-3.92 1.96 1.96 0 010 3.92zM6.919 20.452H3.756V9h3.163v11.452z" /></svg>; }
function InstagramIcon() { return <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M7 2C4.8 2 3 3.8 3 6v12c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4V6c0-2.2-1.8-4-4-4H7zm5 5a5 5 0 110 10 5 5 0 010-10zm6.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0zM12 9a3 3 0 100 6 3 3 0 000-6z" /></svg>; }

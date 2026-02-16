import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MentorSessions() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Session data
  const initialData = useMemo(
    () => ({
      requests: [
        {
          id: "REQ-101",
          student: "Priya S.",
          topic: "Career Guidance - Web Development Path",
          type: "1-on-1",
          time: "Feb 15, 2026 • 3:00 PM - 4:00 PM",
          duration: "1 hour",
          note: "Student needs guidance on choosing between frontend and full-stack development career paths.",
          status: "pending",
        },
        {
          id: "REQ-102",
          student: "Rahul M.",
          topic: "Project Review - Machine Learning Model",
          type: "1-on-1",
          time: "Feb 16, 2026 • 2:00 PM - 3:30 PM",
          duration: "1.5 hours",
          note: "Student wants feedback on predictive model accuracy and feature engineering approach.",
          status: "pending",
        },
        {
          id: "REQ-103",
          student: "Anjali K.",
          topic: "Advanced React Best Practices",
          type: "Group",
          time: "Feb 17, 2026 • 5:00 PM - 6:00 PM",
          duration: "1 hour",
          note: "Discussion about state management patterns and custom hooks implementation.",
          status: "pending",
        },
      ],
      upcoming: [
        {
          id: "SESS-201",
          student: "Anjali K.",
          topic: "Portfolio Review & Job Application Strategy",
          type: "1-on-1",
          time: "Today • 3:00 PM - 4:00 PM",
          duration: "1 hour",
          note: "Topics: Project showcase, GitHub profile optimization, job application strategy",
          status: "scheduled",
        },
        {
          id: "SESS-202",
          student: "6 students",
          topic: "Group Session: Advanced React Patterns",
          type: "Group",
          time: "Tomorrow • 5:00 PM - 6:30 PM",
          duration: "1.5 hours",
          note: "Topics: Custom hooks, Context API optimization, Performance tuning",
          status: "scheduled",
        },
      ],
      past: [
        {
          id: "SESS-301",
          student: "Priya S.",
          topic: "Resume Review & Internship Plan",
          type: "1-on-1",
          time: "Feb 10, 2026 • 4:00 PM - 4:30 PM",
          duration: "30 mins",
          note: "Reviewed CV structure and internship application strategy.",
          status: "completed",
        },
        {
          id: "SESS-302",
          student: "Rahul M.",
          topic: "Intro to ML Roadmap",
          type: "1-on-1",
          time: "Feb 8, 2026 • 6:00 PM - 6:45 PM",
          duration: "45 mins",
          note: "Discussed learning roadmap and project idea selection.",
          status: "completed",
        },
      ],
    }),
    []
  );

  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState("requests");
  const [selectedSession, setSelectedSession] = useState(null);

  const counts = useMemo(() => {
    const pending = data.requests.filter((x) => x.status === "pending").length;
    const upcoming = data.upcoming.filter((x) => x.status === "scheduled").length;
    const completed = data.past.filter((x) => x.status === "completed").length;
    return { pending, upcoming, completed };
  }, [data]);

  const currentItems = useMemo(() => {
    return data[activeTab] || [];
  }, [data, activeTab]);

  const acceptRequest = (id) => {
    const idx = data.requests.findIndex((x) => x.id === id);
    if (idx < 0) return;

    const req = data.requests[idx];
    const newSession = {
      ...req,
      id: "SESS-" + Math.floor(1000 + Math.random() * 9000),
      status: "scheduled",
    };

    setData((prev) => ({
      ...prev,
      requests: prev.requests.filter((x) => x.id !== id),
      upcoming: [newSession, ...prev.upcoming],
    }));

    alert("Request accepted. It is now in Upcoming.");
    if (selectedSession?.id === id) setSelectedSession(null);
  };

  const declineRequest = (id) => {
    setData((prev) => ({
      ...prev,
      requests: prev.requests.filter((x) => x.id !== id),
    }));
    alert("Request declined.");
    if (selectedSession?.id === id) setSelectedSession(null);
  };

  const joinSession = (id) => {
    alert("Joining session... (connect to your video/meeting link in backend)");
  };

  const markCompleted = (id) => {
    const idx = data.upcoming.findIndex((x) => x.id === id);
    if (idx < 0) return;

    const sess = { ...data.upcoming[idx], status: "completed" };

    setData((prev) => ({
      ...prev,
      upcoming: prev.upcoming.filter((x) => x.id !== id),
      past: [sess, ...prev.past],
    }));

    alert("Session marked as completed.");
    if (selectedSession?.id === id) setSelectedSession(null);
  };

  const findById = (id) => {
    for (const key of ["requests", "upcoming", "past"]) {
      const found = (data[key] || []).find((x) => x.id === id);
      if (found) return { item: found, bucket: key };
    }
    return null;
  };

  const openDetails = (id) => {
    const res = findById(id);
    if (!res) return;
    setSelectedSession({ ...res.item, bucket: res.bucket });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-200 to-teal-300 p-5 text-slate-800">
      {/* Header - matching MentorStudents */}
      <header className="mb-5 flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <EduPathLogo />
          <span>EduPath</span>
        </div>

        <nav className="relative z-50 hidden flex-1 items-center justify-center gap-8 md:flex">
          <Link to="/MentorDashboard" className="font-medium text-slate-800 transition-colors hover:text-teal-500">
            Dashboard
          </Link>
          <Link to="/MentorStudents" className="font-medium text-slate-800 transition-colors hover:text-teal-500">
            My Students
          </Link>
          <Link to="/MentorSessions" className="font-medium text-teal-500 transition-colors hover:text-teal-500">
            Sessions
          </Link>
          
          <Link to="/MentorProfile" className="font-medium text-slate-800 transition-colors hover:text-teal-500" style={{ textDecoration: "none" }}>
            Profile
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="w-[150px] flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </header>

      {/* Page Header */}
      <section className="mb-5 flex flex-col justify-between gap-4 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold">My Sessions</h1>
          <p className="mt-1 text-sm text-slate-500">Manage session requests, view upcoming sessions, and track session history.</p>
        </div>

        <Link
          to="/mentor"
          className="inline-block rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-600 transition hover:bg-teal-400 hover:text-white"
        >
          ← Back to Dashboard
        </Link>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2.1fr_1fr]">
        {/* Main Content */}
        <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl font-extrabold">Sessions</h2>
            <button
              type="button"
              className="rounded-xl bg-teal-400 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-500"
            >
              + Schedule Session
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-5 flex gap-2.5 flex-wrap border-b-2 border-slate-200 pb-2.5">
            <Tab active={activeTab === "requests"} onClick={() => setActiveTab("requests")}>
              Session Requests
            </Tab>
            <Tab active={activeTab === "upcoming"} onClick={() => setActiveTab("upcoming")}>
              Upcoming Sessions
            </Tab>
            <Tab active={activeTab === "past"} onClick={() => setActiveTab("past")}>
              Past Sessions
            </Tab>
          </div>

          {/* Session List */}
          <div className="flex flex-col gap-3.5">
            {currentItems.length > 0 ? (
              currentItems.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  bucket={activeTab}
                  onAccept={acceptRequest}
                  onDecline={declineRequest}
                  onJoin={joinSession}
                  onMarkCompleted={markCompleted}
                  onViewDetails={openDetails}
                />
              ))
            ) : (
              <div className="text-sm text-slate-500">No sessions here yet.</div>
            )}
          </div>

          <div className="mt-4 text-sm text-slate-500">
            Showing <span className="font-bold">{currentItems.length}</span> item(s)
          </div>
        </section>

        {/* Sidebar */}
        <aside className="flex flex-col gap-5">
          <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="mb-5 text-lg font-extrabold">Session Overview</div>

            <MiniStat label="Pending Requests" value={counts.pending} emoji="🟡" accent="border-amber-400" />
            <MiniStat label="Upcoming Sessions" value={counts.upcoming} emoji="📅" accent="border-sky-400" />
            <MiniStat label="Completed Sessions" value={counts.completed} emoji="✅" accent="border-green-500" />

            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-slate-700">
              <strong>Tip:</strong> Accept or decline session requests promptly. You can mark sessions as completed after they're done.
            </div>
          </section>
        </aside>
      </div>

      {/* Details Modal */}
      {selectedSession && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedSession(null);
          }}
        >
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-auto">
            <div className="mb-4 flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <h2 className="text-xl font-extrabold">Session Details • {selectedSession.id}</h2>
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 transition hover:bg-slate-200"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl border border-black/5 bg-slate-50 p-4">
              <h3 className="mb-3 text-sm font-extrabold">Session Information</h3>

              <KV k="Student" v={selectedSession.student} />
              <KV k="Topic" v={selectedSession.topic} />
              <KV k="Type" v={selectedSession.type} />
              <KV k="Time" v={selectedSession.time} />
              <KV k="Duration" v={selectedSession.duration} />
              <KV k="Status" v={capitalize(selectedSession.status)} />
              <KV k="Note" v={selectedSession.note} />

              <div className="mt-4 flex flex-wrap gap-3">
                {selectedSession.bucket === "requests" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        acceptRequest(selectedSession.id);
                      }}
                      className="rounded-xl bg-teal-400 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-500"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        declineRequest(selectedSession.id);
                      }}
                      className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-bold text-teal-600 transition hover:bg-teal-400 hover:text-white"
                    >
                      Decline
                    </button>
                  </>
                )}

                {selectedSession.bucket === "upcoming" && (
                  <>
                    <button
                      type="button"
                      onClick={() => joinSession(selectedSession.id)}
                      className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                    >
                      Join Session
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        markCompleted(selectedSession.id);
                      }}
                      className="rounded-xl bg-teal-400 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-500"
                    >
                      Mark Completed
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-5 rounded-2xl bg-white px-7 py-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <div className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
                <EduPathLogo />
                <span>EduPath</span>
              </div>

              <p className="mb-4 text-sm leading-6 text-slate-700">
                Empowering learners worldwide with quality education and personalized learning paths.
              </p>

              <div className="flex gap-3">
                <SocialIcon>
                  <FacebookIcon />
                </SocialIcon>
                <SocialIcon>
                  <TwitterIcon />
                </SocialIcon>
                <SocialIcon>
                  <LinkedInIcon />
                </SocialIcon>
                <SocialIcon>
                  <InstagramIcon />
                </SocialIcon>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 md:gap-12">
              <FooterCol
                title="Quick Links"
                links={[
                  { label: "Mentor Guidelines", href: "#" },
                  { label: "Best Practices", href: "#" },
                  { label: "Resources", href: "#" },
                ]}
              />
              <FooterCol
                title="Support"
                links={[
                  { label: "Help Center", href: "#" },
                  { label: "Contact Us", href: "#" },
                  { label: "FAQs", href: "#" },
                ]}
              />
              <FooterCol
                title="Legal"
                links={[
                  { label: "Terms & Conditions", href: "#" },
                  { label: "Privacy Policy", href: "#" },
                  { label: "Cookie Policy", href: "#" },
                ]}
              />
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

/* ----------------- Small UI Components ----------------- */

function Tab({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full border border-teal-400 bg-teal-400 px-3.5 py-2.5 text-xs font-extrabold text-white transition"
          : "rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-extrabold text-teal-600 transition hover:-translate-y-[1px]"
      }
    >
      {children}
    </button>
  );
}

function SessionCard({ session, bucket, onAccept, onDecline, onJoin, onMarkCompleted, onViewDetails }) {
  const badgeClass =
    session.status === "pending"
      ? "bg-amber-100 text-amber-800"
      : session.status === "scheduled"
      ? "bg-sky-100 text-sky-800"
      : session.status === "completed"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  const badgeEmoji =
    session.status === "pending" ? "🟡" : session.status === "scheduled" ? "📅" : session.status === "completed" ? "✅" : "⛔";

  return (
    <div className="rounded-xl border border-black/5 bg-slate-50 p-4 transition hover:translate-x-1 hover:bg-emerald-50 border-l-4 border-l-teal-400">
      <div className="mb-2.5 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="mb-1 text-base font-extrabold">{session.topic}</div>
          <div className="text-sm text-slate-500">
            {session.type} • {session.student}
            <br />
            {session.time} • {session.duration}
          </div>
        </div>

        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold inline-flex items-center gap-1.5 ${badgeClass}`}>
          {badgeEmoji} {capitalize(session.status)}
        </span>
      </div>

      <div className="text-sm text-slate-500">{session.note}</div>

      <div className="mt-3 flex flex-wrap gap-2.5">
        {bucket === "requests" && (
          <>
            <button
              type="button"
              onClick={() => onAccept(session.id)}
              className="rounded-lg bg-teal-400 px-3 py-2 text-[13px] font-extrabold text-white transition hover:bg-teal-500"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => onDecline(session.id)}
              className="rounded-lg border-2 border-teal-400 bg-white px-3 py-2 text-[13px] font-extrabold text-teal-600 transition hover:bg-teal-400 hover:text-white"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => onViewDetails(session.id)}
              className="rounded-lg bg-emerald-100 px-3 py-2 text-[13px] font-extrabold text-teal-600 transition hover:bg-emerald-200"
            >
              View Details
            </button>
          </>
        )}

        {bucket === "upcoming" && (
          <>
            <button
              type="button"
              onClick={() => onJoin(session.id)}
              className="rounded-lg bg-slate-800 px-3 py-2 text-[13px] font-extrabold text-white transition hover:opacity-90 hover:-translate-y-[1px]"
            >
              Join Session
            </button>
            <button
              type="button"
              onClick={() => onViewDetails(session.id)}
              className="rounded-lg bg-emerald-100 px-3 py-2 text-[13px] font-extrabold text-teal-600 transition hover:bg-emerald-200"
            >
              View Details
            </button>
            <button
              type="button"
              onClick={() => onMarkCompleted(session.id)}
              className="rounded-lg bg-teal-400 px-3 py-2 text-[13px] font-extrabold text-white transition hover:bg-teal-500"
            >
              Mark Completed
            </button>
          </>
        )}

        {bucket === "past" && (
          <button
            type="button"
            onClick={() => onViewDetails(session.id)}
            className="rounded-lg bg-emerald-100 px-3 py-2 text-[13px] font-extrabold text-teal-600 transition hover:bg-emerald-200"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value, emoji, accent }) {
  return (
    <div className={`mb-3 flex items-center justify-between rounded-xl border-l-4 ${accent} bg-slate-50 p-4`}>
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-lg font-extrabold">{value}</div>
      </div>
      <div className="text-2xl">{emoji}</div>
    </div>
  );
}

function KV({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 py-2 last:border-b-0">
      <span className="text-sm text-slate-500">{k}</span>
      <span className="text-sm font-extrabold text-slate-800 text-right">{v}</span>
    </div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-800">{title}</h4>
      <div className="flex flex-col gap-2">
        {links.map((l) => (
          <a key={l.label} href={l.href} className="text-sm text-slate-500 hover:text-teal-500">
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function SocialIcon({ children }) {
  return (
    <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-emerald-200 transition hover:-translate-y-0.5 hover:bg-teal-400">
      {children}
    </button>
  );
}

function EduPathLogo() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#5DD9C1" opacity="0.2" />
      <path d="M20 8L12 12L20 16L28 12L20 8Z" fill="#5DD9C1" />
      <path d="M12 20L20 24L28 20" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 26L20 30L28 26" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2" fill="#5DD9C1" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function FacebookIcon() {
  return <span className="text-slate-700">f</span>;
}
function TwitterIcon() {
  return <span className="text-slate-700">t</span>;
}
function LinkedInIcon() {
  return <span className="text-slate-700">in</span>;
}
function InstagramIcon() {
  return <span className="text-slate-700">ig</span>;
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
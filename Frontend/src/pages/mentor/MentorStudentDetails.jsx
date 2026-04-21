import React, { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// ── Mock Data ────────────────────────────────────────────────────
const MOCK_STUDENTS = [
  { id: "S001", name: "Priya Sharma",      track: "Web Development", enrolled: "Jan 12, 2026", email: "priya@example.com", lastActivity: "2 hours ago" },
  { id: "S002", name: "Rahul Mehta",       track: "Data Science & ML", enrolled: "Jan 15, 2026", email: "rahul@example.com", lastActivity: "Yesterday" },
  { id: "S003", name: "Anjali Kumar",      track: "React & TypeScript", enrolled: "Feb 02, 2026", email: "anjali@example.com", lastActivity: "3 days ago" },
  { id: "S004", name: "Nimal Perera",      track: "Networking", enrolled: "Feb 10, 2026", email: "nimal@example.com", lastActivity: "1 week ago" },
  { id: "S005", name: "Sahana Jayasinghe", track: "Web Development", enrolled: "Feb 18, 2026", email: "sahana@example.com", lastActivity: "Just now" },
  { id: "S006", name: "Kavindu Fernando",  track: "Web Development", enrolled: "Feb 20, 2026", email: "kavindu@example.com", lastActivity: "4 hours ago" },
];

const MOCK_SESSIONS = [
  {
    id: "SESS-301",
    studentId: "S001",
    topic: "Resume Review & Internship Plan",
    date: "Feb 10, 2026",
    time: "4:00 PM - 4:30 PM",
    duration: "30 mins",
    discussed: [
      "Reviewed CV structure and identified key projects to highlight.",
      "Discussed internship application strategy for summer 2026.",
      "Identified 3 companies for early application."
    ],
    mentorNotes: "Student is well-prepared. Needs to focus more on project descriptions.",
    status: "completed"
  },
  {
    id: "SESS-305",
    studentId: "S001",
    topic: "React State Management Deep Dive",
    date: "Feb 18, 2026",
    time: "2:00 PM - 3:00 PM",
    duration: "1 hour",
    discussed: [
      "Explained UseContext vs Redux for large scale apps.",
      "Debugged a prop drilling issue in her current project.",
      "Introduced React Query for server state."
    ],
    mentorNotes: "Understands hooks well. Needs practice with asynchronous actions.",
    status: "completed"
  },
  {
    id: "SESS-302",
    studentId: "S002",
    topic: "Intro to ML Roadmap",
    date: "Feb 8, 2026",
    time: "6:00 PM - 6:45 PM",
    duration: "45 mins",
    discussed: [
      "Defined learning goals for the next 3 months.",
      "Selected 'Predictive Maintenance' as the first project idea.",
      "Discussed math requirements for deep learning."
    ],
    mentorNotes: "Strong math background. Excited to start with Scikit-learn.",
    status: "completed"
  }
];

export default function MentorStudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const student = useMemo(() => MOCK_STUDENTS.find(s => s.id === id), [id]);
  const sessions = useMemo(() => MOCK_SESSIONS.filter(s => s.studentId === id), [id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Student not found</h2>
          <button onClick={() => navigate("/MentorStudents")} className="mt-4 text-teal-500 hover:underline">
            Back to Student List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-200 to-teal-300 p-5 text-slate-800">
      {/* Header */}
      <header className="mb-5 flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <EduPathLogo />
          <span>EduPath</span>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
          <Link to="/MentorDashboard" className="font-medium text-slate-800 transition-colors hover:text-teal-500">Dashboard</Link>
          <Link to="/MentorStudents"  className="font-medium text-teal-500">My Students</Link>
          <Link to="/MentorSessions"  className="font-medium text-slate-800 transition-colors hover:text-teal-500">Sessions</Link>
          <Link to="/MentorResources" className="font-medium text-slate-800 transition-colors hover:text-teal-500">Resources</Link>
          <Link to="/MentorMessages"   className="font-medium text-slate-800 transition-colors hover:text-teal-500">Messages</Link>
          <Link to="/MentorProfile"   className="font-medium text-slate-800 transition-colors hover:text-teal-500">Profile</Link>
        </nav>

        <div className="w-[150px] flex justify-end">
          <button type="button" onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white">
            <LogoutIcon /> Logout
          </button>
        </div>
      </header>

      {/* Back Button */}
      <button 
        onClick={() => navigate("/MentorStudents")} 
        className="mb-6 inline-flex items-center gap-2 rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-bold text-teal-600 transition hover:bg-teal-400 hover:text-white shadow-sm"
      >
        <BackIcon /> Back to Student List
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Student Profile Card */}
        <aside className="lg:col-span-1">
          <div className="rounded-3xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 grid h-24 w-24 place-items-center rounded-full bg-teal-100 text-3xl font-bold text-teal-600 ring-4 ring-teal-50">
                {student.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h1 className="text-2xl font-extrabold">{student.name}</h1>
              <p className="text-teal-500 font-bold">{student.track}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                 <button 
                  onClick={() => navigate("/MentorMessages", { state: { studentId: student.id } })}
                  className="rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-teal-500 shadow-md">
                  Message Student
                </button>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <InfoRow label="Email" value={student.email} />
              <InfoRow label="Enrolled" value={student.enrolled} />
              <InfoRow label="Last Activity" value={student.lastActivity} />
              <InfoRow label="ID" value={student.id} />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-2 space-y-6">
          {/* Session History */}
          <section className="rounded-3xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h2 className="mb-6 text-xl font-extrabold flex items-center gap-2">
              <HistoryIcon /> Session History
            </h2>

            {sessions.length > 0 ? (
              <div className="space-y-8">
                {sessions.map((sess, idx) => (
                  <div key={sess.id} className="relative pl-8 before:absolute before:left-0 before:top-2 before:h-full before:w-[2px] before:bg-slate-100 last:before:hidden">
                    <div className="absolute left-[-5px] top-1.5 h-3 w-3 rounded-full bg-teal-400 ring-4 ring-teal-50"></div>
                    
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-extrabold text-slate-800">{sess.topic}</h3>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-teal-700">
                        {sess.date}
                      </span>
                    </div>
                    
                    <div className="mb-4 text-sm font-bold text-slate-500 flex items-center gap-4">
                      <span className="flex items-center gap-1"><ClockIcon /> {sess.time}</span>
                      <span className="flex items-center gap-1"><TimerIcon /> {sess.duration}</span>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5">
                      <div className="mb-3">
                        <h4 className="text-sm font-extrabold text-slate-700 mb-2 uppercase tracking-wider">Previously Discussed:</h4>
                        <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-600">
                          {sess.discussed.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-700 mb-1 uppercase tracking-wider">Mentor Notes:</h4>
                        <p className="text-sm text-slate-600 italic">"{sess.mentorNotes}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <p>No previous sessions recorded for this student.</p>
              </div>
            )}
          </section>

          {/* Other Details or Upcoming Tasks could go here */}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-8 rounded-2xl bg-white px-7 py-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="">
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

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <span className="text-sm font-bold text-slate-800 text-right">{value}</span>
    </div>
  );
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
function FacebookIcon()  { return <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M22 12.073C22 6.504 17.523 2 12 2S2 6.504 2 12.073c0 5.016 3.657 9.175 8.438 9.927v-7.025H7.898v-2.902h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.095 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.562v1.874h2.773l-.443 2.902h-2.33V22C18.343 21.248 22 17.089 22 12.073z"/></svg>; }
function TwitterIcon()   { return <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 8.09V9a10.66 10.66 0 01-9-4.5s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>; }
function LinkedInIcon()  { return <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.984V9h3.108v1.561h.046c.433-.82 1.494-1.684 3.074-1.684 3.287 0 3.894 2.164 3.894 4.977v6.598zM5.337 7.433a1.96 1.96 0 110-3.92 1.96 1.96 0 010 3.92zM6.919 20.452H3.756V9h3.163v11.452z"/></svg>; }
function InstagramIcon() { return <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M7 2C4.8 2 3 3.8 3 6v12c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4V6c0-2.2-1.8-4-4-4H7zm5 5a5 5 0 110 10 5 5 0 010-10zm6.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0zM12 9a3 3 0 100 6 3 3 0 000-6z"/></svg>; }
function LogoutIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>;
}
function BackIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
}
function HistoryIcon() {
  return <svg className="h-5 w-5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
function ClockIcon() {
  return <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
function TimerIcon() {
  return <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
}

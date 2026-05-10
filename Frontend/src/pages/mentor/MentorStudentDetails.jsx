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
          <button onClick={() => navigate("/mentor/students")} className="mt-4 text-teal-500 hover:underline">
            Back to Student List
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Back Button */}
      <button 
        onClick={() => navigate("/mentor/students")} 
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
                  onClick={() => navigate("/mentor/messages", { state: { studentId: student.id } })}
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
    </>
  );
}

/* ── Small reusable components ─────────────────────────────────── */
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <span className="text-sm font-bold text-slate-800 text-right">{value}</span>
    </div>
  );
}

/* ── SVG Icons ─────────────────────────────────────────────────── */
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

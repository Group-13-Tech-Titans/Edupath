import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentById } from "../../api/mentorApi.js";

export default function MentorStudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchStudentData();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const data = await getStudentById(id);
      setStudent(data);
    } catch (err) {
      console.error("Failed to fetch student details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeSessionModal = () => setSelectedSession(null);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-500"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-slate-50 rounded-3xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">Student not found</h2>
          <p className="text-slate-500 mt-2">{error || "The student you're looking for doesn't exist or you don't have access."}</p>
          <button onClick={() => navigate("/mentor/students")} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-teal-500 transition-all">
            Back to Student List
          </button>
        </div>
      </div>
    );
  }

  const sessions = student.sessions || [];

  return (
    <>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-bold text-teal-600 transition hover:bg-teal-400 hover:text-white shadow-sm"
      >
        <BackIcon /> Back
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Student Profile Card */}
        <aside className="lg:col-span-1">
          <div className="rounded-3xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 grid h-24 w-24 place-items-center rounded-full bg-teal-100 text-3xl font-bold text-teal-600 ring-4 ring-teal-50">
                {student.name?.split(' ').map(n => n[0]).join('') || "S"}
              </div>
              <h1 className="text-2xl font-extrabold text-slate-800">{student.name}</h1>
              <p className="text-teal-500 font-bold">{student.track || student.field || "Student"}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => navigate("/mentor/messages", { state: { studentId: student.studentId || student._id || student.id } })}
                  className="rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-teal-500 shadow-md">
                  Message Student
                </button>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <InfoRow label="Email" value={student.email} />
              <InfoRow label="Role" value={student.role} />
              <InfoRow label="Status" value="Active" />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-2 space-y-6">
          {/* Stats / Overview */}
          <section className="rounded-3xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h2 className="mb-6 text-xl font-extrabold flex items-center gap-2 text-slate-800">
              <HistoryIcon /> Student Overview
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Sessions</p>
                <p className="text-lg font-bold text-slate-700">{sessions.length}</p>
              </div>
            </div>
          </section>

          {/* Session History */}
          <section className="rounded-3xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h2 className="mb-6 text-xl font-extrabold text-slate-800">Session History</h2>
            {sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map(session => (
                  <div key={session._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                        <HistoryIcon />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{session.topic || session.field || "Mentorship Session"}</p>
                        <p className="text-xs text-slate-500">{session.type || "One-on-One"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                          session.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                            'bg-slate-200 text-slate-600'
                        }`}>
                        {session.status}
                      </span>
                      <button
                        onClick={() => setSelectedSession(session)}
                        className="rounded-xl border-2 border-teal-400 bg-white px-4 py-1.5 text-xs font-bold text-teal-600 hover:bg-teal-400 hover:text-white transition-all shadow-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm py-4">No sessions found with this student.</p>
            )}
          </section>

          {/* Shared Resources */}
          <section className="rounded-3xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h2 className="mb-6 text-xl font-extrabold text-slate-800">Shared Resources</h2>
            {student.resources?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {student.resources.map(resource => (
                  <div key={resource._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-slate-800 truncate">{resource.title}</p>
                      <p className="text-xs text-slate-500 mb-2">{resource.type}</p>
                    </div>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-teal-500 hover:underline">
                      View Link →
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm py-4">No resources shared yet.</p>
            )}
          </section>
        </main>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeSessionModal}>
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-slate-800">Session Details</h3>
              <button onClick={closeSessionModal} className="text-slate-400 hover:text-slate-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-5">
              <ModalRow label="Topic" value={selectedSession.topic || "Mentorship Session"} />
              <ModalRow label="Type" value={selectedSession.type} />
              <ModalRow label="Date" value={selectedSession.scheduledDate || "Not scheduled"} />
              <ModalRow label="Time" value={selectedSession.scheduledTime || selectedSession.proposedTime || "Not set"} />
              <ModalRow label="Status" value={<span className="uppercase font-black text-[10px] px-2 py-1 bg-teal-100 text-teal-600 rounded-full">{selectedSession.status}</span>} />

              {selectedSession.meetingLink && (
                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Meeting Link</p>
                  <a href={selectedSession.meetingLink} target="_blank" rel="noreferrer" className="block truncate text-sm font-bold text-teal-500 hover:underline bg-teal-50 p-3 rounded-xl border border-teal-100">
                    {selectedSession.meetingLink}
                  </a>
                </div>
              )}

              <div className="pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notes</p>
                <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {selectedSession.note || selectedSession.mentorNotes || "No notes available."}
                </div>
              </div>
            </div>

            <button onClick={closeSessionModal} className="mt-8 w-full rounded-2xl bg-slate-800 py-4 text-sm font-bold text-white transition hover:bg-slate-900 shadow-lg shadow-slate-200">
              Close Details
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ModalRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-800">{value}</span>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <span className="text-sm font-bold text-slate-800 text-right">{value}</span>
    </div>
  );
}

function BackIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
}

function HistoryIcon() {
  return <svg className="h-5 w-5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}

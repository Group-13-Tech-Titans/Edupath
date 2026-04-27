import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppProvider.jsx";

export default function MentorSessions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, acceptMentorRequest, rejectMentorRequest, completeMentorSession } = useApp();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab");

  const [activeTab, setActiveTab] = useState(
    initialTab === "requests" || initialTab === "upcoming" || initialTab === "past"
      ? initialTab
      : "requests"
  );
  
  const [selectedSession, setSelectedSession] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptForm, setAcceptForm] = useState({
    date: "",
    time: "",
    meetingLink: ""
  });

  const mentorRequests = state.mentorRequests || [];

  const buckets = useMemo(() => {
    return {
      requests: mentorRequests.filter(r => r.status === "pending"),
      upcoming: mentorRequests.filter(r => r.status === "scheduled"),
      past: mentorRequests.filter(r => r.status === "completed" || r.status === "declined"),
    };
  }, [mentorRequests]);

  const counts = useMemo(() => {
    return {
      pending: buckets.requests.length,
      upcoming: buckets.upcoming.length,
      completed: buckets.past.filter(r => r.status === "completed").length,
    };
  }, [buckets]);

  const currentItems = useMemo(() => {
    return buckets[activeTab] || [];
  }, [buckets, activeTab]);

  const handleAcceptClick = (session) => {
    setSelectedSession(session);
    setShowAcceptModal(true);
  };

  const handleConfirmAccept = (e) => {
    e.preventDefault();
    if (!acceptForm.date || !acceptForm.time || !acceptForm.meetingLink) {
      alert("Please fill in all details.");
      return;
    }
    acceptMentorRequest(selectedSession.id, {
      scheduledDate: acceptForm.date,
      scheduledTime: acceptForm.time,
      meetingLink: acceptForm.meetingLink
    });
    setShowAcceptModal(false);
    setAcceptForm({ date: "", time: "", meetingLink: "" });
    setSelectedSession(null);
    alert("Session accepted and scheduled!");
  };

  const handleReject = (id) => {
    if (window.confirm("Are you sure you want to reject this request?")) {
      rejectMentorRequest(id);
      alert("Request rejected. Student will be notified.");
    }
  };

  const handleComplete = (id) => {
    if (window.confirm("Mark this session as completed?")) {
      completeMentorSession(id);
      alert("Session completed! Moving to history.");
    }
  };

  const joinSession = (link) => {
    if (link) {
      window.open(link, "_blank");
    } else {
      alert("Meeting link not found.");
    }
  };

  return (
    <>
      {/* Page Header */}
      <section className="mb-5 flex flex-col justify-between gap-4 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold">My Sessions</h1>
          <p className="mt-1 text-sm text-slate-500">Manage session requests, schedule meetings, and track your mentoring history.</p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2.1fr_1fr]">
        {/* Main Content */}
        <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl font-extrabold">Sessions</h2>
          </div>

          {/* Tabs */}
          <div className="mb-5 flex gap-2.5 flex-wrap border-b-2 border-slate-200 pb-2.5">
            <Tab active={activeTab === "requests"} onClick={() => setActiveTab("requests")}>
              Session Requests ({counts.pending})
            </Tab>
            <Tab active={activeTab === "upcoming"} onClick={() => setActiveTab("upcoming")}>
              Upcoming Sessions ({counts.upcoming})
            </Tab>
            <Tab active={activeTab === "past"} onClick={() => setActiveTab("past")}>
              Past & Rejected
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
                  onAccept={() => handleAcceptClick(s)}
                  onDecline={() => handleReject(s.id)}
                  onJoin={() => joinSession(s.meetingLink)}
                  onComplete={() => handleComplete(s.id)}
                  onViewDetails={() => setSelectedSession(s)}
                />
              ))
            ) : (
              <div className="text-sm text-slate-500">No sessions here yet.</div>
            )}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="flex flex-col gap-5">
          <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="mb-5 text-lg font-extrabold">Session Overview</div>

            <MiniStat label="Pending Requests" value={counts.pending} accent="border-amber-400" />
            <MiniStat label="Upcoming Sessions" value={counts.upcoming} accent="border-sky-400" />
            <MiniStat label="Completed Sessions" value={counts.completed} accent="border-green-500" />

            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-slate-700">
              <strong>Tip:</strong> When you accept a request, you can set the specific date, time, and meeting link for the student.
            </div>
          </section>
        </aside>
      </div>

      {/* Accept & Schedule Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-extrabold mb-4 border-b pb-3">Schedule Session</h2>
            <p className="text-xs text-muted mb-4">Accept request from <b>{selectedSession?.fullName}</b> for <b>{selectedSession?.topic || selectedSession?.field}</b></p>
            
            <form onSubmit={handleConfirmAccept} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full mt-1 rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-teal-400"
                  value={acceptForm.date}
                  onChange={e => setAcceptForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Time</label>
                <input 
                  type="time" 
                  required
                  className="w-full mt-1 rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-teal-400"
                  value={acceptForm.time}
                  onChange={e => setAcceptForm(f => ({ ...f, time: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Meeting Link (Zoom/Google Meet)</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://meet.google.com/..."
                  className="w-full mt-1 rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-teal-400"
                  value={acceptForm.meetingLink}
                  onChange={e => setAcceptForm(f => ({ ...f, meetingLink: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 rounded-xl bg-teal-400 py-3 text-sm font-bold text-white hover:bg-teal-500">
                  Confirm & Schedule
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAcceptModal(false)}
                  className="flex-1 rounded-xl border-2 border-slate-300 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedSession && !showAcceptModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedSession(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-extrabold">Session Details</h2>
              <button onClick={() => setSelectedSession(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="space-y-3">
              <KV k="Student" v={selectedSession.fullName} />
              <KV k="Field" v={selectedSession.field} />
              <KV k="Type" v={selectedSession.sessionType} />
              <KV k="Duration" v={selectedSession.duration} />
              <KV k="Status" v={capitalize(selectedSession.status)} />
              {selectedSession.status === "scheduled" && (
                <>
                  <KV k="Scheduled Date" v={selectedSession.scheduledDate} />
                  <KV k="Scheduled Time" v={selectedSession.scheduledTime} />
                  <KV k="Meeting Link" v={<a href={selectedSession.meetingLink} target="_blank" rel="noreferrer" className="text-teal-600 underline">{selectedSession.meetingLink}</a>} />
                </>
              )}
              <div className="pt-2">
                <label className="text-xs text-slate-500 block mb-1">Student Notes:</label>
                <div className="text-sm bg-slate-50 p-3 rounded-xl border">{selectedSession.notes || "No notes provided."}</div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {selectedSession.status === "pending" && (
                <button onClick={() => handleAcceptClick(selectedSession)} className="flex-1 bg-teal-400 text-white font-bold py-3 rounded-xl hover:bg-teal-500">Accept</button>
              )}
              {selectedSession.status === "scheduled" && (
                <>
                  <button onClick={() => joinSession(selectedSession.meetingLink)} className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl hover:opacity-90">Join Meeting</button>
                  <button onClick={() => { handleComplete(selectedSession.id); setSelectedSession(null); }} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600">Complete</button>
                </>
              )}
              <button onClick={() => setSelectedSession(null)} className="flex-1 border-2 border-slate-300 font-bold py-3 rounded-xl hover:bg-slate-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Tab({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full border border-teal-400 bg-teal-400 px-4 py-2 text-xs font-extrabold text-white"
          : "rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-extrabold text-teal-600 hover:bg-emerald-100"
      }
    >
      {children}
    </button>
  );
}

function SessionCard({ session, bucket, onAccept, onDecline, onJoin, onComplete, onViewDetails }) {
  const badgeClass =
    session.status === "pending" ? "bg-amber-100 text-amber-800" :
    session.status === "scheduled" ? "bg-sky-100 text-sky-800" :
    session.status === "completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";

  return (
    <div className="rounded-xl border border-black/5 bg-slate-50 p-4 border-l-4 border-l-teal-400 hover:bg-emerald-50 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-extrabold text-base">{session.topic || session.field}</div>
          <div className="text-xs text-slate-500 mt-0.5">{session.fullName} • {session.sessionType}</div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${badgeClass}`}>
          {session.status}
        </span>
      </div>

      {session.status === "scheduled" && (
        <div className="mb-3 text-xs bg-white/60 p-2 rounded-lg border border-teal-100">
          <div className="flex gap-4">
            <span>📅 <b>{session.scheduledDate}</b></span>
            <span>⏰ <b>{session.scheduledTime}</b></span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {bucket === "requests" && (
          <>
            <button onClick={onAccept} className="bg-teal-400 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-teal-500">Accept</button>
            <button onClick={onDecline} className="border border-teal-400 text-teal-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-teal-50">Decline</button>
          </>
        )}
        {bucket === "upcoming" && (
          <>
            <button onClick={onJoin} className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90">Join Session</button>
            <button onClick={onComplete} className="bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-600">Complete</button>
          </>
        )}
        <button onClick={onViewDetails} className="bg-white border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-50">Details</button>
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }) {
  return (
    <div className={`mb-3 flex items-center justify-between rounded-xl border-l-4 ${accent} bg-slate-50 p-4`}>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-lg font-extrabold">{value}</div>
      </div>
    </div>
  );
}

function KV({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0">
      <span className="text-xs text-slate-500">{k}</span>
      <span className="text-xs font-bold text-slate-800">{v}</span>
    </div>
  );
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import MentorProfileModal from "../../components/MentorProfileModal.jsx";
import { getSpecializations } from "../../api/specializationApi.js";

export default function StudentMentor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, currentUser, saveMentorRequest, getMentorsByField } = useApp();
  
  const [form, setForm] = useState({
    fullName: currentUser?.name || "",
    email: currentUser?.email || "",
    field: "",
    sessionType: "",
    mentorId: "",
    duration: "",
    notes: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const [availableMentors, setAvailableMentors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);
  const [selectedMentorForProfile, setSelectedMentorForProfile] = useState(null);

  // Notifications / My Requests
  const myRequests = useMemo(() => {
    return (state.mentorRequests || []);
  }, [state.mentorRequests]);

  const filteredRequests = useMemo(() => {
    if (activeTab === "all") return myRequests;
    if (activeTab === "pending") return myRequests.filter(r => r.status === "pending");
    if (activeTab === "accepted") return myRequests.filter(r => r.status === "scheduled");
    if (activeTab === "completed") return myRequests.filter(r => r.status === "completed");
    if (activeTab === "rejected") return myRequests.filter(r => r.status === "declined");
    return myRequests;
  }, [myRequests, activeTab]);

  const stats = useMemo(() => {
    return {
        total: myRequests.length,
        pending: myRequests.filter(r => r.status === "pending").length,
        accepted: myRequests.filter(r => r.status === "scheduled").length,
        completed: myRequests.filter(r => r.status === "completed").length,
        rejected: myRequests.filter(r => r.status === "declined").length,
    };
  }, [myRequests]);

  // Handle field change and fetch mentors
  useEffect(() => {
    if (form.field) {
      setIsLoadingMentors(true);
      getMentorsByField(form.field).then(data => {
        setAvailableMentors(data || []);
        setIsLoadingMentors(false);
      }).catch(() => {
        setIsLoadingMentors(false);
      });
    } else {
      setAvailableMentors([]);
    }
  }, [form.field, getMentorsByField]);

  // Handle pre-selected mentor
  useEffect(() => {
    if (location.state?.selectedMentorId) {
      setForm(prev => ({
        ...prev,
        mentorId: location.state.selectedMentorId,
        field: location.state.selectedField || ""
      }));
    }
  }, [location.state]);

  // Fetch specializations for dropdown
  useEffect(() => {
    getSpecializations()
      .then(data => {
        if (data) setSpecializations(data);
      })
      .catch(err => console.error("Failed to fetch specializations:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === "field" ? { mentorId: "" } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.mentorId) {
      alert("Please select a mentor.");
      return;
    }
    const selectedMentor = availableMentors.find(m => m.userId === form.mentorId);
    
    const requestPayload = {
      mentorId: form.mentorId,
      mentorName: selectedMentor?.name || "Mentor",
      topic: form.field,
      type: form.sessionType,
      duration: form.duration,
      note: form.notes,
      proposedTime: "As scheduled by mentor" // This was proposedTime in backend, but mentor now sets it
    };

    const res = await saveMentorRequest(requestPayload);
    if (res.success) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setForm(f => ({ ...f, field: "", mentorId: "", notes: "" }));
    } else {
      alert("Failed to send request: " + res.message);
    }
  };

  return (
    <PageShell>
      <div className="-mx-4 -my-6 min-h-screen bg-gradient-to-br from-emerald-200 to-teal-300 p-6">
        <div className="mx-auto max-w-7xl">
            
            {/* Page Header */}
            <section className="mb-5 flex flex-col justify-between gap-4 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2c3e50]">Mentorship & Guidance</h1>
                    <p className="mt-1 text-sm text-[#7f8c8d]">Connect with industry experts, schedule sessions, and track your progress.</p>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2.1fr_1fr]">
                
                {/* LEFT COLUMN */}
                <div className="flex flex-col gap-5">
                    
                    {/* MY SESSIONS SECTION */}
                    <section className="rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                        <h2 className="mb-5 text-xl font-extrabold text-[#2c3e50]">Session Requests</h2>

                        {/* Tabs */}
                        <div className="mb-5 flex gap-2.5 flex-wrap border-b-2 border-slate-200 pb-2.5">
                            <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All ({stats.total})</Tab>
                            <Tab active={activeTab === "pending"} onClick={() => setActiveTab("pending")}>Pending ({stats.pending})</Tab>
                            <Tab active={activeTab === "accepted"} onClick={() => setActiveTab("accepted")}>Accepted ({stats.accepted})</Tab>
                            <Tab active={activeTab === "completed"} onClick={() => setActiveTab("completed")}>Completed ({stats.completed})</Tab>
                            <Tab active={activeTab === "rejected"} onClick={() => setActiveTab("rejected")}>Rejected ({stats.rejected})</Tab>
                        </div>

                        {/* List */}
                        <div className="flex flex-col gap-4">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map(req => (
                                    <div key={req.id} className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm hover:border-[#5DD9C1]/50">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm ${
                                                    req.status === "scheduled" ? "bg-emerald-50 text-[#5DD9C1] border border-emerald-100" :
                                                    req.status === "completed" ? "bg-blue-50 text-blue-500 border border-blue-100" :
                                                    req.status === "declined" ? "bg-red-50 text-red-500 border border-red-100" :
                                                    "bg-amber-50 text-amber-500 border border-amber-100"
                                                }`}>
                                                    {req.status === "scheduled" ? <CheckIcon /> : 
                                                     req.status === "completed" ? <CompletedIcon /> : 
                                                     req.status === "declined" ? <XIcon /> : 
                                                     <ClockIcon />}
                                                </div>
                                                <div>
                                                    <h4 className="text-[17px] font-bold text-[#2c3e50]">{req.mentorName}</h4>
                                                    <p className="text-[13px] font-semibold text-[#7f8c8d] uppercase tracking-wider">{req.field} • {req.sessionType}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:items-end gap-3">
                                                {req.status === "scheduled" ? (
                                                    <div className="flex flex-col md:flex-row md:items-center gap-4 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 flex-1 px-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Date</span>
                                                                <span className="text-xs font-black text-[#2c3e50]">{req.scheduledDate || "TBD"}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Time</span>
                                                                <span className="text-xs font-black text-[#2c3e50]">{req.scheduledTime || "TBD"}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 max-w-[200px]">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Link</span>
                                                                <span className="text-[11px] font-bold text-[#5DD9C1] truncate">{req.meetingLink || "TBD"}</span>
                                                            </div>
                                                        </div>
                                                        {req.meetingLink && (
                                                            <a href={req.meetingLink} target="_blank" rel="noreferrer" className="bg-[#5DD9C1] hover:bg-[#4bcbb0] text-white px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md transition-all whitespace-nowrap">
                                                                Join Session
                                                            </a>
                                                        )}
                                                        <button 
                                                            onClick={() => navigate("/student/messages", { state: { mentorId: req.mentorId } })}
                                                            className="bg-white border-2 border-[#5DD9C1] text-[#5DD9C1] hover:bg-[#5DD9C1] hover:text-white px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-sm transition-all whitespace-nowrap"
                                                        >
                                                            Message Mentor
                                                        </button>
                                                    </div>
                                                ) : req.status === "completed" ? (
                                                    <div className="flex flex-col md:flex-row md:items-center gap-4 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                                                        <div className="flex-1">
                                                            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-widest text-center md:text-right">History</p>
                                                            <p className="text-sm font-extrabold text-blue-600">Session Successfully Completed</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => navigate("/student/messages", { state: { mentorId: req.mentorId } })}
                                                            className="bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-sm transition-all whitespace-nowrap"
                                                        >
                                                            Chat History
                                                        </button>
                                                    </div>
                                                ) : req.status === "declined" ? (
                                                    <div className="bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                                                        <p className="text-[11px] font-bold text-red-700 uppercase tracking-widest text-center md:text-right">Notification</p>
                                                        <p className="text-sm font-extrabold text-red-600">The mentor has rejected this request.</p>
                                                    </div>
                                                ) : (
                                                    <div className="bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                                                        <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest text-center md:text-right">Status</p>
                                                        <p className="text-sm font-extrabold text-amber-600">Awaiting Mentor Response</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-[#7f8c8d] text-center py-8 font-medium">No requests in this category.</p>
                            )}
                        </div>
                    </section>

                    {/* BOOKING FORM SECTION */}
                    <section className="rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                        <h2 className="mb-6 text-xl font-extrabold text-[#2c3e50]">New Session Request</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <FormGroup label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required />
                                <FormGroup label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
                                
                                {form.mentorId && (
                                    <div className="md:col-span-2 p-4 bg-[#5DD9C1]/5 rounded-2xl border border-[#5DD9C1]/20 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#5DD9C1] shadow-sm">
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-[#5DD9C1] uppercase tracking-widest">Mentor Contact Email</p>
                                                <p className="text-[15px] font-bold text-[#2c3e50]">
                                                    {availableMentors.find(m => m.userId === form.mentorId)?.email || "Contact details available upon selection"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[14px] font-semibold text-[#7f8c8d]">Field / specialization</label>
                                    <select name="field" value={form.field} onChange={handleChange} required className="w-full rounded-xl border border-[#e0e0e0] bg-white px-4 py-3 text-[15px] font-semibold text-[#2c3e50] outline-none focus:border-[#5DD9C1] transition-all">
                                        <option value="">Select Field</option>
                                        {specializations.map(spec => (
                                          <option key={spec._id} value={spec.name}>{spec.name}</option>
                                        ))}
                                        {!specializations.length && (
                                          <>
                                            <option>Web Development</option>
                                            <option>Data Science</option>
                                            <option>Design</option>
                                            <option>Career Guidance</option>
                                          </>
                                        )}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[14px] font-semibold text-[#7f8c8d]">Session type</label>
                                    <select name="sessionType" value={form.sessionType} onChange={handleChange} required className="w-full rounded-xl border border-[#e0e0e0] bg-white px-4 py-3 text-[15px] font-semibold text-[#2c3e50] outline-none focus:border-[#5DD9C1] transition-all">
                                        <option value="">Select Type</option>
                                        <option>Portfolio review</option>
                                        <option>Mock interview</option>
                                        <option>Career planning</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>

                            {form.field && (
                                <div className="space-y-3">
                                    <label className="text-[14px] font-bold text-[#5DD9C1] uppercase tracking-widest">Select Mentor</label>
                                    <div className="grid gap-3">
                                        {availableMentors.map(m => (
                                            <div key={m._id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                                                form.mentorId === m.userId ? "border-[#5DD9C1] bg-[#5DD9C1]/5 shadow-sm" : "border-slate-100 hover:border-slate-200"
                                            }`}>
                                                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => setForm(f => ({ ...f, mentorId: m.userId }))}>
                                                    <img src={m.avatar || "https://via.placeholder.com/150"} alt={m.name} className="h-12 w-12 rounded-full object-cover border-2 border-[#5DD9C1]/30" />
                                                    <div>
                                                        <p className="font-bold text-[#2c3e50] text-[15px]">{m.name}</p>
                                                        <p className="text-[12px] text-[#5DD9C1] font-bold uppercase tracking-wide">{m.subjectField || m.title}</p>
                                                        <p className="text-[12px] text-[#7f8c8d]">{m.email}</p>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => setSelectedMentorForProfile(m)} className="text-[11px] font-bold uppercase text-[#5DD9C1] hover:underline px-3 py-1">
                                                    View Profile
                                                </button>
                                            </div>
                                        ))}
                                        {availableMentors.length === 0 && !isLoadingMentors && (
                                            <p className="text-sm text-slate-500 py-4 text-center border-2 border-dashed rounded-xl">No mentors found for this field.</p>
                                        )}
                                        {isLoadingMentors && (
                                            <p className="text-sm text-slate-500 py-4 text-center">Searching for mentors...</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[14px] font-semibold text-[#7f8c8d]">Duration</label>
                                    <select name="duration" value={form.duration} onChange={handleChange} required className="w-full rounded-xl border border-[#e0e0e0] bg-white px-4 py-3 text-[15px] font-semibold text-[#2c3e50] outline-none focus:border-[#5DD9C1] transition-all">
                                        <option value="">Select Duration</option>
                                        <option>30 min</option>
                                        <option>60 min</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[14px] font-semibold text-[#7f8c8d]">Notes for Mentor</label>
                                <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} className="w-full rounded-xl border border-[#e0e0e0] bg-white px-4 py-3 text-[15px] font-medium text-[#2c3e50] outline-none focus:border-[#5DD9C1] transition-all resize-none" placeholder="Describe your goals..." />
                            </div>

                            <button type="submit" className="w-full bg-[#5DD9C1] hover:bg-[#4bcbb0] text-white py-3.5 rounded-full font-bold text-[15px] shadow-lg shadow-[#5DD9C1]/20 transition-all">
                                Send Request
                            </button>
                            {submitted && <p className="text-center text-sm font-bold text-emerald-600 uppercase tracking-widest">✓ Request Submitted</p>}
                        </form>
                    </section>
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex flex-col gap-5">
                    
                    {/* Stats */}
                    <section className="rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                        <h3 className="mb-5 text-lg font-extrabold text-[#2c3e50]">Session Overview</h3>
                        <div className="flex flex-col gap-3">
                            <MiniStat label="Pending" value={stats.pending} color="border-amber-400" />
                            <MiniStat label="Upcoming" value={stats.accepted} color="border-emerald-400" />
                            <MiniStat label="Completed" value={stats.completed} color="border-blue-400" />
                            <MiniStat label="Total History" value={stats.total} color="border-sky-400" />
                        </div>
                    </section>

                    {/* How it works */}
                    <section className="rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                        <h3 className="mb-5 text-lg font-extrabold text-[#2c3e50]">Guidance</h3>
                        <div className="space-y-4 text-sm font-medium text-[#7f8c8d]">
                            <div className="flex gap-3">
                                <span className="text-[#5DD9C1] font-bold">1.</span>
                                <span>Find a mentor who matches your career goals and specialized field.</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-[#5DD9C1] font-bold">2.</span>
                                <span>Submit your request. The mentor will review it within 24 hours.</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-[#5DD9C1] font-bold">3.</span>
                                <span>Once accepted, the session link and time will appear in your dashboard.</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
      </div>

      <MentorProfileModal 
        mentor={selectedMentorForProfile}
        isOpen={!!selectedMentorForProfile}
        onClose={() => setSelectedMentorForProfile(null)}
        onSelect={(mid) => setForm(f => ({ ...f, mentorId: mid }))}
      />
    </PageShell>
  );
}

/* ----------------- Sub-Components ----------------- */
function Tab({ active, onClick, children }) {
    return (
        <button onClick={onClick} className={`px-4 py-2 text-[14px] font-bold transition-all border-b-2 ${
            active ? "border-[#5DD9C1] text-[#2c3e50]" : "border-transparent text-[#7f8c8d] hover:text-[#5DD9C1]"
        }`}>
            {children}
        </button>
    );
}

function MiniStat({ label, value, color }) {
    return (
        <div className={`flex justify-between items-center p-4 rounded-xl bg-slate-50 border-l-4 ${color}`}>
            <span className="text-[13px] font-semibold text-[#7f8c8d] uppercase tracking-widest">{label}</span>
            <span className="text-lg font-extrabold text-[#2c3e50]">{value}</span>
        </div>
    );
}

function FormGroup({ label, ...props }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[14px] font-semibold text-[#7f8c8d]">{label}</label>
            <input {...props} className="w-full rounded-xl border border-[#e0e0e0] bg-white px-4 py-3 text-[15px] font-semibold text-[#2c3e50] outline-none focus:border-[#5DD9C1] transition-all" />
        </div>
    );
}

/* ----------------- Icons ----------------- */
function CheckIcon() {
    return (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function CompletedIcon() {
    return (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    );
}

function XIcon() {
    return (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

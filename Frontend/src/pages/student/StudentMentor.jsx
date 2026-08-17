import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import MentorProfileModal from "../../components/MentorProfileModal.jsx";
import { getSpecializations } from "../../api/specializationApi.js";
import { getMyResources } from "../../api/mentorApi.js";

export default function StudentMentor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, currentUser, saveMentorRequest, getMentorsByField } = useApp(); // Kept existing functionality

  const [form, setForm] = useState({
    fullName: currentUser?.name || "",
    email: currentUser?.email || "",
    field: "",
    sessionType: "",
    mentorId: "",
    duration: "",
    notes: ""
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const [availableMentors, setAvailableMentors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);
  const [selectedMentorForProfile, setSelectedMentorForProfile] = useState(null);
  
  // Selected request for details modal
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);

  // Shared Resources
  const [sharedResources, setSharedResources] = useState([]);
  const [isLoadingSharedResources, setIsLoadingSharedResources] = useState(true);

  // Notifications / My Requests
  const myRequests = useMemo(() => {
    return (state.mentorRequests || []);
  }, [state.mentorRequests]);

  const filteredRequests = useMemo(() => {
    if (activeTab === "all") return myRequests;
    if (activeTab === "pending") return myRequests.filter(r => r.status === "pending");
    if (activeTab === "accepted") return myRequests.filter(r => r.status === "scheduled" || r.status === "accepted");
    if (activeTab === "completed") return myRequests.filter(r => r.status === "completed");
    if (activeTab === "rejected") return myRequests.filter(r => r.status === "declined" || r.status === "rejected");
    return myRequests;
  }, [myRequests, activeTab]);

  const stats = useMemo(() => {
    const total = myRequests.length;
    const pending = myRequests.filter(r => r.status === "pending").length;
    const accepted = myRequests.filter(r => r.status === "scheduled" || r.status === "accepted").length;
    const completed = myRequests.filter(r => r.status === "completed").length;
    const rejected = myRequests.filter(r => r.status === "declined" || r.status === "rejected").length;
    
    // Progress calculation based on total valid sessions (ignoring rejected for progress usually, but we can do completed / (total - rejected))
    const validTotal = total - rejected;
    const progress = validTotal > 0 ? Math.round((completed / validTotal) * 100) : 0;

    return { total, pending, accepted, completed, rejected, progress };
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
      setIsModalOpen(true);
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

  // Fetch shared resources
  useEffect(() => {
    getMyResources()
      .then(data => {
        setSharedResources(data || []);
      })
      .catch(err => {
        console.error("Failed to fetch shared resources:", err);
      })
      .finally(() => {
        setIsLoadingSharedResources(false);
      });
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
      proposedTime: "As scheduled by mentor"
    };

    const res = await saveMentorRequest(requestPayload);
    if (res.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsModalOpen(false);
      }, 2000);
      setForm(f => ({ ...f, field: "", mentorId: "", notes: "" }));
    } else {
      alert("Failed to send request: " + res.message);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-6xl space-y-6 pb-12">
        
        {/* COMPACT PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#f0fdfa] border border-teal-100/50 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mentorship & Guidance</h1>
            <p className="mt-1 text-sm text-slate-500">Connect with industry experts and grow your career with personalized guidance.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="whitespace-nowrap bg-teal-500 hover:bg-teal-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors"
          >
            + Find a Mentor
          </button>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          
          {/* LEFT COLUMN: SESSIONS */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-2 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-800">Session Requests</h2>
                
                {/* TABS */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All ({stats.total})</Tab>
                  <Tab active={activeTab === "pending"} onClick={() => setActiveTab("pending")}>Pending</Tab>
                  <Tab active={activeTab === "accepted"} onClick={() => setActiveTab("accepted")}>Accepted</Tab>
                  <Tab active={activeTab === "completed"} onClick={() => setActiveTab("completed")}>Completed</Tab>
                  <Tab active={activeTab === "rejected"} onClick={() => setActiveTab("rejected")}>Rejected</Tab>
                </div>
              </div>

              {/* SESSION LIST */}
              <div className="p-6 flex flex-col gap-4">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map(req => (
                    <SessionCard 
                      key={req.id} 
                      req={req} 
                      onViewDetails={() => setSelectedRequestDetails(req)} 
                      navigate={navigate}
                      onFindAnother={() => setIsModalOpen(true)}
                    />
                  ))
                ) : (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    </div>
                    <p className="text-sm text-slate-500 font-medium">No requests found in this category.</p>
                  </div>
                )}
              </div>
            </div>

            {/* SHARED RESOURCES */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Shared Resources</h2>
                <p className="text-sm text-slate-500 mt-1">Materials and links shared by your mentors</p>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {isLoadingSharedResources ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-500">Loading resources...</p>
                  </div>
                ) : sharedResources.length > 0 ? (
                  sharedResources.map(resource => (
                    <ResourceCard key={resource._id} resource={resource} />
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-sm text-slate-500 font-medium">No resources shared yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: STATS & TIPS */}
          <div className="space-y-6">
            {/* STATS CARD */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5">Your Mentorship</h3>
              
              <div className="grid grid-cols-4 gap-2">
                <StatBox value={stats.total} label="Total" />
                <StatBox value={stats.completed} label="Comp." />
                <StatBox value={stats.pending} label="Pend." />
                <StatBox value={stats.accepted} label="Up." />
              </div>
            </div>

            {/* TIPS CARD */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">
                Mentorship Tips
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0"></span>
                  <span>Find a mentor who matches your specific career goals.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0"></span>
                  <span>Prepare 3-5 specific questions before your session starts.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0"></span>
                  <span>Leave constructive feedback after completing your session.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* FIND MENTOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-slate-800">Find a Mentor</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {submitted ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center mb-4">
                    <CheckIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Request Sent!</h3>
                  <p className="text-sm text-slate-500">Your mentorship request has been submitted successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-600">Choose expertise</label>
                    <select name="field" value={form.field} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition-all">
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

                  {form.field && (
                    <div className="space-y-1.5 animate-in fade-in">
                      <label className="text-[13px] font-bold text-slate-600">Choose mentor</label>
                      <select name="mentorId" value={form.mentorId} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition-all">
                        <option value="">Select Mentor</option>
                        {availableMentors.map(m => (
                          <option key={m.userId} value={m.userId}>{m.name} ({m.subjectField || m.title})</option>
                        ))}
                      </select>
                      {isLoadingMentors && <p className="text-xs text-slate-400 mt-1">Loading mentors...</p>}
                      {!isLoadingMentors && availableMentors.length === 0 && <p className="text-xs text-amber-500 mt-1">No mentors found for this field.</p>}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-slate-600">Session type</label>
                      <select name="sessionType" value={form.sessionType} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition-all">
                        <option value="">Select Type</option>
                        <option>Portfolio review</option>
                        <option>Mock interview</option>
                        <option>Career planning</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-slate-600">Duration</label>
                      <select name="duration" value={form.duration} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition-all">
                        <option value="">Select Duration</option>
                        <option>30 min</option>
                        <option>60 min</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-600">Notes for Mentor</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition-all resize-none" placeholder="Briefly describe what you'd like to discuss..." />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-teal-500 hover:bg-teal-600 rounded-full shadow-sm shadow-teal-500/20 transition-all">
                      Send Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedRequestDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Session Details</h2>
              <button onClick={() => setSelectedRequestDetails(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-700">
               <div>
                 <span className="block text-xs font-bold text-slate-400 uppercase">Mentor</span>
                 <p className="font-semibold">{selectedRequestDetails.mentorName}</p>
               </div>
               <div>
                 <span className="block text-xs font-bold text-slate-400 uppercase">Topic & Type</span>
                 <p className="font-semibold">{selectedRequestDetails.field} • {selectedRequestDetails.sessionType}</p>
               </div>
               <div>
                 <span className="block text-xs font-bold text-slate-400 uppercase">Status</span>
                 <p className="font-semibold capitalize">{selectedRequestDetails.status}</p>
               </div>
               {(selectedRequestDetails.scheduledDate || selectedRequestDetails.scheduledTime) && (
                 <div>
                   <span className="block text-xs font-bold text-slate-400 uppercase">Schedule</span>
                   <p className="font-semibold">{selectedRequestDetails.scheduledDate || "TBD"} at {selectedRequestDetails.scheduledTime || "TBD"}</p>
                 </div>
               )}
               {selectedRequestDetails.meetingLink && (
                 <div>
                   <span className="block text-xs font-bold text-slate-400 uppercase">Meeting Link</span>
                   <a href={selectedRequestDetails.meetingLink} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline font-semibold break-all">
                     {selectedRequestDetails.meetingLink}
                   </a>
                 </div>
               )}
               {selectedRequestDetails.note && (
                 <div>
                   <span className="block text-xs font-bold text-slate-400 uppercase">Your Notes</span>
                   <p className="bg-slate-50 p-3 rounded-lg text-slate-600 mt-1">{selectedRequestDetails.note}</p>
                 </div>
               )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl text-right">
               <button onClick={() => setSelectedRequestDetails(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                 Close
               </button>
            </div>
          </div>
        </div>
      )}

      {/* EXISTING PROFILE MODAL */}
      <MentorProfileModal 
        mentor={selectedMentorForProfile}
        isOpen={!!selectedMentorForProfile}
        onClose={() => setSelectedMentorForProfile(null)}
        onSelect={(mid) => {
          setForm(f => ({ ...f, mentorId: mid }));
          setIsModalOpen(true);
        }}
      />
    </PageShell>
  );
}

/* ----------------- Sub-Components ----------------- */

function Tab({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`whitespace-nowrap px-4 py-1.5 text-sm font-bold rounded-full transition-colors ${
      active ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
    }`}>
      {children}
    </button>
  );
}

function StatBox({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-black text-slate-800">{value}</span>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function SessionCard({ req, onViewDetails, navigate, onFindAnother }) {
  // Determine styles and actions based on status
  let statusColor = "bg-slate-100 text-slate-600 border-slate-200";
  let statusText = req.status;

  if (req.status === "scheduled" || req.status === "accepted") {
    statusColor = "bg-teal-50 text-teal-700 border-teal-100";
    statusText = "Accepted";
  } else if (req.status === "completed") {
    statusColor = "bg-blue-50 text-blue-700 border-blue-100";
  } else if (req.status === "declined" || req.status === "rejected") {
    statusColor = "bg-red-50 text-red-700 border-red-100";
    statusText = "Rejected";
  } else if (req.status === "pending") {
    statusColor = "bg-amber-50 text-amber-700 border-amber-100";
  }

  // Get mentor initials for avatar placeholder
  const initials = (req.mentorName || "M").substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/30 transition-colors">
      <div className="flex items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm font-bold text-slate-800">{req.mentorName || "Mentor"}</h4>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColor}`}>
              {statusText}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {req.field} • {req.sessionType}
          </p>
          {(req.scheduledDate || req.scheduledTime) && req.status === "scheduled" && (
             <p className="text-xs font-medium text-slate-600 mt-1 flex items-center gap-1">
               {req.scheduledDate} at {req.scheduledTime}
             </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end mt-2 sm:mt-0">
        <button 
          onClick={onViewDetails}
          className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-sm transition-colors"
        >
          View Details
        </button>

        {/* Status-specific actions */}
        {req.status === "pending" && (
          <button className="px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
            Cancel Request
          </button>
        )}

        {(req.status === "scheduled" || req.status === "accepted") && (
          <>
            {req.meetingLink && (
              <a href={req.meetingLink} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 hover:bg-teal-100 rounded-lg transition-colors">
                Join
              </a>
            )}
            <button 
              onClick={() => navigate("/student/messages", { state: { mentorId: req.mentorId } })}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-sm transition-colors"
            >
              Chat
            </button>
          </>
        )}

        {req.status === "completed" && (
          <button 
            onClick={() => navigate("/student/messages", { state: { mentorId: req.mentorId } })}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-sm transition-colors"
          >
            Chat History
          </button>
        )}

        {(req.status === "declined" || req.status === "rejected") && (
          <button 
            onClick={onFindAnother} 
            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-sm transition-colors"
          >
            Find Another
          </button>
        )}
      </div>
    </div>
  );
}

function ResourceCard({ resource }) {
  const getIcon = (type) => {
    if (type === "video") return "🎥";
    if (type === "pdfppt" || type === "document") return "📄";
    if (type === "quiz") return "📝";
    return "🔗";
  };

  const mentorName = resource.mentorId?.name || "Mentor";

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/30 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-xl flex-shrink-0">
        {getIcon(resource.type)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-800 truncate">{resource.title}</h4>
        <p className="text-xs text-slate-500 mt-0.5">Shared by {mentorName}</p>
        {resource.description && (
          <p className="text-sm text-slate-600 mt-2 line-clamp-2">{resource.description}</p>
        )}
        {resource.notes && (
          <div className="mt-2 p-2 bg-slate-100 rounded-lg text-xs text-slate-600 italic">
            "{resource.notes}"
          </div>
        )}
        {resource.url && (
          <a href={resource.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline">
            Open Resource
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

/* ----------------- Icons ----------------- */
function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

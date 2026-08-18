import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../../../components/PageShell.jsx";
import AdminFooter from "./../../../../components/layouts/admin-layouts/AdminFooter.jsx";

const API_URL = import.meta.env.VITE_API_URL;


const AdminVerifyEducators = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("verifications");
  const [specRequests, setSpecRequests] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isLoadingVerifications, setIsLoadingVerifications] = useState(false);
  const [isLoadingSpec, setIsLoadingSpec] = useState(false);
  const [isLoadingContact, setIsLoadingContact] = useState(false);
  
  const [educatorCache, setEducatorCache] = useState({});
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const sorted = useMemo(() => {
    return [...requests].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }, [requests]);

  useEffect(() => {
    const fetchVerifications = async () => {
      setIsLoadingVerifications(true);
      try {
        const token = localStorage.getItem("edupath_token");
        const res = await fetch(`${API_URL}/api/admin/educators/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.educators || []).map(ed => {
            const fallbackDate = ed._id ? new Date(parseInt(ed._id.substring(0, 8), 16) * 1000).toISOString() : null;
            return {
              ...ed,
              _id: ed._id,
              fullName: ed.profile?.fullName || ed.name || "Unknown",
              email: ed.email,
              field: ed.specializationTag || ed.profile?.specializationTag || ed.specializationTags?.[0] || ed.profile?.specialization || "N/A",
              educationLevel: ed.profile?.educationLevel || "N/A",
              courseCount: 0,
              submittedAt: ed.updatedAt || ed.createdAt || fallbackDate,
              createdAt: ed.createdAt || fallbackDate,
              updatedAt: ed.updatedAt || ed.createdAt || fallbackDate,
              docs: {
                ...(ed.profile?.documents || {}),
                portfolio: ed.profile?.documents?.portfolio || ed.profile?.credentialsLink || ed.credentialsLink || null
              }
            };
          });
          setRequests(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch verifications", err);
      } finally {
        setIsLoadingVerifications(false);
      }
    };
    const fetchSpecRequests = async () => {
      setIsLoadingSpec(true);
      try {
        const token = localStorage.getItem("edupath_token");
        const res = await fetch(`${API_URL}/api/specializations/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSpecRequests(data.requests || []);
        }
      } catch (err) {
        console.error("Failed to fetch specialization requests", err);
      } finally {
        setIsLoadingSpec(false);
      }
    };
    const fetchContactRequests = async () => {
      setIsLoadingContact(true);
      try {
        const token = localStorage.getItem("edupath_token");
        const res = await fetch(`${API_URL}/api/specializations/contact`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setContactRequests(data.contacts || []);
        }
      } catch (err) {
        console.error("Failed to fetch contact requests", err);
      } finally {
        setIsLoadingContact(false);
      }
    };
    if (activeTab === "verifications") fetchVerifications();
    if (activeTab === "specializations") fetchSpecRequests();
    if (activeTab === "contacts") fetchContactRequests();
  }, [activeTab]);

  const handleViewContact = async (id) => {
    try {
      const token = localStorage.getItem("edupath_token");
      const res = await fetch(`${API_URL}/api/specializations/contact/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedContact(data.contact);
        // Update the status in the list to "reviewed"
        setContactRequests(prev => prev.map(c => c._id === id ? { ...c, status: "reviewed" } : c));
      }
    } catch (err) {
      console.error("Failed to fetch contact details", err);
    }
  };

  const handleSpecAction = async (id, status) => {
    try {
      const token = localStorage.getItem("edupath_token");
      const res = await fetch(`${API_URL}/api/specializations/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        setSpecRequests(prev => prev.map(req => req._id === id ? { ...req, status } : req));
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Network error: Failed to update status");
    }
  };

  const handleViewDetails = async (ed) => {
    const id = ed._id || ed.id;
    if (educatorCache[id]) {
      navigate(`/admin/verify-educator/${id}`, { state: { educator: educatorCache[id] } });
      return;
    }
    
    setIsFetchingDetails(true);
    try {
      const token = localStorage.getItem("edupath_token");
      const res = await fetch(`${API_URL}/api/admin/educators/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const fullEducator = data.educator || ed;
        
        // Map fields that AdminEducatorReview expects
        const mappedEducator = {
          ...fullEducator,
          fullName: fullEducator.profile?.fullName || fullEducator.name || "Unknown",
          field: fullEducator.specializationTag || fullEducator.profile?.specializationTag || fullEducator.specializationTags?.[0] || fullEducator.profile?.specialization || "N/A",
          educationLevel: fullEducator.profile?.educationLevel || "N/A",
          docs: {
            ...(fullEducator.profile?.documents || {}),
            portfolio: fullEducator.profile?.documents?.portfolio || fullEducator.profile?.credentialsLink || fullEducator.credentialsLink || null
          }
        };

        setEducatorCache(prev => ({ ...prev, [id]: mappedEducator }));
        navigate(`/admin/verify-educator/${id}`, { state: { educator: mappedEducator } });
      } else {
        navigate(`/admin/verify-educator/${id}`, { state: { educator: ed } });
      }
    } catch (err) {
      console.error("Failed to fetch full details", err);
      navigate(`/admin/verify-educator/${id}`, { state: { educator: ed } });
    } finally {
      setIsFetchingDetails(false);
    }
  };

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-text-dark">Educator Requests</h1>
              <p className="mt-1 text-xs text-muted">
                Manage educator verifications, specialization changes, and contact messages.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/educators")}
              className="rounded-full bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors whitespace-nowrap"
            >
              View All Educators
            </button>
          </div>
            
          <div className="flex gap-2">
            <button 
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${activeTab === 'verifications' ? 'bg-primary text-white' : 'bg-black/5 text-text-dark hover:bg-black/10'}`}
              onClick={() => setActiveTab('verifications')}
            >
              New Verifications
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${activeTab === 'specializations' ? 'bg-primary text-white' : 'bg-black/5 text-text-dark hover:bg-black/10'}`}
              onClick={() => setActiveTab('specializations')}
            >
              Specialization Changes
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${activeTab === 'contacts' ? 'bg-primary text-white' : 'bg-black/5 text-text-dark hover:bg-black/10'}`}
              onClick={() => setActiveTab('contacts')}
            >
              Contact Messages
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-dark">
              {activeTab === 'verifications' ? 'Verification Requests' : activeTab === 'specializations' ? 'Specialization Change Requests' : 'Contact Messages'}
            </h2>
          </div>

          <div className="mt-4 space-y-3">
            {activeTab === 'verifications' && (
              <div className="space-y-4">
                {isLoadingVerifications ? (
                  <div className="py-8 text-center text-sm font-semibold text-muted">Loading verifications...</div>
                ) : sorted.length === 0 ? (
                  <div className="py-8 text-center text-sm font-semibold text-muted">No pending verification requests.</div>
                ) : (
                  sorted.map((req) => (
                    <RequestCard 
                      key={req._id || req.id} 
                      educator={req} 
                      onViewDetails={() => handleViewDetails(req)}
                      isFetching={isFetchingDetails}
                    />
                  ))
                )}
              </div>
            )}
            {activeTab === 'specializations' && (
              <>
                {isLoadingSpec ? (
                  <div className="rounded-2xl border border-black/5 bg-white/60 p-4 text-sm text-muted animate-pulse">
                    Loading requests...
                  </div>
                ) : (
                  <>
                    {specRequests.map((req) => (
                      <SpecRequestCard key={req._id} request={req} onAction={handleSpecAction} />
                    ))}
                    {specRequests.length === 0 && (
                      <div className="rounded-2xl border border-black/5 bg-white/60 p-4 text-sm text-muted">
                        No specialization change requests found.
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            {activeTab === 'contacts' && (
              <>
                {isLoadingContact ? (
                  <div className="rounded-2xl border border-black/5 bg-white/60 p-4 text-sm text-muted animate-pulse">
                    Loading messages...
                  </div>
                ) : (
                  <>
                    {contactRequests.map((c) => (
                      <ContactCard key={c._id} contact={c} onView={handleViewContact} />
                    ))}
                    {contactRequests.length === 0 && (
                      <div className="rounded-2xl border border-black/5 bg-white/60 p-4 text-sm text-muted">
                        No contact messages found.
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <AdminFooter />
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <ContactDetailModal contact={selectedContact} onClose={() => setSelectedContact(null)} />
      )}
    </PageShell>
  );
};

const SpecRequestCard = ({ request, onAction }) => {
  return (
    <div className="rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar name={request.name || request.email} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-dark">
              {request.name}
            </p>
            <p className="truncate text-xs text-muted">{request.email}</p>

            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <MiniPill label={`New Spec: ${request.requestedSpecialization}`} />
              <MiniPill label={`Contact: ${request.contactNumber}`} />
              <MiniPill
                label={`Submitted: ${
                  request.createdAt
                    ? new Date(request.createdAt).toLocaleDateString()
                    : "—"
                }`}
              />
              <MiniPill label={`Status: ${request.status}`} />
            </div>

            <div className="mt-3 text-[12px] text-muted max-w-xl">
              <span className="font-semibold text-text-dark">Reason: </span>
              {request.reason}
            </div>
          </div>
        </div>

        {request.status === "pending" ? (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => onAction(request._id, "accepted")}
              className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
            >
              Accept
            </button>
            <button
              onClick={() => onAction(request._id, "rejected")}
              className="rounded-full bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-200"
            >
              Reject
            </button>
          </div>
        ) : (
          <div className="shrink-0 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700">
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </div>
        )}
      </div>
    </div>
  );
};

const ContactCard = ({ contact, onView }) => {
  return (
    <div className="rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar name={contact.name || contact.email} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-dark">
              {contact.name}
            </p>
            <p className="truncate text-xs text-muted">{contact.email}</p>

            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <MiniPill label={`Subject: ${contact.subject}`} />
              <MiniPill
                label={`Sent: ${
                  contact.createdAt
                    ? new Date(contact.createdAt).toLocaleDateString()
                    : "—"
                }`}
              />
              <span className={`rounded-full px-3 py-1 ${contact.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {contact.status === 'pending' ? 'New' : 'Reviewed'}
              </span>
            </div>

            <div className="mt-3 text-[12px] text-muted max-w-xl">
              <span className="font-semibold text-text-dark">Message: </span>
              {contact.message.length > 100 ? contact.message.substring(0, 100) + '...' : contact.message}
            </div>
          </div>
        </div>

        <button
          onClick={() => onView(contact._id)}
          className="rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 shrink-0"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

const ContactDetailModal = ({ contact, onClose }) => {
  const educator = contact.educatorId;
  const profile = educator?.profile || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg mx-4 rounded-[28px] border border-black/5 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text-dark">Contact Request Details</h2>
          <button onClick={onClose} className="text-muted hover:text-text-dark text-xl leading-none">&times;</button>
        </div>

        {/* Message Info */}
        <div className="space-y-3 mb-5">
          <div>
            <p className="text-xs text-muted font-semibold uppercase tracking-wide">Subject</p>
            <p className="text-sm text-text-dark mt-1">{contact.subject}</p>
          </div>
          <div>
            <p className="text-xs text-muted font-semibold uppercase tracking-wide">Message</p>
            <p className="text-sm text-text-dark mt-1 whitespace-pre-wrap">{contact.message}</p>
          </div>
          <div>
            <p className="text-xs text-muted font-semibold uppercase tracking-wide">Sent At</p>
            <p className="text-sm text-text-dark mt-1">{contact.createdAt ? new Date(contact.createdAt).toLocaleString() : '—'}</p>
          </div>
        </div>

        {/* Educator Details */}
        <div className="rounded-2xl border border-black/5 bg-gray-50 p-4">
          <p className="text-xs text-muted font-semibold uppercase tracking-wide mb-3">Educator Details</p>
          <div className="flex items-start gap-3">
            <Avatar name={educator?.name || contact.email} />
            <div className="min-w-0 space-y-2">
              <div>
                <p className="text-sm font-semibold text-text-dark">{educator?.name || profile.fullName || 'N/A'}</p>
                <p className="text-xs text-muted">{educator?.email || contact.email}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <MiniPill label={`Role: ${educator?.role || 'N/A'}`} />
                <MiniPill label={`Status: ${educator?.status || 'N/A'}`} />
                <MiniPill label={`Specialization: ${educator?.specializationTag || profile.specializationTag || 'N/A'}`} />
              </div>
              {profile.contact && (
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <MiniPill label={`Contact: ${profile.contact}`} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-primary px-6 py-2 text-xs font-semibold text-white hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const RequestCard = ({ educator, onViewDetails, isFetching }) => {
  return (
    <div className="rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar name={educator.fullName || educator.email} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-dark">
              {educator.fullName}
            </p>
            <p className="truncate text-xs text-muted">{educator.email}</p>

            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <MiniPill label={`Field: ${educator.field || "N/A"}`} />
              <MiniPill label={`Courses: ${educator.courseCount ?? 0}`} />
              <MiniPill
                label={`Submitted: ${
                  educator.submittedAt
                    ? new Date(educator.submittedAt).toLocaleDateString()
                    : "—"
                }`}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted">
              <DocLink label="Portfolio" url={educator.docs?.portfolio} />
            </div>
          </div>
        </div>

        <button
          onClick={onViewDetails}
          disabled={isFetching}
          className="rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-200 disabled:opacity-50"
        >
          {isFetching ? "Loading..." : "Action"}
        </button>
      </div>
    </div>
  );
};

const MiniPill = ({ label }) => (
  <span className="rounded-full bg-black/5 px-3 py-1">{label}</span>
);

const DocLink = ({ label, url }) => (
  <span className="rounded-full bg-black/5 px-3 py-1">
    {label}:{" "}
    {url ? (
      <a
        className="text-primary font-semibold hover:underline"
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        Open
      </a>
    ) : (
      "N/A"
    )}
  </span>
);

const Avatar = ({ name }) => (
  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-sm">
    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
      {getInitials(name)}
    </div>
  </div>
);

function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "E";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

export default AdminVerifyEducators;

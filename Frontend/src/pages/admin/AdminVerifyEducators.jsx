import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Imported for navigation
import PageShell from "../../components/PageShell.jsx";
import AdminFooter from "./AdminFooter.jsx";

// API Endpoint for fetching pending educators
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PENDING_EDUCATORS_API = `${API_URL}/api/auth/admin/educators/pending`;

const AdminVerifyEducators = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook for routing

  // Helper to get Auth Headers
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  // Fetch pending educators from database
  useEffect(() => {
    const fetchPendingEducators = async () => {
      try {
        setIsLoading(true);
        setError("");
        const res = await axios.get(PENDING_EDUCATORS_API, getAuthHeader());
        setRequests(res.data.educators || res.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || "Failed to load pending educators.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingEducators();
  }, []);

  // Sort by submitted date or created date
  const sorted = useMemo(() => {
    return [...requests].sort(
      (a, b) => {
        const dateB = new Date(b.submittedAt || b.createdAt).getTime();
        const dateA = new Date(a.submittedAt || a.createdAt).getTime();
        return dateB - dateA;
      }
    );
  }, [requests]);

  // Navigate to the new review page and pass the educator data
  const handleNavigateToReview = (educator) => {
    // Navigate to the review page, passing the educator object in the route state
    navigate(`/admin/verify-educator/${educator._id || educator.id}`, { 
      state: { educator } 
    });
  };

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-text-dark">
                Educator Requests
              </h1>
              <p className="mt-1 text-xs text-muted">
                Recent educator verification requests submitted to the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-dark">Pending Approvals</h2>
          </div>

          <div className="mt-4 space-y-3">
            {isLoading && (
              <div className="rounded-2xl border border-black/5 bg-white/60 p-4 text-sm text-muted animate-pulse">
                Loading pending requests...
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {!isLoading && !error && sorted.map((e) => (
              <RequestCard 
                key={e._id || e.id} 
                educator={e} 
                onVerifyClick={() => handleNavigateToReview(e)} 
              />
            ))}

            {!isLoading && !error && sorted.length === 0 && (
              <div className="rounded-2xl border border-black/5 bg-white/60 p-4 text-sm text-muted">
                No pending educators found.
              </div>
            )}
          </div>
        </div>

        <AdminFooter />
      </div>
    </PageShell>
  );
};

const RequestCard = ({ educator, onVerifyClick }) => {
  const fullName = educator.fullName || educator.name || "Unknown";
  const field = educator.field || educator.specialization || "N/A";
  const submitDate = educator.submittedAt || educator.createdAt;

  return (
    <div className="rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar name={fullName !== "Unknown" ? fullName : educator.email} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-dark">
              {fullName}
            </p>
            <p className="truncate text-xs text-muted">{educator.email}</p>

            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <MiniPill label={`Field: ${field}`} />
              <MiniPill label={`Level: ${educator.educationLevel || "N/A"}`} />
              <MiniPill
                label={`Submitted: ${
                  submitDate
                    ? new Date(submitDate).toLocaleDateString()
                    : "—"
                }`}
              />
            </div>
          </div>
        </div>

        <button
          onClick={onVerifyClick}
          className="rounded-full bg-amber-100 px-5 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-200 transition shadow-sm"
        >
          Verify
        </button>
      </div>
    </div>
  );
};

// Sub-components
const MiniPill = ({ label }) => (
  <span className="rounded-full bg-black/5 px-3 py-1">{label}</span>
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
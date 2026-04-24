import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Imported for navigation
import PageShell from "../../../components/PageShell.jsx";
import { useApp } from "../../../context/AppProvider.jsx";
import AdminFooter from "./AdminFooter.jsx";
import ComingSoon from "../../ComingSoon.jsx";

// API Endpoints
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PENDING_EDUCATORS_API = `${API_URL}/api/auth/admin/educators/pending`;

const AdminDashboard = () => {
  const { users, courses } = useApp();
  const navigate = useNavigate(); // Hook for routing

  // States for pending requests
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to get Auth Headers
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  // Fetch pending educators on component mount
  useEffect(() => {
    const fetchPendingEducators = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(PENDING_EDUCATORS_API, getAuthHeader());
        const allPending = res.data.educators || res.data || [];
        
        // Only take the first 3 requests for the dashboard preview
        setPendingRequests(allPending.slice(0, 3));
      } catch (err) {
        console.error("Failed to load pending educators:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingEducators();
  }, []);

  // Navigate to the review page with the selected educator's data
  const handleViewEducator = (educator) => {
    const educatorId = educator._id || educator.id;
    navigate(`/admin/verify-educator/${educatorId}`, { 
      state: { educator } 
    });
  };

  return (
    <PageShell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-text-dark">
                System Dashboard
              </h1>
              <p className="mt-1 text-xs text-muted">
                Manage platform users, verify educators, and add reviewers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button 
                className="rounded-full bg-primary/15 px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-primary/20 transition" 
                onClick={() => navigate('/admin/profile')}
              >
                Profile
              </button>
            </div>
          </div>
        </div>

        {/* Verify Educators Preview Section */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-dark">
              Verify Educators
            </h2>
            <button 
              className="text-sm font-semibold text-primary hover:underline" 
              onClick={() => navigate('/admin/verify-educators')} 
            >
              View All
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {isLoading && (
              <div className="rounded-[22px] border border-black/5 bg-white/60 p-4 text-sm text-muted animate-pulse">
                Loading requests...
              </div>
            )}

            {!isLoading && pendingRequests.map((req) => {
              const educatorId = req._id || req.id;
              const name = req.fullName || req.name || "Unknown Educator";
              const field = req.field || req.specialization || "General";

              return (
                <div
                  key={educatorId}
                  className="flex flex-col gap-3 rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-dark">
                      Educator Verification: {name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {req.email} • Field: {field}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Replaced Approve/Reject with a single View button */}
                    <button
                      onClick={() => handleViewEducator(req)}
                      className="rounded-full bg-amber-100 px-6 py-2 text-sm font-bold text-amber-700 shadow-sm hover:bg-amber-200 transition"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}

            {!isLoading && pendingRequests.length === 0 && (
              <div className="rounded-[22px] border border-black/5 bg-white/60 p-4 text-sm text-muted">
                No approvals pending right now.
              </div>
            )}
          </div>
        </div>

        {/* Platform Statistics */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-dark">
              Platform Statistics
            </h2>
            <span className="text-xs font-semibold text-muted">Last 30 days</span>
          </div>

          <div className="mt-4 rounded-[22px] border border-dashed border-black/10 bg-white/60 p-10 text-center text-sm text-muted">
            Coming Soon
          </div>
        </div>

        <AdminFooter />
      </div>
    </PageShell>
  );
};

export default AdminDashboard;
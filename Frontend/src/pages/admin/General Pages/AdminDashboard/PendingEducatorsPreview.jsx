import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// API endpoint to fetch pending educators
const PENDING_EDUCATORS_API = `${import.meta.env.VITE_API_URL}/api/admin/educators/pending`;

export default function PendingEducatorsPreview() {
  // Local state to store the list of pending educators
  const [pendingRequests, setPendingRequests] = useState([]);
  
  // Local state to show a loading animation while data is fetching
  const [isLoading, setIsLoading] = useState(true);
  
  // Hook used to navigate between different pages in React
  const navigate = useNavigate();

  // Helper function to get the authorization token for the API request
  const getAuthHeader = useCallback(() => {
    return {
      headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
    };
  }, []);

  // Fetch pending educators from the backend when the component loads
  useEffect(() => {
    const fetchPendingEducators = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(PENDING_EDUCATORS_API, getAuthHeader());
        
        // Extract the educators array from the response data
        const allPending = res.data.educators || res.data || [];
        
        // Only keep the first 3 requests for this small preview widget
        setPendingRequests(allPending.slice(0, 3));
      } catch (err) {
        console.error("Failed to load pending educators:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPendingEducators();
  }, [getAuthHeader]);

  // Navigation Handler: Go to the specific educator's detailed verification page
  const handleViewEducator = (educator) => {
    const educatorId = educator._id || educator.id;
    // Navigate to the verification page and pass the educator object securely
    navigate(`/admin/verify-educator/${educatorId}`, { 
      state: { educator } 
    });
  };

  // Go to the full list of pending educators
  const handleViewAllClick = () => {
    navigate("/admin/verify-educators");
  };

  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur h-full">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-dark">
          Verify Educators
        </h2>

        {/* View All Button */}
        <button 
          className="text-sm font-semibold text-primary hover:underline transition" 
          onClick={handleViewAllClick} 
        >
          View All
        </button>
      </div>

      {/* List Section */}
      <div className="mt-4 space-y-3">
        
        {/* Show this animated loading box while fetching data */}
        {isLoading && (
          <div className="rounded-[22px] border border-black/5 bg-white/60 p-4 text-sm text-muted animate-pulse">
            Loading requests...
          </div>
        )}

        {/* Loop through the pending requests and display up to 3 cards */}
        {!isLoading && pendingRequests.map((req) => {
          // Fallbacks just in case the data fields differ slightly
          const educatorId = req._id || req.id;
          const name = req.fullName || req.name || "Unknown Educator";
          const field = req.field || req.specialization || "General";

          return (
            <div
              key={educatorId}
              className="flex flex-col gap-3 rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition"
            >
              {/* Educator Information */}
              <div>
                <p className="text-sm font-semibold text-text-dark">
                  Educator Verification: {name}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {req.email} • Field: {field}
                </p>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3">
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

        {/* Show this message if the API returns an empty array (No pending requests) */}
        {!isLoading && pendingRequests.length === 0 && (
          <div className="rounded-[22px] border border-black/5 bg-slate-50 p-6 text-sm font-medium text-slate-400 text-center flex flex-col items-center justify-center">
            No approvals pending right now.
          </div>
        )}
        
      </div>
    </div>
  );
}
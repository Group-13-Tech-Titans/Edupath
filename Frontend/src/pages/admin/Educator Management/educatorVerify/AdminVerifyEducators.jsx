import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import PageShell from "../../../../components/PageShell.jsx"; 
import AdminFooter from "../../../../components/layouts/admin-layouts/AdminFooter.jsx"; 


import VerifyEducatorsHeader from "./VerifyEducatorsHeader.jsx";
import VerifyEducatorsList from "./VerifyEducatorsList.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PENDING_EDUCATORS_API = `${API_URL}/api/admin/educators/pending`;

export default function AdminVerifyEducators() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Helper function to get auth header with token
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  // Fetch pending educator requests on component mount
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

  // Sort requests by submission date (newest first)
  const sorted = useMemo(() => {
    return [...requests].sort(
      (a, b) => {
        const dateB = new Date(b.submittedAt || b.createdAt).getTime();
        const dateA = new Date(a.submittedAt || a.createdAt).getTime();
        return dateB - dateA;
      }
    );
  }, [requests]);

  const handleNavigateToReview = (educator) => {
    navigate(`/admin/verify-educator/${educator._id || educator.id}`, { 
      state: { educator } 
    });
  };

  return (
    <PageShell>
      <div className="space-y-6">
        
        {/* Header with title and description */}
        <VerifyEducatorsHeader />

        {/* List of pending educator requests */}
        <VerifyEducatorsList 
          isLoading={isLoading} 
          error={error} 
          sortedRequests={sorted} 
          onVerifyClick={handleNavigateToReview} 
        />
        {/* Admin footer */}
        <AdminFooter />
      </div>
    </PageShell>
  );
}
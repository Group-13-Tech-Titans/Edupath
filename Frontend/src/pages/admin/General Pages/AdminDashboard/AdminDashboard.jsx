import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import PageShell from "../../../../components/PageShell.jsx";
import { useApp } from "../../../../context/AppProvider.jsx";
import AdminFooter from "../../../../components/layouts/admin-layouts/AdminFooter.jsx";
import StudentGrowthChart from "../../chart/StudentGrowthChart/StudentGrowthChart.jsx";

import DashboardHeader from "./DashboardHeader.jsx";
import PendingEducatorsPreview from "./PendingEducatorsPreview.jsx";

// API Endpoints
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PENDING_EDUCATORS_API = `${API_URL}/api/admin/educators/pending`;

export default function AdminDashboard() {
  const { users, courses } = useApp();
  const navigate = useNavigate();

  // States
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  // Fetch pending educators
  useEffect(() => {
    const fetchPendingEducators = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(PENDING_EDUCATORS_API, getAuthHeader());
        const allPending = res.data.educators || res.data || [];
        setPendingRequests(allPending.slice(0, 3));
      } catch (err) {
        console.error("Failed to load pending educators:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPendingEducators();
  }, []);

  // Navigation Handlers
  const handleViewEducator = (educator) => {
    const educatorId = educator._id || educator.id;
    navigate(`/admin/verify-educator/${educatorId}`, { 
      state: { educator } 
    });
  };

  return (
    <PageShell>
      <div className="space-y-6">
        
        {/* 1. Header Component */}
        <DashboardHeader 
          onProfileClick={() => navigate('/admin/profile')} 
        />

        {/* 2. Pending Educators List Component */}
        <PendingEducatorsPreview 
          isLoading={isLoading}
          pendingRequests={pendingRequests}
          onViewAllClick={() => navigate('/admin/verify-educators')}
          onViewEducatorClick={handleViewEducator}
        />

        {/* 3. Chart Component */}
        <div> 
          <StudentGrowthChart />
        </div>
        
        <br />
      </div>

      <AdminFooter />
    </PageShell>
  );
}
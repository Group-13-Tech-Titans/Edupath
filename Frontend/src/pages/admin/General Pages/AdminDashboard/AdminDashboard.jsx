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


//main dashboard page for admin
export default function AdminDashboard() {
  const { users, courses } = useApp();
  const navigate = useNavigate();

  // Local state to store pending educator requests and loading status
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  //helper function to get auth header for API requests
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` } 
  });

 

  return (
    <PageShell>
      <div className="space-y-6">
        
        {/* Header Component */}
        <DashboardHeader 
          onProfileClick={() => navigate('/admin/profile')}  // Navigate to admin profile page 
        />

        {/* Pending Educators List Component */}
        <PendingEducatorsPreview />
        

        {/*Chart Component */}
        <div> 
          <StudentGrowthChart />
        </div>
        <br />
      </div>

     {/* Admin Footer Component */}
      <AdminFooter />
    </PageShell>
  );
}
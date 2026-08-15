import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import PageShell from "../../../../components/PageShell.jsx"; 
import AdminFooter from "../../../../components/layouts/admin-layouts/AdminFooter.jsx"; 
import ReviewHeader from "./ReviewHeader.jsx";
import ApplicantInfo from "./ApplicantInfo.jsx";
import ReviewActions from "./ReviewActions.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const VERIFY_EDUCATOR_API = (id) => `${API_URL}/api/admin/educators/${id}/verify`;

export default function AdminEducatorReview() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const educator = location.state?.educator;

  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  if (!educator) {
    return (
      <PageShell>
        <div className="p-10 text-center">
          <p className="text-slate-500">Educator data not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-primary underline">Go Back</button>
        </div>
      </PageShell>
    );
  }

  const fullName = educator.fullName || educator.name || "Unknown";
  const educatorId = educator._id || educator.id;

  const handleVerifyAction = async (status) => {
    setIsProcessing(true);
    try {
      await axios.patch(
        VERIFY_EDUCATOR_API(educatorId),
        { status: status }, 
        getAuthHeader()
      );

      const actionWord = status === "VERIFIED" ? "approved" : "rejected";
      showToast("success", `Educator successfully ${actionWord}!`);
      
      setTimeout(() => {
        navigate("/admin/verify-educators"); 
      }, 1500);

    } catch (err) {
      console.error("Verification error:", err);
      showToast("error", err.response?.data?.message || `Failed to mark as ${status}.`);
      setIsProcessing(false);
    }
  };

  const handleContactAction = () => {
    const subject = encodeURIComponent("Regarding your EduPath Educator Application");
    const body = encodeURIComponent(`Hello ${fullName},\n\nWe are reviewing your application to become an educator on EduPath...\n\n`);
    window.location.href = `mailto:${educator.email}?subject=${subject}&body=${body}`;
  };

  return (
    <PageShell>
      {toast && (
        <div className="fixed right-4 top-20 z-50">
          <div className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur bg-white/80 ${toast.type === "success" ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-600"}`}>
            {toast.text}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* 1. Header Component */}
        <ReviewHeader onBack={() => navigate(-1)} />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 2. Info Component */}
          <ApplicantInfo educator={educator} fullName={fullName} />

          {/* 3. Actions Component */}
          <ReviewActions 
            handleVerifyAction={handleVerifyAction} 
            handleContactAction={handleContactAction} 
            isProcessing={isProcessing} 
          />
        </div>
      </div>
      <br/>
      <AdminFooter />
    </PageShell>
  );
}
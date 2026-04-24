import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import AdminFooter from "./AdminFooter.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const VERIFY_EDUCATOR_API = (id) => `${API_URL}/api/auth/admin/educators/${id}/verify`;

export default function AdminEducatorReview() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the educator data passed from the previous list page
  const educator = location.state?.educator;

  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  // Helper to get Auth Headers
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  // If page is loaded directly without data, go back
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

  // Handle Verify Action (Approve or Reject)
  const handleVerifyAction = async (status) => {
    setIsProcessing(true);

    try {
      await axios.patch(
        VERIFY_EDUCATOR_API(educatorId),
        { status: status }, 
        getAuthHeader()
      );

      showToast("success", `Educator successfully ${status}!`);
      
      // Wait a moment then redirect back to the list
      setTimeout(() => {
        navigate("/admin/verify-educators"); // Adjust this route to match your actual list route
      }, 1500);

    } catch (err) {
      console.error("Verification error:", err);
      showToast("error", err.response?.data?.message || `Failed to mark as ${status}.`);
      setIsProcessing(false);
    }
  };

  // Handle Contact Action (Opens default email client)
  const handleContactAction = () => {
    const subject = encodeURIComponent("Regarding your EduPath Educator Application");
    const body = encodeURIComponent(`Hello ${fullName},\n\nWe are reviewing your application to become an educator on EduPath...\n\n`);
    window.location.href = `mailto:${educator.email}?subject=${subject}&body=${body}`;
  };

  return (
    <PageShell>
      {toast && (
        <div className="fixed right-4 top-20 z-50">
          <div
            className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur bg-white/80 ${
              toast.type === "success"
                ? "border-emerald-200 text-emerald-700"
                : "border-red-200 text-red-600"
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition"
              title="Go Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-text-dark">Review Application</h1>
              <p className="mt-1 text-xs text-muted">Review details and verify the educator.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Educator Details Form / Info */}
          <div className="lg:col-span-2 rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Applicant Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailField label="Full Name" value={fullName} />
              <DetailField label="Email Address" value={educator.email} />
              <DetailField label="Field / Specialization" value={educator.field || educator.specialization || "Not Provided"} />
              <DetailField label="Education Level" value={educator.educationLevel || "Not Provided"} />
              <DetailField label="Expected Courses" value={educator.courseCount || "0"} />
              <DetailField 
                label="Application Date" 
                value={educator.submittedAt || educator.createdAt ? new Date(educator.submittedAt || educator.createdAt).toLocaleString() : "Unknown"} 
              />
            </div>

            <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mt-6">Submitted Documents</h2>
            
            <div className="flex flex-col gap-3">
              <DocStatus label="National Identity Card (NIC)" provided={!!educator.docs?.nic} />
              <DocStatus label="Educational Certificates" provided={!!educator.docs?.certificate} />
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Portfolio Link</span>
                {educator.docs?.portfolio ? (
                  <a href={educator.docs.portfolio} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                    View Portfolio ↗
                  </a>
                ) : (
                  <span className="text-sm text-slate-400">Not Provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons Panel */}
          <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur h-fit space-y-4">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Actions</h2>
            
            <button
              onClick={() => handleVerifyAction("approved")}
              disabled={isProcessing}
              className="w-full rounded-2xl bg-emerald-500 py-3.5 font-bold text-white shadow hover:bg-emerald-600 transition disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              {isProcessing ? "Processing..." : "Approve Educator"}
            </button>

            <button
              onClick={() => handleVerifyAction("rejected")}
              disabled={isProcessing}
              className="w-full rounded-2xl bg-red-500 py-3.5 font-bold text-white shadow hover:bg-red-600 transition disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              {isProcessing ? "Processing..." : "Reject Educator"}
            </button>

            <div className="my-4 border-t border-slate-200"></div>

            <button
              onClick={handleContactAction}
              className="w-full rounded-2xl bg-blue-500 py-3.5 font-bold text-white shadow hover:bg-blue-600 transition flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
              Contact via Email
            </button>
            <p className="text-xs text-slate-400 text-center mt-2">
              Opens your default email client.
            </p>

          </div>
        </div>
      </div>
      <br/>
      <AdminFooter />
    </PageShell>
  );
}

// Sub-components for display
const DetailField = ({ label, value }) => (
  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
    <span className="block mt-1 text-sm font-medium text-slate-900">{value}</span>
  </div>
);

const DocStatus = ({ label, provided }) => (
  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
    <span className="text-sm font-semibold text-slate-700">{label}</span>
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${provided ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
      {provided ? "Provided" : "Missing"}
    </span>
  </div>
);
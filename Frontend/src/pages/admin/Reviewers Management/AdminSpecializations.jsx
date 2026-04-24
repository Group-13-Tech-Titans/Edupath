import React, { useEffect, useState } from "react";
import axios from "axios";
import PageShell from "../../../components/PageShell.jsx";
import AdminFooter from "../General Pages/AdminFooter.jsx";

// API Endpoint - Make sure this matches the route defined in your server.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SPEC_API = `${API_URL}/api/specializations`; // Adjust if your route prefix is different

export default function AdminSpecializations() {
  const [specializations, setSpecializations] = useState([]);
  const [newSpecName, setNewSpecName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Helper to attach authorization token to requests
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  // Display a temporary toast notification
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch all specializations from the backend
  const fetchSpecializations = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(SPEC_API, getAuthHeader());
      setSpecializations(res.data.specializations || []);
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to load specializations.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when the component mounts
  useEffect(() => {
    fetchSpecializations();
  }, []);

  // Handle the submission of a new specialization
  const handleAddSpecialization = async (e) => {
    e.preventDefault();
    if (!newSpecName.trim()) return;

    setIsSubmitting(true);
    try {
      await axios.post(SPEC_API, { name: newSpecName }, getAuthHeader());
      
      showToast("success", "Specialization added successfully!");
      setNewSpecName(""); // Clear the input field after successful addition
      fetchSpecializations(); // Reload the list to display the new item
    } catch (error) {
      console.error(error);
      showToast("error", error.response?.data?.message || "Failed to add specialization.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggling the Active/Inactive status of an item
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      // Send a PATCH request to toggle the status in the database
      await axios.patch(`${SPEC_API}/${id}/toggle`, {}, getAuthHeader());
      
      // Update the local state immediately for a responsive UI (no full reload needed)
      setSpecializations(prevSpecs => 
        prevSpecs.map(spec => 
          spec._id === id ? { ...spec, isActive: !spec.isActive } : spec
        )
      );

      // Show a success message reflecting the new status
      showToast("success", `Status updated to ${!currentStatus ? 'Active' : 'Inactive'}`);
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to change status.");
    }
  };

  return (
    <PageShell>
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed right-4 top-20 z-50">
          <div className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur bg-white/80 ${
            toast.type === "success" ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-600"
          }`}>
            {toast.text}
          </div>
        </div>
      )}

      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Manage Specializations</h1>
            <p className="mt-1 text-xs text-slate-500">
              Add new subject areas or technical fields to assign to reviewers and educators.
            </p>
          </div>
        </div>

        {/* Add New Specialization Form */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Add New Specialization</h2>
          
          <form onSubmit={handleAddSpecialization} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. Cyber Security, Python, Graphic Design"
              value={newSpecName}
              onChange={(e) => setNewSpecName(e.target.value)}
              className="flex-grow rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newSpecName.trim()}
              className="whitespace-nowrap rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 disabled:opacity-50 transition"
            >
              {isSubmitting ? "Adding..." : "+ Add Field"}
            </button>
          </form>
        </div>

        {/* Specializations List Display */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-slate-800">Current Specializations</h2>
            <span className="px-3 py-1 bg-slate-100 text-xs font-bold text-slate-600 rounded-full">
              Total: {specializations.length}
            </span>
          </div>

          {isLoading ? (
            <div className="p-4 text-center text-sm text-slate-500 animate-pulse">Loading specializations...</div>
          ) : specializations.length === 0 ? (
            <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
              <p className="text-sm text-slate-500">No specializations added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {specializations.map((spec) => (
                <div key={spec._id} className="p-4 rounded-2xl border border-black/5 bg-white shadow-sm flex items-center justify-between hover:shadow-md transition">
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-sm text-slate-800 truncate">{spec.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">Slug: {spec.slug}</p>
                  </div>
                  
                  {/* Interactive Status Toggle Button */}
                  <div>
                    <button
                      onClick={() => handleToggleStatus(spec._id, spec.isActive)}
                      className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-full tracking-wider transition-colors shadow-sm hover:shadow focus:outline-none ${
                        spec.isActive 
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                      title={`Click to make ${spec.isActive ? 'Inactive' : 'Active'}`}
                    >
                      {spec.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
      <div className="mt-8">
        <AdminFooter />
      </div>
    </PageShell>
  );
}
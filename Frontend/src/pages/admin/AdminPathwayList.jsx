import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";

// --- CONFIGURATION CONSTANTS ---
const API_BASE_URL = "http://localhost:5000/api";
const STATUS = {
  PUBLISHED: "published",
  DRAFT: "draft"
};

const AdminPathwayList = () => {
  const [templates, setTemplates] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

// Fetches both Master Templates and Specializations concurrently.
  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("edupath_token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Promise all allows us to fetch both endpoints simultaneously for better performance
      const [pathwayRes, specRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/pathway/template?summary=true`, config),
        axios.get(`${API_BASE_URL}/specializations`, config).catch(() => ({ data: { specializations: [] } })) // Silently catch spec errors
      ]);

      setTemplates(pathwayRes.data.templates || []);
      setSpecializations(specRes.data.specializations || []);
    } catch (err) {
      console.error("Fetch Data Error:", err);
      setError("Failed to load pathways. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cross-references the pathway's slug/name with the database to ensure perfect formatting.
  const getPathwayName = (val) => {
    if (!val) return "";
    
    // Try to find exact match in DB
    const found = specializations.find(s => s.slug === val || s.name === val);
    if (found) return found.name;
    
    // Fallback formatting if DB lookup fails
    if (val.includes(" ")) 
      return val;

    return val.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const handleDelete = async (id) => {
    // Utilize window.confirm for a native browser safety check before delete
    if (!globalThis.confirm("Are you sure you want to delete this pathway? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem("edupath_token");
      await axios.delete(`${API_BASE_URL}/pathway/template/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Optimistically update the UI by filtering out the deleted item
      setTemplates(prev => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete pathway");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    // Toggle logic
    const newStatus = currentStatus === STATUS.PUBLISHED ? STATUS.DRAFT : STATUS.PUBLISHED;

    try {
      const token = localStorage.getItem("edupath_token");
      await axios.put(
        `${API_BASE_URL}/pathway/template/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Optimistically update the specific template's status in the local state array
      setTemplates(prev => prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t)));
    } catch (err) {
      console.error("Status Update Error:", err);
      alert(err?.response?.data?.message || "Failed to update status.");
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur">
          <div>
            <h1 className="text-2xl font-semibold text-text-dark">
              Pathway Templates
            </h1>
            <p className="mt-1 text-sm text-muted">
              Manage your master courses and curriculums.
            </p>
          </div>
          <Link
            to="/admin/pathway-builder"
            className="rounded-full bg-primary px-6 py-2.5 font-semibold text-white shadow hover:brightness-95 transition-all active:scale-95"
          >
            + Create New Pathway
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 font-semibold text-center">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-10 text-slate-500 font-bold animate-pulse">
            Fetching templates from database...
          </div>
        )}

        {/* Empty State */}
        {!isLoading && templates.length === 0 && !error && (
          <div className="rounded-[28px] border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center text-slate-500 font-semibold">
            No pathways found. Click "Create New Pathway" to get started.
          </div>
        )}

        {/* Template Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {!isLoading && templates.map((template) => (
              <div
                key={template._id}
                className="flex flex-col justify-between rounded-[24px] border border-black/5 bg-white/80 p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700">
                      {template.level}
                    </span>

                    <button
                      onClick={() => toggleStatus(template._id, template.status)}
                      className={`text-xs font-black uppercase tracking-wider hover:underline transition-colors ${
                        template.status === STATUS.PUBLISHED
                          ? "text-primary"
                          : "text-amber-500"
                      }`}
                    >
                      {template.status === STATUS.PUBLISHED ? "ACTIVE" : "DISABLED"}
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 line-clamp-2">
                    {getPathwayName(template.pathName)}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 font-medium">
                    {template.steps.length}{" "}
                    {template.steps.length === 1 ? "Step" : "Steps"} included
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                  <Link
                    to={`/admin/pathway-edit/${template._id}`}
                    className="flex-1 rounded-full bg-slate-100 py-2.5 text-center text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors active:scale-95"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(template._id)}
                    className="flex-1 rounded-full bg-red-50 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors active:scale-95"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </PageShell>
  );
};

export default AdminPathwayList;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import PageShell from "../../../components/PageShell.jsx";
import AdminFooter from "../../../components/layouts/admin-layouts/AdminFooter.jsx";

const AdminPathwayList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Removed unused navigate variable

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem("edupath_token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data } = await axios.get(
        import.meta.env.VITE_API_URL + "/api/pathway/template",
        config,
      );
      setTemplates(data.templates);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load pathways.");
      setLoading(false);
    }
  };

  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("edupath_token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/pathway/template/${templateToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from UI
      setTemplates(templates.filter((t) => t._id !== templateToDelete._id));
      setTemplateToDelete(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete pathway");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";

    try {
      const token = localStorage.getItem("edupath_token");

      // Changed to axios.put
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/pathway/template/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update UI
      setTemplates(
        templates.map((t) => (t._id === id ? { ...t, status: newStatus } : t)),
      );
    } catch (err) {
      console.error("Status Update Error:", err);
      // This will now alert the EXACT error message from your backend
      alert(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to update status. Check console.",
      );
    }
  };

  return (
    <PageShell>
      {/* Delete Confirmation Popup */}
      {templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Pathway?</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete the <span className="font-semibold text-slate-800">"{templateToDelete.pathName}"</span> template? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTemplateToDelete(null)}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-70"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
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
            className="rounded-full bg-primary px-6 py-2.5 font-semibold text-white shadow hover:brightness-95"
          >
            + Create New Pathway
          </Link>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {/* Loading & Empty States */}
        {loading && (
          <div className="text-center py-10 text-muted">
            Loading pathways...
          </div>
        )}
        {!loading && templates.length === 0 && !error && (
          <div className="rounded-[28px] border border-dashed border-black/10 bg-white/50 p-12 text-center text-muted">
            No pathways found. Click "Create New Pathway" to get started.
          </div>
        )}

        {/* Template Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {!loading &&
            templates.map((template) => (
              <div
                key={template._id}
                className="flex flex-col justify-between rounded-[24px] border border-black/5 bg-white/80 p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {template.level}
                    </span>

                    {/* Clickable Status Toggle */}
                    <button
                      onClick={() =>
                        toggleStatus(template._id, template.status)
                      }
                      className={`text-xs font-bold hover:underline ${
                        template.status === "published"
                          ? "text-emerald-500"
                          : "text-amber-500"
                      }`}
                    >
                      {template.status === "published" ? "ACTIVE" : "DISABLED"}
                    </button>
                  </div>

                  <h3 className="text-lg font-semibold text-text-dark line-clamp-2">
                    {template.pathName}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-primary">
                    {template.specialization}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {template.steps.length}{" "}
                    {template.steps.length === 1 ? "Step" : "Steps"} included
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-black/5 pt-4">
                  {/* Replace the alert button with a Link */}
                  <Link
                    to={`/admin/pathway-edit/${template._id}`}
                    className="flex-1 rounded-full bg-black/5 py-2 text-center text-sm font-semibold text-text-dark hover:bg-black/10 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(template)}
                    className="flex-1 rounded-full bg-red-50 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
      <AdminFooter/>
    </PageShell>
  );
};

export default AdminPathwayList;
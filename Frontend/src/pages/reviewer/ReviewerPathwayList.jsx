import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";

// Builds the reviewer pathway list page
const ReviewerPathwayList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Loads pathway templates when the page opens
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Fetches all pathway templates
  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem("edupath_token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(
        "http://localhost:5000/api/pathway/template",
        config,
      );
      setTemplates(data.templates);
      setLoading(false);
    } catch (err) {
      setError("Failed to load pathways.");
      setLoading(false);
    }
  };

  // Deletes a pathway after confirmation
  const handleDelete = async (id) => {
    if (!globalThis.confirm("Are you sure you want to delete this pathway?"))
      return;
    try {
      const token = localStorage.getItem("edupath_token");
      await axios.delete(`http://localhost:5000/api/pathway/template/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(templates.filter((t) => t._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete pathway");
    }
  };

  // Switches a pathway between draft and published
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    try {
      const token = localStorage.getItem("edupath_token");
      await axios.put(
        `http://localhost:5000/api/pathway/template/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTemplates(
        templates.map((t) => (t._id === id ? { ...t, status: newStatus } : t)),
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update status.");
    }
  };

  return (
    <PageShell>
      {/* Holds the pathway list page */}
      <div className="mx-auto max-w-5xl space-y-6 pb-12">
        {/* Shows the page title and create button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur">
          {/* Shows the pathway list heading */}
          <div>
            <h1 className="text-lg font-semibold text-text-dark">
              My Specialization Pathways
            </h1>
            <p className="mt-1 text-xs text-muted">
              Manage curriculums for your assigned topic.
            </p>
          </div>
          <Link
            to="/reviewer/pathway-builder" // 🔗 CHANGED TO REVIEWER ROUTE
            className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white shadow hover:brightness-95"
          >
            + Create New Pathway
          </Link>
        </div>

        {error && (
          /* Shows pathway loading errors */
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}
        {loading && (
          /* Shows while pathways are loading */
          <div className="py-10 text-center text-xs text-muted">
            Loading pathways...
          </div>
        )}

        {!loading && templates.length === 0 && !error && (
          /* Shows when no pathways exist yet */
          <div className="rounded-[28px] border border-dashed border-black/10 bg-white/50 p-12 text-center text-xs text-muted">
            No pathways found. Click "Create New Pathway" to build your first
            curriculum.
          </div>
        )}

        {/* Holds pathway cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {!loading &&
            templates.map((template) => (
              /* Shows one pathway template */
              <div
                key={template._id}
                className="flex flex-col justify-between rounded-[24px] border border-black/5 bg-white/80 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Shows pathway level, status and step count */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {template.level}
                    </span>
                    <button
                      onClick={() =>
                        toggleStatus(template._id, template.status)
                      }
                      className={`text-xs font-bold hover:underline ${template.status === "published" ? "text-emerald-500" : "text-amber-500"}`}
                    >
                      {template.status === "published" ? "ACTIVE" : "DRAFT"}
                    </button>
                  </div>
                  <h3 className="line-clamp-2 text-sm font-semibold text-text-dark">
                    {template.pathName}
                  </h3>
                  <p className="mt-2 text-xs text-muted">
                    {template.steps.length} Steps included
                  </p>
                </div>
                {/* Holds edit and delete actions */}
                <div className="mt-5 flex items-center gap-2 border-t border-black/5 pt-4">
                  <Link
                    to={`/reviewer/pathway-edit/${template._id}`} // 🔗 CHANGED TO REVIEWER ROUTE
                    className="flex-1 rounded-full bg-black/5 py-2 text-center text-xs font-semibold text-text-dark transition-colors hover:bg-black/10"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(template._id)}
                    className="flex-1 rounded-full bg-red-50 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
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

export default ReviewerPathwayList;

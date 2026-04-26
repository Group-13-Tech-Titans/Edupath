import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminFooter from "../General Pages/AdminFooter.jsx";
import { useApp } from "../../../context/AppProvider.jsx";

// API Endpoints
const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/reviewers`;
const SPEC_API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/specializations`;

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "R";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function AdminReviewers() {
  const [reviewers, setReviewers] = useState([]);
  const [activeSpecializations, setActiveSpecializations] = useState([]);
  
  // State for Create Form
  const [form, setForm] = useState({
    name: "",
    email: "",
    specializationTags: [], // Always an array
  });
  
  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [editingReviewer, setEditingReviewer] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const getAuthHeader = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  }), []);

  // Fetch reviewers
  const fetchReviewers = useCallback(async () => {
    try {
      setError("");
      const res = await axios.get(API_BASE, getAuthHeader());
      setReviewers(res.data.reviewers || res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch reviewers. Please ensure you are logged in as Admin.");
    }
  }, [getAuthHeader]);

  // Fetch active specializations for the dropdowns
  const fetchSpecializations = useCallback(async () => {
    try {
      const res = await axios.get(SPEC_API_BASE, getAuthHeader());
      const allSpecs = res.data.specializations || [];
      setActiveSpecializations(allSpecs.filter(spec => spec.isActive === true));
    } catch (err) {
      console.error("Failed to fetch specializations", err);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchReviewers();
    fetchSpecializations();
  }, [fetchReviewers, fetchSpecializations]);

  // Handle standard text inputs
  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // Add a specialization to the CREATE form
  const handleAddSpecToForm = (e) => {
    const selectedSpec = e.target.value;
    if (selectedSpec && !form.specializationTags.includes(selectedSpec)) {
      setForm((p) => ({ ...p, specializationTags: [...p.specializationTags, selectedSpec] }));
    }
  };

  // Remove a specialization from the CREATE form
  const handleRemoveSpecFromForm = (specToRemove) => {
    setForm((p) => ({
      ...p,
      specializationTags: p.specializationTags.filter((s) => s !== specToRemove),
    }));
  };

  // Handle text changes for EDIT form
  const handleEditChange = (e) => {
    setEditingReviewer((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Add a specialization to the EDIT form
  const handleAddSpecToEdit = (e) => {
    const selectedSpec = e.target.value;
    const currentTags = editingReviewer.specializationTags || [];
    
    if (selectedSpec && !currentTags.includes(selectedSpec)) {
      setEditingReviewer((prev) => ({
        ...prev,
        specializationTags: [...currentTags, selectedSpec],
      }));
    }
  };

  // Remove a specialization from the EDIT form
  const handleRemoveSpecFromEdit = (specToRemove) => {
    setEditingReviewer((prev) => ({
      ...prev,
      specializationTags: prev.specializationTags.filter((s) => s !== specToRemove),
    }));
  };

  // 🟢 FIXED: Safely extract tags for editing, handling both old string format and new array format
  const openEditModal = (reviewer) => {
    let tags = [];
    if (Array.isArray(reviewer.specializationTags) && reviewer.specializationTags.length > 0) {
      tags = [...reviewer.specializationTags];
    } else if (reviewer.specializationTag) {
      tags = [reviewer.specializationTag];
    }
    
    setEditingReviewer({ ...reviewer, specializationTags: tags });
  };

  // Submit CREATE form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.specializationTags.length === 0) {
      setError("Please select at least one specialization.");
      return;
    }

    try {
      await axios.post(API_BASE, form, getAuthHeader());
      fetchReviewers();
      setSuccess("Reviewer account created ✅");
      setForm({ name: "", email: "" , specializationTags: [] });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create reviewer");
    }
  };

  // Submit DELETE form
  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${deleteConfirmId}`, getAuthHeader());
      setReviewers((prev) => prev.filter((r) => (r._id || r.id) !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      alert("Failed to delete reviewer.");
    }
  };

  // Submit EDIT form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const id = editingReviewer._id || editingReviewer.id;
      const res = await axios.put(`${API_BASE}/${id}`, editingReviewer, getAuthHeader());
      
      setReviewers((prev) =>
        prev.map((r) => ((r._id || r.id) === id ? res.data : r))
      );
      setEditingReviewer(null);
      setSuccess("Reviewer updated successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update reviewer.");
    }
  };

  // 🟢 FIXED: Search filter safely checks both array and string formats
  const filteredReviewers = reviewers.filter((r) => {
    let tagsString = "";
    if (Array.isArray(r.specializationTags) && r.specializationTags.length > 0) {
      tagsString = r.specializationTags.join(" ");
    } else if (r.specializationTag) {
      tagsString = r.specializationTag;
    }
    return `${r.name} ${r.email} ${tagsString}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen from-emerald-50 to-white px-4 py-4 relative">
      <div className="mx-auto max-w-6xl grid gap-5 lg:grid-cols-2">
        
        {/* Create Reviewer Form */}
        <div className="rounded-[26px] bg-white/80 shadow-lg p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-bold text-slate-900">Create Reviewer</h2>
          <p className="text-sm text-slate-500 mt-1">
            Fill the form and create a new reviewer login.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            <div>
              <label className="text-sm font-semibold text-slate-700">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Eg: Nuwan Silva"
                className="mt-2 w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="reviewer@edupath.com"
                className="mt-2 w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
                required
              />
            </div>

            
            {/* MULTI-SELECT SPECIALIZATIONS UI */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">
                Specialization Tags
              </label>
              
              {/* Selected Pills */}
              <div className="flex flex-wrap gap-2 mb-3">
                {form.specializationTags.map((tag) => (
                  <div key={tag} className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSpecFromForm(tag)}
                      className="ml-1 text-emerald-600 hover:text-red-500 font-black"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* 🟢 FIXED: Dropdown resets properly by using value="" */}
              <select
                value=""
                onChange={handleAddSpecToForm}
                className="w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100 bg-white"
              >
                <option value="" disabled>+ Add a specialization...</option>
                {activeSpecializations
                  .filter((spec) => !form.specializationTags.includes(spec.name))
                  .map((spec) => (
                    <option key={spec._id} value={spec.name}>
                      {spec.name}
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-emerald-500 py-3 font-bold text-white shadow-md hover:bg-emerald-600 transition"
            >
              Create reviewer
            </button>
          </form>
        </div>

        {/* Existing Reviewers List */}
        <div className="rounded-[26px] bg-white/80 shadow-lg p-6 ring-1 ring-emerald-100">
          <h2 className="text-lg font-bold text-slate-900">Existing reviewers</h2>
          <p className="text-sm text-slate-500 mt-1">
            Search and view created reviewer accounts.
          </p>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviewers..."
            className="mt-4 w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
          />

          <div className="mt-4 space-y-3 lg:max-h-[520px] lg:overflow-y-auto pr-1">
            {filteredReviewers.length === 0 && (
              <p className="text-sm text-slate-400">No reviewers found...</p>
            )}

            {filteredReviewers.map((r) => {
              // 🟢 FIXED: Safely handle legacy single string tag vs new array of tags
              let tagsArray = [];
              if (Array.isArray(r.specializationTags) && r.specializationTags.length > 0) {
                tagsArray = r.specializationTags;
              } else if (r.specializationTag) {
                tagsArray = [r.specializationTag];
              }

              return (
                <div
                  key={r._id || r.id}
                  className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0 w-full">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm shrink-0">
                      {getInitials(r.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 truncate text-sm">{r.name}</p>
                      <p className="text-sm text-slate-500 truncate">{r.email}</p>
                      
                      {/* Render multiple pills in the list */}
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {tagsArray.length > 0 ? (
                          tagsArray.map((tag, idx) => (
                            <span key={idx} className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400">No Specialization</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 border-l pl-3 ml-1">
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(r._id || r.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <br />
      <AdminFooter />

      {/* --- EDIT MODAL --- */}
      {editingReviewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[26px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Edit Reviewer</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Name</label>
                <input
                  name="name"
                  value={editingReviewer.name || ""}
                  onChange={handleEditChange}
                  className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input
                  name="email"
                  type="email"
                  value={editingReviewer.email || ""}
                  onChange={handleEditChange}
                  className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>
              
              {/* MULTI-SELECT SPECIALIZATIONS UI FOR EDIT */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Specialization Tags</label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {(editingReviewer.specializationTags || []).map((tag) => (
                    <div key={tag} className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSpecFromEdit(tag)}
                        className="ml-1 text-emerald-600 hover:text-red-500 font-black"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <select
                  value=""
                  onChange={handleAddSpecToEdit}
                  className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                >
                  <option value="" disabled>+ Add a specialization...</option>
                  {activeSpecializations
                    .filter((spec) => !(editingReviewer.specializationTags || []).includes(spec.name))
                    .map((spec) => (
                      <option key={spec._id} value={spec.name}>
                        {spec.name}
                      </option>
                    ))}
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingReviewer(null)}
                  className="flex-1 rounded-full bg-slate-100 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-emerald-500 py-2.5 font-semibold text-white shadow-md hover:bg-emerald-600 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[26px] bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Reviewer?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete this reviewer? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-full bg-slate-100 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-full bg-red-500 py-2.5 font-semibold text-white shadow-md hover:bg-red-600 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
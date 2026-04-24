import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import AdminFooter from "./AdminFooter.jsx";
import { useApp } from "../../context/AppProvider.jsx";

// Point to the correct authenticated admin endpoint
const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/admin/reviewers`;

// ADD THE SPECIALIZATION API URL
const SPECS_API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/specializations`;

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "R";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function AdminReviewers() {
  const [reviewers, setReviewers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specializationTag: "",
  });
  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [editingReviewer, setEditingReviewer] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [specializationList, setSpecializationList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const submitLock = useRef(false);

  // Helper to translate slug to nice name
  const getSpecName = (slug) => {
    if (!slug) return "No Specialization";
    const spec = specializationList.find((s) => s.slug === slug);
    return spec ? spec.name : slug;
  };

  // Helper to get Auth Headers
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  // Fetch both Reviewers and Specializations
  const fetchData = useCallback(async () => {
    try {
      setError("");
      // Fetch Reviewers
      const resReviewers = await axios.get(API_BASE, getAuthHeader());
      setReviewers(resReviewers.data.reviewers || resReviewers.data || []);

      // Fetch Specializations
      const resSpecs = await axios.get(SPECS_API_BASE);
      setSpecializationList(resSpecs.data.specializations || []);
      
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Please ensure you are logged in as Admin.");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Form handler for CREATE
  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // 🟢 1. අලුතින් එකතු කරපු Function එක! (Edit ෆෝම් එකේ දත්ත වෙනස් කරන්න)
  const handleEditChange = (e) => {
    setEditingReviewer((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Submit handler for CREATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLock.current) return;

    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password || !form.specializationTag) {
      setError("All fields are required!");
      return;
    }

    submitLock.current = true; 
    setIsLoading(true);

    try {
      await axios.post(API_BASE, form, getAuthHeader());
      await fetchData();
      
      setSuccess("Reviewer account created ✅");
      setForm({ name: "", email: "", password: "", specializationTag: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create reviewer");
    } finally {
      submitLock.current = false; 
      setIsLoading(false);
    }
  };

  // Submit handler for DELETE
  const confirmDelete = async () => {
    try {
      const id = deleteConfirmId;
      await axios.delete(`${API_BASE}/${id}`, getAuthHeader());
      setReviewers((prev) => prev.filter((r) => (r._id || r.id) !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      alert("Failed to delete reviewer.");
    }
  };

  // Submit handler for EDIT
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const id = editingReviewer._id || editingReviewer.id;
      const res = await axios.put(`${API_BASE}/${id}`, editingReviewer, getAuthHeader());
      
      setReviewers((prev) =>
        prev.map((r) => ((r._id || r.id) === id ? res.data : r))
      );
      setEditingReviewer(null);
      
      // Update the main list just to be safe
      await fetchData();
      setSuccess("Reviewer updated successfully ✅");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update reviewer.");
    }
  };

  const filteredReviewers = reviewers.filter((r) =>
    `${r.name} ${r.email} ${r.specializationTag}` 
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="reviewer@edupath.com"
                className="mt-2 w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  className="w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  👁
                </button>
              </div>
            </div>

            {/* Create Form Expertise Select */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Expertise
              </label>
              <select
                name="specializationTag"
                value={form.specializationTag}
                onChange={handleChange}
                className="mt-2 w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100 bg-white"
              >
                <option value="">Select expertise...</option>
                {specializationList.map((spec) => (
                  <option key={spec._id} value={spec.slug}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
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

            {filteredReviewers.map((r) => (
              <div
                key={r._id || r.id}
                className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm shrink-0">
                    {getInitials(r.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate text-sm">{r.name}</p>
                    <p className="text-sm text-slate-500 truncate">{r.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {getSpecName(r.specializationTag)}
                  </span>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 border-l pl-3 ml-1">
                    <button
                      onClick={() => setEditingReviewer(r)}
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
            ))}
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
                  onChange={handleEditChange} // දැන් මේක වැඩ කරනවා!
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
              
              {/* 🟢 2. Edit Modal Expertise Select (Create ෆෝම් එකේ විදිහටමයි) */}
              <div>
                <label className="text-sm font-semibold text-slate-700">Expertise</label>
                <select
                  name="specializationTag"
                  value={editingReviewer.specializationTag || ""}
                  onChange={handleEditChange}
                  className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                  required
                >
                  <option value="">Select expertise...</option>
                  {specializationList.map((spec) => (
                    <option key={spec._id} value={spec.slug}>
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
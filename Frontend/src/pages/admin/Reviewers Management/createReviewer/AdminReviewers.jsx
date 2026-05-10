import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminFooter from "../../../../components/layouts/admin-layouts/AdminFooter.jsx";
import { useApp } from "../../../../context/AppProvider.jsx";

// Import Refactored Components
import CreateReviewerForm from "./CreateReviewerForm";
import ReviewersList from "./ReviewersList";
import EditReviewerModal from "./EditReviewerModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

// API Endpoints
const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/reviewers`;
const SPEC_API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/specializations`;

export default function AdminReviewers() {
  const [reviewers, setReviewers] = useState([]);
  const [activeSpecializations, setActiveSpecializations] = useState([]);
  
  const [form, setForm] = useState({ name: "", email: "", specializationTags: [] });
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [editingReviewer, setEditingReviewer] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const getAuthHeader = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  }), []);

  // Fetch Data
  const fetchReviewers = useCallback(async () => {
    try {
      setError("");
      const res = await axios.get(API_BASE, getAuthHeader());
      setReviewers(res.data.reviewers || res.data || []);
    } catch (err) {
      setError("Failed to fetch reviewers. Please ensure you are logged in as Admin.");
    }
  }, [getAuthHeader]);

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

  // Create Form Handlers
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleAddSpecToForm = (e) => {
    const spec = e.target.value;
    if (spec && !form.specializationTags.includes(spec)) {
      setForm((p) => ({ ...p, specializationTags: [...p.specializationTags, spec] }));
    }
  };
  const handleRemoveSpecFromForm = (spec) => setForm((p) => ({ ...p, specializationTags: p.specializationTags.filter((s) => s !== spec) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.specializationTags.length === 0) return setError("Please select at least one specialization.");
    try {
      await axios.post(API_BASE, form, getAuthHeader());
      fetchReviewers();
      setSuccess("Reviewer account created ✅");
      setForm({ name: "", email: "" , specializationTags: [] });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create reviewer");
    }
  };

  // Edit Handlers
  const openEditModal = (reviewer) => {
    let tags = [];
    if (Array.isArray(reviewer.specializationTags) && reviewer.specializationTags.length > 0) tags = [...reviewer.specializationTags];
    else if (reviewer.specializationTag) tags = [reviewer.specializationTag];
    setEditingReviewer({ ...reviewer, specializationTags: tags });
  };
  const handleEditChange = (e) => setEditingReviewer((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleAddSpecToEdit = (e) => {
    const spec = e.target.value;
    if (spec && !editingReviewer.specializationTags.includes(spec)) {
      setEditingReviewer((prev) => ({ ...prev, specializationTags: [...prev.specializationTags, spec] }));
    }
  };
  const handleRemoveSpecFromEdit = (spec) => setEditingReviewer((prev) => ({ ...prev, specializationTags: prev.specializationTags.filter((s) => s !== spec) }));

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const id = editingReviewer._id || editingReviewer.id;
      const res = await axios.put(`${API_BASE}/${id}`, editingReviewer, getAuthHeader());
      setReviewers((prev) => prev.map((r) => ((r._id || r.id) === id ? res.data : r)));
      setEditingReviewer(null);
      setSuccess("Reviewer updated successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update reviewer.");
    }
  };

  // Delete Handler
  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${deleteConfirmId}`, getAuthHeader());
      setReviewers((prev) => prev.filter((r) => (r._id || r.id) !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      alert("Failed to delete reviewer.");
    }
  };

  // Search Filter
  const filteredReviewers = reviewers.filter((r) => {
    let tagsString = Array.isArray(r.specializationTags) ? r.specializationTags.join(" ") : r.specializationTag || "";
    return `${r.name} ${r.email} ${tagsString}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen from-emerald-50 to-white px-4 py-4 relative">
      <div className="mx-auto max-w-6xl grid gap-5 lg:grid-cols-2">
        
        {/* 1. Create Form Component */}
        <CreateReviewerForm 
          form={form}
          error={error}
          success={success}
          activeSpecializations={activeSpecializations}
          handleChange={handleChange}
          handleAddSpecToForm={handleAddSpecToForm}
          handleRemoveSpecFromForm={handleRemoveSpecFromForm}
          handleSubmit={handleSubmit}
        />

        {/* 2. Reviewers List Component */}
        <ReviewersList 
          search={search}
          setSearch={setSearch}
          filteredReviewers={filteredReviewers}
          openEditModal={openEditModal}
          setDeleteConfirmId={setDeleteConfirmId}
        />
      </div>
      
      <br />
      <AdminFooter />

      {/* 3. Edit Modal Component */}
      <EditReviewerModal 
        editingReviewer={editingReviewer}
        setEditingReviewer={setEditingReviewer}
        handleEditChange={handleEditChange}
        handleEditSubmit={handleEditSubmit}
        handleAddSpecToEdit={handleAddSpecToEdit}
        handleRemoveSpecFromEdit={handleRemoveSpecFromEdit}
        activeSpecializations={activeSpecializations}
      />

      {/* 4. Delete Confirmation Component */}
      <DeleteConfirmModal 
        deleteConfirmId={deleteConfirmId}
        setDeleteConfirmId={setDeleteConfirmId}
        confirmDelete={confirmDelete}
      />
    </div>
  );
}
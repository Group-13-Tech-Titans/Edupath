import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminFooter from "../../../../components/layouts/admin-layouts/AdminFooter.jsx";

// Import Refactored Sub-Components
import CreateReviewerForm from "./CreateReviewerForm";
import ReviewersList from "./ReviewersList";
import EditReviewerModal from "./EditReviewerModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

// API Endpoints for reviewers and specializations
const API_BASE = `${import.meta.env.VITE_API_URL}/api/admin/reviewers`;
const SPEC_API_BASE = `${import.meta.env.VITE_API_URL}/api/specializations`;

export default function AdminReviewers() {
  
  // Main data states
  const [reviewers, setReviewers] = useState([]);
  const [activeSpecializations, setActiveSpecializations] = useState([]);
  
  // UI and Error states
  const [search, setSearch] = useState("");
  const [fetchError, setFetchError] = useState("");

  // Modal control states
  const [editingReviewer, setEditingReviewer] = useState(null); // Holds data of the reviewer being edited
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); // Holds ID of the reviewer to be deleted

  // Generates the authorization header using the token from local storage
  const getAuthHeader = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  }), []);

  // Fetches all reviewers from the backend
  const fetchReviewers = useCallback(async () => {
    try {
      setFetchError("");
      const res = await axios.get(API_BASE, getAuthHeader());
      setReviewers(res.data.reviewers || res.data || []);
    } catch (err) {
      setFetchError("Failed to fetch reviewers. Please ensure you are logged in as Admin.");
    }
  }, [getAuthHeader]);

  // Fetches available active specializations for the dropdowns
  const fetchSpecializations = useCallback(async () => {
    try {
      const res = await axios.get(SPEC_API_BASE, getAuthHeader());
      const allSpecs = res.data.specializations || [];
      // Only keep specializations that are currently active
      setActiveSpecializations(allSpecs.filter(spec => spec.isActive === true));
    } catch (err) {
      console.error("Failed to fetch specializations", err);
    }
  }, [getAuthHeader]);

  // Run data fetching when the component first loads
  useEffect(() => {
    fetchReviewers();
    fetchSpecializations();
  }, [fetchReviewers, fetchSpecializations]);

  // Filters the reviewers list based on the search query (checks name, email, and tags)
  const filteredReviewers = reviewers.filter((r) => {
    let tagsString = Array.isArray(r.specializationTags) ? r.specializationTags.join(" ") : r.specializationTag || "";
    return `${r.name} ${r.email} ${tagsString}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen from-emerald-50 to-white px-4 py-4 relative">
      
      {/* Display top-level fetch errors if any */}
      {fetchError && (
        <div className="max-w-6xl mx-auto mb-4 p-4 bg-red-100 text-red-700 rounded-2xl font-medium">
          {fetchError}
        </div>
      )}
      
      <div className="mx-auto max-w-6xl grid gap-5 lg:grid-cols-2">
        
        {/* Create Form Component  */}
        <CreateReviewerForm 
          activeSpecializations={activeSpecializations}
          API_BASE={API_BASE}
          getAuthHeader={getAuthHeader}
          fetchReviewers={fetchReviewers}
        />

        {/* Reviewers List Component  */}
        <ReviewersList 
          search={search}
          setSearch={setSearch}
          filteredReviewers={filteredReviewers}
          openEditModal={(reviewer) => setEditingReviewer(reviewer)}  
          setDeleteConfirmId={setDeleteConfirmId}
        />
      </div>
      
      <br />
      <AdminFooter />

      {/* Edit Modal Component  */}
      <EditReviewerModal 
        editingReviewer={editingReviewer}
        setEditingReviewer={setEditingReviewer}
        activeSpecializations={activeSpecializations}
        API_BASE={API_BASE}
        getAuthHeader={getAuthHeader}
        fetchReviewers={fetchReviewers}
      />

      {/* Delete Confirmation Modal ) */}
      <DeleteConfirmModal 
        deleteConfirmId={deleteConfirmId}
        setDeleteConfirmId={setDeleteConfirmId}
        API_BASE={API_BASE}
        getAuthHeader={getAuthHeader}
        fetchReviewers={fetchReviewers}
      />
      
    </div>
  );
}
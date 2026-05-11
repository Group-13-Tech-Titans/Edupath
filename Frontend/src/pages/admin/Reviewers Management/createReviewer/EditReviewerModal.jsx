import React, { useState, useEffect } from "react";
import axios from "axios";

// Modal component used to edit an existing reviewer's details
export default function EditReviewerModal({
  editingReviewer,         // The reviewer object passed from the parent to edit
  setEditingReviewer,      // Function to close the modal by setting this to null
  activeSpecializations,   // List of available specializations for the dropdown
  API_BASE,                // The base API URL for reviewers
  getAuthHeader,           // Function to get the authorization token
  fetchReviewers           // Function to refresh the list after updating
}) {
  // Local state to hold the form data while editing
  const [formData, setFormData] = useState({ name: "", email: "", specializationTags: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Whenever the modal opens (editingReviewer changes), populate the local form data
  useEffect(() => {
    if (editingReviewer) {
      setFormData({
        ...editingReviewer,
        // Ensure tags are properly formatted as an array
        specializationTags: editingReviewer.specializationTags || []
      });
      setError(""); // Clear any previous errors when opening
    }
  }, [editingReviewer]);

  // If there is no reviewer currently being edited, don't render the modal
  if (!editingReviewer) return null;

  // Handles standard text input changes
  const handleEditChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Adds a new tag to the local form state
  const handleAddSpecToEdit = (e) => {
    const spec = e.target.value;
    if (spec && !formData.specializationTags.includes(spec)) {
      setFormData((prev) => ({
        ...prev,
        specializationTags: [...prev.specializationTags, spec]
      }));
    }
  };

  // Removes a tag from the local form state
  const handleRemoveSpecFromEdit = (specToRemove) => {
    setFormData((prev) => ({
      ...prev,
      specializationTags: prev.specializationTags.filter((tag) => tag !== specToRemove)
    }));
  };

  // Submits the updated data to the API
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const id = formData._id || formData.id;
      // Send PUT request to update the reviewer in the backend
      await axios.put(`${API_BASE}/${id}`, formData, getAuthHeader());
      
      // Refresh the reviewers list in the parent component to show new data
      fetchReviewers();
      
      // Close the modal upon success
      setEditingReviewer(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update reviewer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Background overlay with blur effect 
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      
      {/* Modal Container */}
      <div className="w-full max-w-md rounded-[26px] bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Edit Reviewer</h3>
        
        <form onSubmit={handleEditSubmit} className="space-y-4">
          
          {/* Show error message if API fails */}
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          {/* Name Input Field */}
          <div>
            <label className="text-sm font-semibold text-slate-700">Name</label>
            <input
              name="name"
              value={formData.name || ""}
              onChange={handleEditChange}
              className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition"
              required
            />
          </div>
          
          {/* Email Input Field */}
          <div>
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleEditChange}
              className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition"
              required
            />
          </div>
          
          {/* Specialization Tags Section */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Specialization Tags</label>
            
            {/* Display currently selected tags as visual pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {(formData.specializationTags || []).map((tag) => (
                <div key={tag} className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
                  {tag}
                  
                  {/* Button to remove a specific tag */}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSpecFromEdit(tag)}
                    className="ml-1 text-emerald-600 hover:text-red-500 font-black"
                    title="Remove specialization"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Dropdown to select and add new specializations */}
            <select
              value=""
              onChange={handleAddSpecToEdit}
              className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 bg-white cursor-pointer"
            >
              <option value="" disabled>+ Add a specialization...</option>
              
              {/* Filter out already selected tags so they don't appear in the dropdown */}
              {activeSpecializations
                .filter((spec) => !(formData.specializationTags || []).includes(spec.name))
                .map((spec) => (
                  <option key={spec._id} value={spec.name}>
                    {spec.name}
                  </option>
                ))}
            </select>
          </div>
          
          {/* Form Action Buttons */}
          <div className="flex gap-3 pt-4">
            
            {/* Cancel Button: Closes the modal by clearing the editing state */}
            <button
              type="button"
              onClick={() => setEditingReviewer(null)}
              disabled={isSubmitting}
              className="flex-1 rounded-full bg-slate-100 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 transition disabled:opacity-50"
            >
              Cancel
            </button>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-full bg-emerald-500 py-2.5 font-semibold text-white shadow-md hover:bg-emerald-600 transition disabled:opacity-70 flex justify-center items-center"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import axios from "axios";
// Import the warning icon from lucide-react
import { AlertTriangle } from "lucide-react";

// Modal component to confirm and execute the deletion of a reviewer
export default function DeleteConfirmModal({ 
  deleteConfirmId, 
  setDeleteConfirmId, 
  API_BASE, 
  getAuthHeader, 
  fetchReviewers // Passed down to refresh the list after successful deletion
}) {
  // Local state to manage the loading status of the delete button
  const [isDeleting, setIsDeleting] = useState(false);

  // If there is no ID set for deletion, do not render the modal
  if (!deleteConfirmId) return null;

  // Handles the actual API call to delete the reviewer
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE}/${deleteConfirmId}`, getAuthHeader());
      
      // Refresh the list in the parent component
      fetchReviewers();
      
      // Close the modal upon success
      setDeleteConfirmId(null);
    } catch (err) {
      alert("Failed to delete reviewer. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    // Background overlay with a subtle blur effect
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      
      {/* Modal Container */}
      <div className="w-full max-w-sm rounded-[26px] bg-white p-6 shadow-2xl text-center">
        
        {/* Warning Icon Container */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" strokeWidth={2} />
        </div>
        
        {/* Confirmation Text */}
        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Reviewer?</h3>
        <p className="text-slate-500 text-sm mb-6">
          Are you sure you want to delete this reviewer? This action cannot be undone.
        </p>
        
        {/* Action Buttons Container */}
        <div className="flex gap-3">
          
          {/* Cancel Button: Closes the modal by clearing the selected ID */}
          <button
            onClick={() => setDeleteConfirmId(null)}
            disabled={isDeleting}
            className="flex-1 rounded-full bg-slate-100 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 transition disabled:opacity-50"
          >
            Cancel
          </button>
          
          {/* Confirm Button: Triggers the actual delete function */}
          <button
            onClick={confirmDelete}
            disabled={isDeleting}
            className="flex-1 rounded-full bg-red-500 py-2.5 font-semibold text-white shadow-md hover:bg-red-600 transition flex items-center justify-center disabled:opacity-70"
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </button>
          
        </div>
      </div>
    </div>
  );
}
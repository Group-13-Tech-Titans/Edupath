import React from "react";

export default function DeleteConfirmModal({ deleteConfirmId, setDeleteConfirmId, confirmDelete }) {
  if (!deleteConfirmId) return null;

  return (
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
  );
}
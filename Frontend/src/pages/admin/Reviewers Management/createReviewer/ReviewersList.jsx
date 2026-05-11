import React from "react";
import { Pencil, Trash2 } from "lucide-react";

// Helper function to extract initials from a name 
const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "R";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

//export reviewers list 
export default function ReviewersList({
  search = "",
  setSearch,
  filteredReviewers = [],
  openEditModal,
  setDeleteConfirmId,
}) {
  return (
    <div className="rounded-[26px] bg-white/80 shadow-lg p-6 ring-1 ring-emerald-100">
      
      {/* Header Section */}
      <h2 className="text-lg font-bold text-slate-900">Existing reviewers</h2>
      <p className="text-sm text-slate-500 mt-1">
        Search and view created reviewer accounts.
      </p>

      {/* Search Input Field */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search reviewers..."
        className="mt-4 w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100 transition"
      />

      {/* List Container with Scrollbar */}
      <div className="mt-4 space-y-3 lg:max-h-[520px] lg:overflow-y-auto pr-1">
        
        {/* no matching search results */}
        {filteredReviewers.length === 0 && (
          <p className="text-sm text-slate-400 mt-4 text-center">No reviewers found...</p>
        )}

        {/* Map through the filtered reviewers array and render cards */}
        {filteredReviewers.map((r) => {
          
          // Normalize specialization tags to always be an array
          let tagsArray = [];
          if (Array.isArray(r.specializationTags) && r.specializationTags.length > 0) {
            tagsArray = r.specializationTags;
          } else if (r.specializationTag) {
            tagsArray = [r.specializationTag];
          }

          return (
            <div
              key={r._id || r.id}
              className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3 shadow-sm hover:shadow-md transition"
            >
              
              {/* Left Side: Avatar and Reviewer Info */}
              <div className="flex items-center gap-3 min-w-0 w-full">
                
                {/* Avatar Badge */}
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm shrink-0">
                  {getInitials(r.name)}
                </div>
                
                {/* Reviewer Name, Email, and Tags */}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 truncate text-sm">{r.name}</p>
                  <p className="text-sm text-slate-500 truncate">{r.email}</p>
                  
                  {/* Tags Wrapper */}
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

              {/* Right Side: Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 border-l pl-3 ml-1">
                  
                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(r)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                    title="Edit Reviewer"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => setDeleteConfirmId(r._id || r.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete Reviewer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
import React from "react";

export default function ProfileHeader({ 
  editing, 
  isUpdatingProfile, 
  onAddAdminClick, 
  onEditClick, 
  onCancelClick 
}) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Title and description section */}
        <div>
          <h1 className="text-xl font-semibold text-text-dark">Admin Profile</h1>
          <p className="mt-1 text-xs text-muted">Update admin details and manage account security.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={onAddAdminClick} 
            className="rounded-full bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-700 transition"
          >
            + Add New Admin
          </button>
          
          {/* Conditional rendering for Edit / Save buttons */}
          {!editing ? (
            <button 
              onClick={onEditClick} 
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow hover:brightness-95"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button 
                onClick={onCancelClick} 
                className="rounded-full bg-black/5 px-5 py-2.5 text-sm font-semibold text-text-dark hover:bg-black/10"
              >
                Cancel
              </button>
              {/* Form submit button linked by 'form' attribute */}
              <button 
                form="profileForm" 
                type="submit" 
                disabled={isUpdatingProfile} 
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow hover:brightness-95 disabled:opacity-70"
              >
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
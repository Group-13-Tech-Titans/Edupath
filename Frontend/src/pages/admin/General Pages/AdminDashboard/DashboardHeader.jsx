import React from "react";

export default function DashboardHeader({ onProfileClick }) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Title and Description */}
        <div>
          <h1 className="text-xl font-semibold text-text-dark">
            System Dashboard
          </h1>
          <p className="mt-1 text-xs text-muted">
            Manage platform users, verify educators, and add reviewers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Profile view Button */}
          <button 
            className="rounded-full bg-primary/15 px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-primary/20 transition" 
            onClick={onProfileClick}
          >
            Profile
          </button>
        </div>
      </div>
    </div>
  );
}
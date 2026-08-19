import React from "react";

// Component to show quick course statistics
export default function CourseOverviewStats({ stats, selectedStatus, onStatusChange }) {
  return (
    // Main container box
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      {/* Title and description */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">Course Overview</h1>
        <p className="mt-1 text-xs text-slate-500">
          Quick statistics on course submissions across the platform.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Pending courses  card */}
        <div 
          onClick={() => onStatusChange("pending")}
          className={`rounded-2xl border bg-amber-50/50 p-4 flex flex-col justify-center items-start cursor-pointer transition-all duration-200 hover:shadow-md ${selectedStatus === "pending" ? "border-amber-500 shadow-sm" : "border-black/5"}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending</span>
          </div>
          <span className="text-3xl font-extrabold text-slate-900">{stats.pending}</span>
        </div>

        {/* Approved courses  card */}
        <div 
          onClick={() => onStatusChange("approved")}
          className={`rounded-2xl border bg-emerald-50/50 p-4 flex flex-col justify-center items-start cursor-pointer transition-all duration-200 hover:shadow-md ${selectedStatus === "approved" ? "border-emerald-500 shadow-sm" : "border-black/5"}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Approved</span>
          </div>
          <span className="text-3xl font-extrabold text-slate-900">{stats.approved}</span>
        </div>

        {/* Rejected courses  card */}
        <div 
          onClick={() => onStatusChange("rejected")}
          className={`rounded-2xl border bg-red-50/50 p-4 flex flex-col justify-center items-start cursor-pointer transition-all duration-200 hover:shadow-md ${selectedStatus === "rejected" ? "border-red-500 shadow-sm" : "border-black/5"}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">Rejected</span>
          </div>
          <span className="text-3xl font-extrabold text-slate-900">{stats.rejected}</span>
        </div>
      </div>
    </div>
  );
}
import React from "react";

// Specializations Header Component
export default function SpecializationsHeader() {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Manage Specializations</h1>
        <p className="mt-1 text-xs text-slate-500">
          Add new subject areas or technical fields to assign to reviewers and educators.
        </p>
      </div>
    </div>
  );
}
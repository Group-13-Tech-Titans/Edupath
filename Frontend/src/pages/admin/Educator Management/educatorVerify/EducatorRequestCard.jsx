import React from "react";

// Helper Functions & Sub-components
function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "E";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

const MiniPill = ({ label }) => (
  <span className="rounded-full bg-black/5 px-3 py-1">{label}</span>
);

const Avatar = ({ name }) => (
  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-sm">
    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
      {getInitials(name)}
    </div>
  </div>
);

// Main Card Component
export default function EducatorRequestCard({ educator, onVerifyClick }) {
  const fullName = educator.fullName || educator.name || "Unknown";
  const field = educator.field || educator.specialization || "N/A";
  const submitDate = educator.submittedAt || educator.createdAt;

  return (
    <div className="rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar name={fullName !== "Unknown" ? fullName : educator.email} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-dark">
              {fullName}
            </p>
            <p className="truncate text-xs text-muted">{educator.email}</p>

            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <MiniPill label={`Field: ${field}`} />
              <MiniPill label={`Level: ${educator.educationLevel || "N/A"}`} />
              <MiniPill
                label={`Submitted: ${
                  submitDate ? new Date(submitDate).toLocaleDateString() : "—"
                }`}
              />
            </div>
          </div>
        </div>

        <button
          onClick={onVerifyClick}
          className="rounded-full bg-amber-100 px-5 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-200 transition shadow-sm"
        >
          Verify
        </button>
      </div>
    </div>
  );
}
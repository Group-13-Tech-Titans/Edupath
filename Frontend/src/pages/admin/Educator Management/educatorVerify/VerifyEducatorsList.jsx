import React from "react";
import EducatorRequestCard from "./EducatorRequestCard";

export default function VerifyEducatorsList({ isLoading, error, sortedRequests, onVerifyClick }) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-dark">Pending Approvals</h2>
      </div>

      <div className="mt-4 space-y-3">
        {/* Loading State */}
        {isLoading && (
          <div className="rounded-2xl border border-black/5 bg-white/60 p-4 text-sm text-muted animate-pulse">
            Loading pending requests...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Render List */}
        {!isLoading && !error && sortedRequests.map((e) => (
          <EducatorRequestCard 
            key={e._id || e.id} 
            educator={e} 
            onVerifyClick={() => onVerifyClick(e)} 
          />
        ))}

        {/* Empty State */}
        {!isLoading && !error && sortedRequests.length === 0 && (
          <div className="rounded-2xl border border-black/5 bg-white/60 p-4 text-sm text-muted">
            No pending educators found.
          </div>
        )}
      </div>
    </div>
  );
}
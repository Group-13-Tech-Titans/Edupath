import React from "react";

export default function PendingEducatorsPreview({ 
  isLoading, 
  pendingRequests, 
  onViewAllClick, 
  onViewEducatorClick 
}) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-dark">
          Verify Educators
        </h2>
        <button 
          className="text-sm font-semibold text-primary hover:underline" 
          onClick={onViewAllClick} 
        >
          View All
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && (
          <div className="rounded-[22px] border border-black/5 bg-white/60 p-4 text-sm text-muted animate-pulse">
            Loading requests...
          </div>
        )}

        {!isLoading && pendingRequests.map((req) => {
          const educatorId = req._id || req.id;
          const name = req.fullName || req.name || "Unknown Educator";
          const field = req.field || req.specialization || "General";

          return (
            <div
              key={educatorId}
              className="flex flex-col gap-3 rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-text-dark">
                  Educator Verification: {name}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {req.email} • Field: {field}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onViewEducatorClick(req)}
                  className="rounded-full bg-amber-100 px-6 py-2 text-sm font-bold text-amber-700 shadow-sm hover:bg-amber-200 transition"
                >
                  View
                </button>
              </div>
            </div>
          );
        })}

        {!isLoading && pendingRequests.length === 0 && (
          <div className="rounded-[22px] border border-black/5 bg-white/60 p-4 text-sm text-muted">
            No approvals pending right now.
          </div>
        )}
      </div>
    </div>
  );
}
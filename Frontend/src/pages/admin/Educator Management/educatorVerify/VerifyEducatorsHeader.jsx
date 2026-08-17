import React from "react";

//header component for educator verification page
export default function VerifyEducatorsHeader() {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-dark">
            Educator Requests
          </h1>
          <p className="mt-1 text-xs text-muted">
            Recent educator verification requests submitted to the platform.
          </p>
        </div>
      </div>
    </div>
  );
}
import React from "react";

export function Pill({ label, bg = "bg-slate-100", text = "text-slate-600" }) {
  if (!label) return null;
  return (
    // Renders a small, rounded badge with uppercase text and a light shadow
    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-black/5 shadow-sm ${bg} ${text}`}>
      {label}
    </span>
  );
}
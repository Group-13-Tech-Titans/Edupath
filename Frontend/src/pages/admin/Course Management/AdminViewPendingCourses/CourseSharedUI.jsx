import React from "react";

export function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-slate-50/80 px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold text-slate-600">
      {children}
    </span>
  );
}

// This is used automatically if a course or user doesn't have their own picture uploaded.
export const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80";


import React from "react";
import { ArrowLeft } from "lucide-react";


//header section for educator review page, includes back button and title
export default function ReviewHeader({ onBack }) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition"
          title="Go Back"
        >
          {/* Back Button */}
          <ArrowLeft className="w-6 h-6 stroke-[1.5]" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-text-dark">Review Application</h1>
          <p className="mt-1 text-xs text-muted">Review details and verify the educator.</p>
        </div>
      </div>
    </div>
  );
}
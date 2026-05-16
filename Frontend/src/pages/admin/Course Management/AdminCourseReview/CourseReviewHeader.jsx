import React from "react";
import { ArrowLeft } from "lucide-react";

//admin course review header component, includes a back button and title
export default function CourseReviewHeader({ onBack }) {
  return (
    // Main container box with a light shadow and blur effect
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur flex items-center gap-4">
      {/* Back button */ }
      <button 
        onClick={onBack} 
        className="p-2 rounded-full bg-white hover:bg-slate-100 shadow-sm transition"
        title="Go Back"
      >
        <ArrowLeft className="w-5 h-5 text-slate-600 stroke-[2]" />
      </button>

      {/* Title and description text area */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Admin Course Review</h1>
        <p className="text-xs text-slate-500 mt-0.5">Evaluate the course content and provide your decision.</p>
      </div>
    </div>
  );
}
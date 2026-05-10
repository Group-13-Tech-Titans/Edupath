import React from "react";
import { ClipboardCheck } from "lucide-react"; // 
import PendingCourseCard from "./PendingCourseCard";

export default function CoursesGrid({ isLoading, error, filteredCourses, openCourse }) {
  if (isLoading) {
    return (
      <div className="rounded-[26px] border border-black/5 bg-white/60 p-5 text-sm text-slate-500 animate-pulse text-center">
        Loading pending courses...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[26px] border border-red-200 bg-red-50 p-5 text-sm text-red-600 text-center">
        {error}
      </div>
    );
  }

  if (filteredCourses.length === 0) {
    return (
      <div className="rounded-[26px] border border-black/5 bg-white/60 p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">

            
          <ClipboardCheck className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold text-slate-700">All Caught Up!</p>
        <p className="text-xs text-slate-500 mt-1">No pending courses require your attention right now.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {filteredCourses.map((c) => (
        <PendingCourseCard 
          key={c._id || c.id} 
          course={c} 
          openCourse={openCourse} 
        />
      ))}
    </div>
  );
}
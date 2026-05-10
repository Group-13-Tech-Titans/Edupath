import React from "react";
import { User } from "lucide-react"; // 🔴 SVG වෙනුවට Lucide Icon එක ගත්තා
import { Pill, FALLBACK_IMAGE } from "./CourseSharedUI";

export default function PendingCourseCard({ course, openCourse }) {
  const courseId = course._id || course.id;
  const educatorName = course.educator?.name || course.educator?.fullName || course.educatorName || "Unknown Educator";

  return (
    <div className="flex flex-col rounded-[26px] border border-black/5 bg-white/80 shadow-[0_14px_40px_rgba(0,0,0,0.08)] backdrop-blur overflow-hidden transition-transform hover:-translate-y-1">
      {/* Image */}
      <button
        type="button"
        onClick={() => openCourse(courseId)}
        className="block w-full text-left shrink-0 relative h-36"
        title="Open course"
      >
        <img
          src={course.thumbnailUrl || course.imageUrl || FALLBACK_IMAGE}
          alt={course.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
        
        {/* Status Badge Over Image */}
        <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
          Needs Review
        </div>
      </button>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <p className="text-base font-extrabold text-slate-900 line-clamp-1">
          {course.title}
        </p>
        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {course.desc || course.description}
        </p>
        
        <p className="mt-3 text-[11px] font-semibold text-slate-600 truncate flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 opacity-70" />
          {educatorName}
        </p>

        {/* Pills row */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {course.category && <Pill>{course.category}</Pill>}
          {course.level && <Pill>{course.level}</Pill>}
        </div>

        {/* Review Action Button */}
        <div className="mt-auto pt-5">
          <button
            type="button"
            onClick={() => openCourse(courseId)}
            className="w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
          >
            Review Course
          </button>
        </div>
      </div>
    </div>
  );
}
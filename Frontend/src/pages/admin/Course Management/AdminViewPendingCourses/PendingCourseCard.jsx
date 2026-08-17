import React from "react";
import { User } from "lucide-react"; 
import { Pill, FALLBACK_IMAGE } from "./CourseSharedUI";


// A card component to display courses waiting for admin review
export default function PendingCourseCard({ course, openCourse }) {
  const courseId = course._id || course.id; //  get course id
  const educatorName = course.educator?.name || course.educator?.fullName || course.educatorName || "Unknown Educator"; // get educator name 

  return (
    // The main card container with hover effect
    <div className="flex flex-col rounded-[26px] border border-black/5 bg-white/80 shadow-[0_14px_40px_rgba(0,0,0,0.08)] backdrop-blur overflow-hidden transition-transform hover:-translate-y-1">

      {/* Clickable Image Section */}
      <button
        type="button"
        onClick={() => openCourse(courseId)}
        className="block w-full text-left shrink-0 relative h-36"
        title="Open course"
      >
        {/*show course image  or fallback image*/}
        <img
          src={course.thumbnailUrl || course.imageUrl || FALLBACK_IMAGE}
          alt={course.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
        
        {/* "Needs Review" badge on the top left corner */}
        <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
          Needs Review
        </div>
      </button>

      {/* Card Details Section */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Display course title */}
        <p className="text-base font-extrabold text-slate-900 line-clamp-1">
          {course.title}
        </p>
        {/* Display course description with a limit of 2 lines */}
        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {course.desc || course.description}
        </p>
        
        {/* Educator's name with a small user icon */}
        <p className="mt-3 text-[11px] font-semibold text-slate-600 truncate flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 opacity-70" />
          {educatorName}
        </p>

        {/* Category and Level Pills */}
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
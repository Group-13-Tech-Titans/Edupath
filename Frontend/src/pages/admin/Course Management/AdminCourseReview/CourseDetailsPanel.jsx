import React from "react";
import { User, FileText } from "lucide-react";
import { Pill } from "./CourseSharedUI";

// Component to show the full details of a specific course
export default function CourseDetailsPanel({ course }) {
  

  //no content or files uploaded show simple message
    const renderContent = (content) => {
    if (!content || (typeof content === 'object' && Object.keys(content).length === 0)) {
      return <p className="text-sm text-slate-500">No content or files uploaded.</p>;
    }

    // content is a test string (website link)
    if (typeof content === 'string') {
      if (content.startsWith('http')) {
        return (
          <a href={content} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">
            View External Link ↗
          </a>
        );
      }
      return <p className="text-sm text-slate-600">{content}</p>;
    }
    // content has list of uploaded files (pdf,video, etc)
    if (typeof content === 'object' && content.items && Array.isArray(content.items)) {
      if (content.items.length === 0) {
        return <p className="text-sm text-slate-500">No files found in the content list.</p>;
      }

      return (
        <ul className="space-y-3">
          {/* List of uploaded files */}
          {content.items.map((item, index) => (
            <li key={item.id || index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                {/* File name and details */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate" title={item.name}>
                    {item.name || "Unnamed Document"}
                  </p>
                  {/* File type  */}
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                      {item.format || item.type || "FILE"}
                      {/* Show file size if available */}
                    </span>
                    {item.bytes && (
                      <span className="text-[10px] text-slate-400">
                        {(item.bytes / 1024 / 1024).toFixed(2)} MB 
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Link to open the file if URL is provided */}
              {item.url && (
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="shrink-0 px-4 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                >
                  Open ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      );
    }

    // weird data format, just print it as raw code
    return (
      <pre className="text-xs font-mono text-slate-700 bg-slate-100 p-2 rounded max-h-64 overflow-y-auto">
        {JSON.stringify(content, null, 2)}
      </pre>
    );
  };

  return (
    <div className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-sm space-y-5 h-fit">
      
      {/* Thumbnail Image */}
      <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group cursor-pointer">
        <a href={course.thumbnailUrl || course.content} target="_blank" rel="noreferrer" title="Click to view full image">
          <img 
          //thumbnail image, if not available show default image
            src={course.thumbnailUrl || "https://images.unsplash.com/photo-1515879218367-8466d910aaa4"}  
            alt="Thumbnail" 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg">
              View Full Image ↗
            </span>
          </div>
        </a>
      </div>

      {/* Course Info */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">{course.title}</h2>
        {/* Educator Info */}
        <p className="text-sm font-medium text-emerald-600 mt-1 flex items-center gap-1.5">
          <User className="w-4 h-4" />
          Educator: {course.educatorName || "Unknown"}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">Email: {course.createdByEducatorEmail}</p>
      </div>

      {/* Quick Info Badges (Category, Level, Duration, Price) */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
        <Pill label={course.category || "General"} />
        <Pill label={course.level || "Beginner"} />
        <Pill label={course.specializationTag || "No Specialization"} />
        <Pill label={`${course.duration || 0} Hours`} bg="bg-blue-50" text="text-blue-600" />
        <Pill label="Free Course ($1/Enrollment)" bg="bg-emerald-50" text="text-emerald-700" />
      </div>

      {/* Description Box*/}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-1.5">Description</h3>
        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {course.description || "No description provided."}
        </p>
      </div>

      {/* Course Content */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-1.5">Course Content / Resources</h3>
        {/* Render course content based on its type (text, list of files, or external link) */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 overflow-x-auto">
          <div className="text-sm text-slate-600 break-all">
            {renderContent(course.content)}
          </div>
        </div>
      </div>

    </div>
  );
}
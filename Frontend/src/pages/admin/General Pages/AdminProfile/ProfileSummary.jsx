import React from "react";
import { InfoRow } from "./ProfileSharedUI";

export default function ProfileSummary({ profile }) {
  
  // Helper function to generate initials from full name 
  const getInitials = (name) => {
    if (!name) return "EP";  // Default initials if name is missing
    const parts = name.trim().split(/\s+/); // Split by whitespace and filter out empty parts
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase(); //user have only one name, use first letter as initial
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      
      <div className="flex items-center gap-4">
        {/* Avatar circle with initials */}
        <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0 select-none">
          {getInitials(profile.fullName)}
        </div>
        
        <div className="min-w-0">
          {/* full name */}
          <p className="truncate text-base font-semibold text-slate-900">
            {profile.fullName}
          </p>
          {/* email */}
          <p className="truncate text-xs text-slate-500">{profile.email}</p>
          
          {/* role badge */}
          <span className="mt-1.5 inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-emerald-600 border border-emerald-100 uppercase">
            {profile.role}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        {/* account update date */}
        <InfoRow
          label="Last updated"
          value={
            profile.updatedAt
              ? new Date(profile.updatedAt).toLocaleString()
              : "—"
          }
        />
      </div>
    </div>
  );
}
import React from "react";
// Import shared UI components to keep the design consistent
import { AvatarCircle, InfoRow } from "./ProfileSharedUI";

// Component to display a quick summary of the user's profile (usually on the left side)
export default function ProfileSummary({ profile }) {
  return (
    // Main container card with a nice frosted glass effect (backdrop-blur)
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      
      {/* Top section: Avatar, Name, Email, and Role Badge */}
      <div className="flex items-center gap-4">
        
        {/* Display the user's profile picture or their initial if no picture exists */}
        <AvatarCircle avatar={profile.avatar} name={profile.fullName} />
        
        <div className="min-w-0">
          {/* User's Full Name (truncated if it's too long) */}
          <p className="truncate text-base font-semibold text-text-dark">
            {profile.fullName}
          </p>
          
          {/* User's Email */}
          <p className="truncate text-xs text-muted">{profile.email}</p>
          
          {/* User's Role Badge (e.g., ADMIN) */}
          <span className="mt-2 inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            {profile.role.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Bottom section: Additional profile details */}
      <div className="mt-5 space-y-3 text-sm">
        
        {/* Show the exact date and time the profile was last updated */}
        <InfoRow
          label="Last updated"
          value={
            profile.updatedAt
              // If there is an update time, format it nicely
              ? new Date(profile.updatedAt).toLocaleString()
              // Otherwise, just show a fallback dash
              : "—"
          }
        />
        
      </div>
    </div>
  );
}
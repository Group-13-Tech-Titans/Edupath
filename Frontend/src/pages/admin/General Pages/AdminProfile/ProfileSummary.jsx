import React from "react";
import { AvatarCircle, InfoRow } from "./ProfileSharedUI";

export default function ProfileSummary({ profile }) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="flex items-center gap-4">
        <AvatarCircle avatar={profile.avatar} name={profile.fullName} />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-text-dark">{profile.fullName}</p>
          <p className="truncate text-xs text-muted">{profile.email}</p>
          <span className="mt-2 inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            {profile.role.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="mt-5 space-y-3 text-sm">
        <InfoRow label="Phone" value={profile.phone || "Not set"} />
        <InfoRow label="Bio" value={profile.bio || "Not set"} multiline />
        <InfoRow label="Last updated" value={profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "—"} />
      </div>
    </div>
  );
}
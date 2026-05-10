import React from "react";

export function getInitials(name = "") {
  if (!name) return "A";
  const parts = name.trim().split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "A";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

export const inputClass = (disabled) =>
  `w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-text-dark placeholder:text-muted/70 shadow-sm outline-none transition
   focus:border-primary/40 focus:ring-2 focus:ring-primary/20
   ${disabled ? "opacity-70" : "hover:bg-white/80"}`;

export const Field = ({ label, children }) => (
  <label className="block">
    <span className="text-xs font-semibold text-text-dark">{label}</span>
    <div className="mt-2">{children}</div>
  </label>
);

export const InfoRow = ({ label, value, multiline }) => (
  <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
    <p className="text-[11px] font-semibold text-muted">{label}</p>
    <p className={`mt-1 text-sm text-text-dark ${multiline ? "leading-relaxed" : ""}`}>
      {value}
    </p>
  </div>
);

export const AvatarCircle = ({ avatar, name }) => (
  <div className="h-16 w-16 overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-sm">
    {avatar ? (
      <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
    ) : (
      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-primary">
        {getInitials(name)}
      </div>
    )}
  </div>
);

export const AvatarMini = ({ avatar, name }) => (
  <div className="h-11 w-11 overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-sm">
    {avatar ? (
      <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
    ) : (
      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
        {getInitials(name)}
      </div>
    )}
  </div>
);
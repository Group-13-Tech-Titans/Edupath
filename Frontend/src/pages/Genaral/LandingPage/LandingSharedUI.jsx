import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// --- Common Animation Variants ---
export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// --- Reusable UI Components ---

// Small tag badge
export function Tag({ children }) {
  return (
    <span className="rounded-full border border-black/5 bg-white px-3 py-1 text-xs font-extrabold text-slate-700">
      {children}
    </span>
  );
}

// Card with an icon and badge linking to another page (Used in Hero section)
export function LinkCard({ to, title, subtitle, badge, icon, bg }) {
  return (
    <Link to={to} className="group">
      <div className={`relative h-full overflow-hidden rounded-[22px] border border-black/5 ${bg} p-4 shadow-sm transition-transform duration-200 group-hover:-translate-y-1`}>
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700">
            {icon}
          </div>
          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-black text-white">
            {badge}
          </span>
        </div>
        <p className="mt-3 text-sm font-extrabold text-slate-900">{title}</p>
        <p className="mt-1 text-xs font-semibold text-slate-600">{subtitle}</p>

        {/* Decorative background blurs */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-yellow-300/30 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl" />
      </div>
    </Link>
  );
}

// Card showing a specific career path with bullet points
export function PathCard({ title, points, accent = "emerald" }) {
  // Color configuration based on the accent prop
  const accentMap = {
    emerald: "from-emerald-50 to-white text-emerald-700 bg-emerald-600/10",
    teal: "from-teal-50 to-white text-teal-700 bg-teal-600/10",
    yellow: "from-yellow-50 to-white text-yellow-700 bg-yellow-400/20",
    slate: "from-slate-50 to-white text-slate-700 bg-slate-600/10",
  };

  const cfg = accentMap[accent] || accentMap.emerald;

  return (
    <div className={`rounded-[26px] border border-black/5 bg-gradient-to-br ${cfg.split(" ")[0]} ${cfg.split(" ")[1]} p-5 shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${cfg.split(" ")[3]}`}>
          🧩
        </div>
        <p className="text-sm font-extrabold">{title}</p>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-sm">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-600" />
            <span className="text-slate-600">{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Card displaying course details

// Simple row with an icon and description
export function MiniRow({ icon, title, text }) {
  return (
    <div className="flex items-start gap-3 rounded-[22px] border border-black/5 bg-white p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700">
        {icon}
      </div>
      <div>
        <p className="text-sm font-extrabold text-slate-900">{title}</p>
        <p className="text-sm font-semibold text-slate-600">{text}</p>
      </div>
    </div>
  );
}

// Display a single statistic
export function Stat({ value, label }) {
  return (
    <div className="rounded-[22px] border border-black/5 bg-gradient-to-b from-white to-emerald-50 p-4">
      <p className="text-xl font-black text-slate-900">{value}</p>
      <p className="text-xs font-bold text-slate-600">{label}</p>
    </div>
  );
}

// Contact information pill (Used in the contact section)
export function ContactPill({ icon, title, text }) {
  return (
    <div className="rounded-[22px] border border-black/5 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700">
          {icon}
        </div>
        <div>
          <p className="text-sm font-extrabold text-slate-900">{title}</p>
          <p className="text-xs font-bold text-slate-600">{text}</p>
        </div>
      </div>
    </div>
  );
}

// Reusable text input field for forms
export function Input({ label, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-extrabold text-slate-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
      />
    </div>
  );
}

// Progress bar component
export function Bar({ label, v }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black text-slate-700">{label}</p>
        <p className="text-[11px] font-black text-slate-500">{Math.round(v * 100)}%</p>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-black/5">
        <div
          className="h-2 rounded-full bg-emerald-600"
          style={{ width: `${Math.max(2, Math.min(100, v * 100))}%` }}
        />
      </div>
    </div>
  );
}

// Small decorative UI piece showing app usage
export function UsecaseMiniArt() {
  return (
    <div className="relative h-[220px] w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(16,185,129,0.18),transparent_55%),radial-gradient(circle_at_80%_25%,rgba(20,184,166,0.16),transparent_55%),radial-gradient(circle_at_55%_80%,rgba(250,204,21,0.18),transparent_60%)]" />
      <div className="absolute inset-0 p-5">
        <div className="grid h-full grid-cols-12 gap-3">
          <div className="col-span-6 rounded-[22px] border border-black/5 bg-white/85 p-4 shadow-sm">
            <p className="text-xs font-black text-slate-800">Reviewer Queue</p>
            <div className="mt-3 space-y-2">
              <ChipRow title="React Basics" status="Pending" />
              <ChipRow title="SQL Joins" status="Approved" good />
              <ChipRow title="UI Kit" status="Pending" />
            </div>
          </div>
          <div className="col-span-6 rounded-[22px] border border-black/5 bg-white/85 p-4 shadow-sm">
            <p className="text-xs font-black text-slate-800">Admin Overview</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <MiniStat v="1,240" l="Active learners" />
              <MiniStat v="86" l="Educators" />
              <MiniStat v="28" l="Reviewers" />
              <MiniStat v="4.8" l="Avg rating" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small chip row used inside UsecaseMiniArt
export function ChipRow({ title, status, good }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white px-3 py-2">
      <p className="text-xs font-black text-slate-800">{title}</p>
      <span
        className={`rounded-full px-3 py-1 text-[11px] font-black ${
          good ? "bg-emerald-600/10 text-emerald-700" : "bg-yellow-300/60 text-slate-900"
        }`}
      >
        {status}
      </span>
    </div>
  );
}

// Small stat block used inside UsecaseMiniArt
export function MiniStat({ v, l }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-gradient-to-b from-white to-emerald-50 px-3 py-2">
      <p className="text-sm font-black text-slate-900">{v}</p>
      <p className="text-[11px] font-bold text-slate-600">{l}</p>
    </div>
  );
}
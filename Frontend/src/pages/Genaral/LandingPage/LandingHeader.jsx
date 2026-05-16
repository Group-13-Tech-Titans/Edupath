import React from "react";
import { Link } from "react-router-dom";

// Header Component with navigation links and login/signup buttons
export default function LandingHeader({ nav, scrollToId }) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        
        {/* Logo and Brand Name */}
        <button
          onClick={() => scrollToId("home")}
          className="flex items-center gap-2 rounded-2xl px-2 py-1 hover:bg-black/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 shadow-sm">
            🎓
          </div>
          <div className="leading-tight text-left">
            <p className="text-sm font-extrabold">EduPath</p>
            <p className="-mt-0.5 text-[11px] text-slate-500">
              AI Paths • Verified Learning • Career Growth
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToId(item.id)}
              className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-black/5 hover:text-slate-900"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-black/5"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-95"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
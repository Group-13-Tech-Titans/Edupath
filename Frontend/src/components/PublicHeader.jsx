import React from "react";
import { Link } from "react-router-dom";

export default function PublicHeader() {
  return (
    <header className="w-full border-b border-black/5 bg-white/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-lg">
            🎓
          </div>
          <span className="text-lg font-semibold text-text-dark">
            EduPath
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-3 text-sm">
          <Link
            to="/courses"
            className="text-muted hover:text-text-dark transition"
          >
            Explore Courses
          </Link>

          <Link
            to="/login"
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-text-dark shadow-sm hover:bg-white/70 sm:text-sm"
          >
            Log in
          </Link>

          <Link
            to="/signup"
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow hover:brightness-95 sm:text-sm"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}

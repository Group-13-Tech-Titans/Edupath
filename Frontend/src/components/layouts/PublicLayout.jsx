import React from "react";
import { Link, Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-200 via-teal-200 to-cyan-200">
      {/* <header className="w-full">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-lg">
              🎓
            </div>
            <span className="text-lg font-semibold text-text-dark">EduPath</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/courses" className="text-muted hover:text-text-dark">
              Explore Courses
            </Link>
            <Link to="/login" className="btn-outline text-xs sm:text-sm">
              Log in
            </Link>
            <Link to="/signup" className="btn-primary text-xs sm:text-sm">
              Get started
            </Link>
          </nav>
        </div>
      </header> */}

      <main className="flex-1">
        <Outlet />
      </main>

      {/* <footer className="mt-10 border-t border-black/5 bg-white/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-muted sm:flex-row">
          <p>© 2026 EduPath. All rights reserved.</p>
          <div className="flex gap-4">
            <button className="hover:text-text-dark">Support</button>
            <button className="hover:text-text-dark">Terms</button>
            <button className="hover:text-text-dark">Privacy</button>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default PublicLayout;


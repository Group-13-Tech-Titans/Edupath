import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useApp } from "../../context/AppProvider.jsx";

const AdminLayout = () => {
  const { currentUser, logout } = useApp();

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1 rounded-full text-sm ${
      isActive ? "bg-primary text-white" : "text-muted hover:bg-white/60"
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Updated header to match PublicHeader styles */}
      <header className="border-b border-black/5 bg-white/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow">
              🛠
            </div>
            <span className="text-base font-semibold text-text-dark">
              EduPath Admin
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink to="/admin" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/reviewers" className={navLinkClass}>
              Reviewers
            </NavLink>
            <NavLink to="/admin/verify-educators" className={navLinkClass}>
              Verify Educators
            </NavLink>
            <NavLink to="/admin/review-dashboard" className={navLinkClass}>
              Review Activity
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:inline">
              {currentUser?.email}
            </span>
            <button
              onClick={logout}
              className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* Footer imported from PublicFooter with unified styles */}
      <footer className="mt-10 border-t border-black/5 bg-white/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-muted sm:flex-row">
          <p>© 2026 EduPath. All rights reserved.</p>
          <div className="flex gap-4">
            <button className="hover:text-text-dark transition">Support</button>
            <button className="hover:text-text-dark transition">Terms</button>
            <button className="hover:text-text-dark transition">Privacy</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;


import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useApp } from "../../context/AppProvider.jsx";

const EducatorLayout = () => {
  const { currentUser, logout } = useApp();

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1 rounded-full text-sm ${
      isActive ? "bg-primary text-white" : "text-muted hover:bg-white/60"
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-black/5 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/educator" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow">
              📚
            </div>
            <span className="text-base font-semibold text-text-dark">
              EduPath Educator
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink to="/educator" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/educator/courses" className={navLinkClass}>
              My Courses
            </NavLink>
            <NavLink to="/educator/publish" className={navLinkClass}>
              Publish
            </NavLink>
            <NavLink to="/educator/payouts" className={navLinkClass}>
              Payouts
            </NavLink>
            <NavLink to="/educator/profile" className={navLinkClass}>
              Profile
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            {currentUser?.status === "PENDING_VERIFICATION" && (
              <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs text-yellow-700 border border-yellow-200">
                Verification pending
              </span>
            )}
            {currentUser?.status === "VERIFIED" && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 border border-emerald-200">
                Verified Educator
              </span>
            )}
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
    </div>
  );
};

export default EducatorLayout;


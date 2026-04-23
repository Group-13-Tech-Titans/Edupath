import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useApp } from "../../context/AppProvider.jsx";

const ReviewerLayout = () => {
  const { currentUser, logout } = useApp();

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1 rounded-full text-sm ${
      isActive ? "bg-primary text-white" : "text-muted hover:bg-white/60"
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-black/5 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/reviewer" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow">
              ✅
            </div>
            <span className="text-base font-semibold text-text-dark">
              EduPath Review
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink to="/reviewer" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/reviewer/queue" className={navLinkClass}>
              Queue
            </NavLink>
            <NavLink to="/reviewer/history" className={navLinkClass}>
              History
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
    </div>
  );
};

export default ReviewerLayout;


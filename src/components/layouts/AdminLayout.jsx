import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useApp } from "../../context/AppProvider.jsx";

const AdminLayout = () => {
  const { currentUser, logout } = useApp();

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-full text-sm font-medium transition ${
      isActive
        ? "bg-primary text-white shadow"
        : "text-text-dark/70 hover:bg-black/5"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-teal-100 to-emerald-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm">
              🎓
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-text-dark">EduPath</p>
              <p className="text-[11px] text-muted -mt-0.5">Admin</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:inline">
              {currentUser?.email}
            </span>
            
          </div>
        </div>
      </header>

      {/* Admin sub nav card like screenshot */}
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm">
                🎓
              </div>
              <div>
                <p className="text-base font-semibold text-text-dark">
                  EduPath Admin
                </p>
                <p className="text-xs text-muted">
                  Manage users, payments, and approvals
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2">
              <NavLink to="/admin" end className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/admin/users" className={navLinkClass}>
                Users
              </NavLink>
              <NavLink to="/admin/payments" className={navLinkClass}>
                Payments
              </NavLink>
              <NavLink to="/admin/approvals" className={navLinkClass}>
                Approvals
              </NavLink>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                to="/admin/reviewers"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-95"
              >
                Create Admin
              </Link>
            
            
              <button
              onClick={logout}
              className="rounded-full border border-red-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
            >
              Log out
            </button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

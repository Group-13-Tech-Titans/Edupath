import React, { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppProvider.jsx";

const AdminLayout = () => {
  const { currentUser, logout } = useApp();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // close mobile menu when route changes
  useMemo(() => {
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
      isActive
        ? "bg-primary/60 text-white shadow"
        : "text-text-dark/70 hover:bg-black/5"
    }`;

  const navItems = [
    { to: "/admin", label: "Home", end: true },
    { to: "/admin/verify-educators", label: "Verify Educators" },
    { to: "/admin/queue", label: "Reviews Course" },
    { to: "/admin/reviewers", label: "Create Reviewer" },
    
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-teal-100 to-emerald-50">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/60 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Brand */}
            <Link to="/admin" className="flex items-center gap-2 shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm">
                🎓
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-text-dark">EduPath</p>
                <p className="text-[11px] text-muted -mt-0.5">Admin</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={navLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              

              {/* Profile icon */}
              <button
                onClick={() => window.location.href = "/admin/profile"}
                className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold shadow-sm"
                title="Go to profile"
              >
                {currentUser?.email?.charAt(0).toUpperCase()}
              </button>
              
              <button
                onClick={logout}
                className="hidden sm:inline-flex rounded-full border border-red-200 bg-white/70 px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50"
              >
                Log out
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setOpen((v) => !v)}
                className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 hover:bg-black/10"
                aria-label="Toggle menu"
                aria-expanded={open}
              >
                {open ? (
                  <span className="text-xl leading-none">✕</span>
                ) : (
                  <span className="text-xl leading-none">☰</span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu panel */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ${
              open ? "max-h-96 mt-3" : "max-h-0"
            }`}
          >
            <div className="rounded-2xl border border-black/5 bg-white/70 p-3 backdrop-blur">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-xl text-sm font-medium transition ${
                        isActive
                          ? "bg-primary/60 text-white shadow"
                          : "text-text-dark/80 hover:bg-black/5"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                {/* Mobile email + logout */}
                <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-white/70 px-4 py-3">
                  <span className="text-xs text-muted truncate">
                    {currentUser?.email}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold">
                      {currentUser?.email?.charAt(0).toUpperCase()}
                    </div>
                    <button
                      onClick={logout}
                      className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

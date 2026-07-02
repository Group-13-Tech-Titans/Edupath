import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppProvider.jsx";
import DashboardFooter from "./DashboardFooter.jsx";

const navItems = [
  { to: "/educator", label: "Home", end: true },
  { to: "/educator/courses", label: "My Courses" },
  { to: "/educator/payouts", label: "Payouts" },
];

const EducatorLayout = () => {
  const { currentUser, logout } = useApp();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileImage = currentUser?.profile?.profileImage || currentUser?.avatar;
  const userInitial = currentUser?.email?.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
      isActive
        ? "bg-primary/60 text-white shadow"
        : "text-text-dark/70 hover:bg-black/5"
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/60 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link to="/educator" className="flex shrink-0 items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm">
                🎓
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-text-dark">EduPath</p>
                <p className="text-[11px] text-muted -mt-0.5">Educator</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 lg:flex">
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

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/educator/profile")}
                className="hidden h-10 w-10 overflow-hidden rounded-full bg-primary/15 font-semibold text-primary shadow-sm ring-1 ring-primary/20 sm:inline-flex"
                title="Go to profile"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    {userInitial}
                  </span>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="hidden rounded-full border border-red-200 bg-white/70 px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 sm:inline-flex"
              >
                Log out
              </button>

              <button
                onClick={() => setOpen((value) => !value)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 hover:bg-black/10 lg:hidden"
                aria-label="Toggle menu"
                aria-expanded={open}
              >
                <span className="relative h-4 w-4">
                  <span
                    className={`absolute left-0 h-0.5 w-4 rounded bg-text-dark transition ${
                      open ? "top-2 rotate-45" : "top-0"
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-2 h-0.5 w-4 rounded bg-text-dark transition ${
                      open ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <span
                    className={`absolute left-0 h-0.5 w-4 rounded bg-text-dark transition ${
                      open ? "top-2 -rotate-45" : "top-4"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 lg:hidden ${
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
                      `rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-primary/60 text-white shadow"
                          : "text-text-dark/80 hover:bg-black/5"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-white/70 px-4 py-3">
                  <span className="truncate text-xs text-muted">
                    {currentUser?.email}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate("/educator/profile")}
                      className="flex h-8 w-8 overflow-hidden rounded-full bg-primary/15 text-xs font-semibold text-primary ring-1 ring-primary/20"
                      title="Go to profile"
                    >
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center">
                          {userInitial}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={handleLogout}
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

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>

      <footer className="mx-auto mt-10 w-full max-w-6xl px-4 pb-6">
        <DashboardFooter
          panelLabel="Educator Panel"
          description="Create courses, manage learning content, track approvals, and keep your educator profile up to date."
          sections={[
            {
              title: "Educator",
              items: [
                { label: "Dashboard", to: "/educator" },
                { label: "My Courses", to: "/educator/courses" },
                { label: "Publish Course", to: "/educator/publish" },
                { label: "Payouts", to: "/educator/payouts" },
              ],
            },
            {
              title: "Help & Policy",
              items: [
                { label: "Educator Help Center", to: "/educator/help" },
                { label: "Contact Support", to: "/educator/contact" },
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms & Conditions", to: "/terms" },
              ],
            },
          ]}
        />
      </footer>
    </div>
  );
};

export default EducatorLayout;

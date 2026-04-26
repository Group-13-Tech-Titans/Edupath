import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppProvider.jsx";

const ReviewerLayout = () => {
  const { logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLink = ({ isActive }) =>
    `px-2 py-1 text-sm font-medium ${
      isActive
        ? "text-text-dark border-b-2 border-text-dark"
        : "text-muted hover:text-text-dark"
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-black/5 bg-white/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow">
              🎓
            </div>
            <span className="text-lg font-semibold text-text-dark">EduPath</span>
          </Link>

          <nav className="flex items-center gap-6">
            <NavLink to="/reviewer" end className={navLink}>
              Reviewer Home
            </NavLink>

            <NavLink to="/reviewer/queue" className={navLink}>
              Review Queue
            </NavLink>

            <NavLink to="/reviewer/history" className={navLink}>
              History
            </NavLink>

            <NavLink to="/reviewer/pathways" className={navLink}>
              Pathways
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/reviewer?profile=1" className="btn-primary px-5 py-2 text-sm">
              View Profile
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full bg-red-500 px-5 py-2 text-sm font-medium text-white hover:bg-red-600 transition"
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

export default ReviewerLayout;

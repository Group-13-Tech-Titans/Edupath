import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppProvider.jsx";

const MentorNavbar = () => {
  const { logout, unreadMessagesCount } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `font-medium transition-colors ${
      isActive ? "text-teal-500" : "text-slate-800 hover:text-teal-500"
    }`;

  return (
    <header className="mb-5 flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <Link to="/mentor" className="flex items-center gap-2 text-xl font-bold text-slate-800">
        <EduPathLogo />
        <span>EduPath</span>
      </Link>

      <nav className="relative z-50 hidden flex-1 items-center justify-center gap-8 md:flex">
        <NavLink to="/mentor" end className={navLinkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/mentor/students" className={navLinkClass}>
          My Students
        </NavLink>
        <NavLink to="/mentor/sessions" className={navLinkClass}>
          Sessions
        </NavLink>
        <NavLink to="/mentor/resources" className={navLinkClass}>
          Resources
        </NavLink>
        <NavLink to="/mentor/messages" className={navLinkClass}>
          <span className="relative inline-flex items-center">
            Messages
            {unreadMessagesCount > 0 && (
              <span className="absolute -right-5 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
              </span>
            )}
          </span>
        </NavLink>
        <NavLink to="/mentor/profile" className={navLinkClass}>
          Profile
        </NavLink>
      </nav>

      <div className="w-[150px] flex justify-end">
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
        >
          <LogoutIcon /> Logout
        </button>
      </div>
    </header>
  );
};

/* ── Icons ────────────────────────────────────────────────────── */
function EduPathLogo() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none">
      <circle cx="20" cy="20" r="18" fill="#5DD9C1" opacity="0.2" />
      <path d="M20 8L12 12L20 16L28 12L20 8Z" fill="#5DD9C1" />
      <path d="M12 20L20 24L28 20" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 26L20 30L28 26" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2" fill="#5DD9C1" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export default MentorNavbar;

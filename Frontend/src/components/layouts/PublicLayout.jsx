import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppProvider.jsx";

const PublicLayout = () => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (!currentUser) return null;
    const paths = {
      student: "/student",
      educator: "/educator",
      admin: "/admin",
      reviewer: "/reviewer",
      mentor: "/mentor",
    };
    return paths[currentUser.role] || "/";
  };

  const dashboardPath = getDashboardPath();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full border-b border-black/5 bg-white/60 backdrop-blur-md sticky top-0 z-[1000]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500 shadow-sm transition group-hover:bg-teal-500 group-hover:text-white">
              🎓
            </div>
            <span className="text-xl font-bold text-slate-800">EduPath</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-semibold">
            <Link to="/courses" className="text-slate-600 hover:text-teal-500 transition">
              Explore Courses
            </Link>
            
            {currentUser ? (
              <>
                <Link to={dashboardPath} className="rounded-full bg-teal-500 px-5 py-2 text-white shadow-sm hover:bg-teal-600 transition">
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-red-500 transition px-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-teal-500 transition">
                  Log in
                </Link>
                <Link to="/signup" className="rounded-full bg-slate-800 px-5 py-2 text-white shadow-sm hover:bg-slate-900 transition">
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-10 border-t border-black/5 bg-white/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-muted sm:flex-row">
          <p>© 2026 EduPath. All rights reserved.</p>
          <div className="flex gap-4">
            <button className="hover:text-text-dark">Support</button>
            <button className="hover:text-text-dark">Terms</button>
            <button className="hover:text-text-dark">Privacy</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;


import React, { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useApp } from "../../context/AppProvider.jsx";
import StudentFooter from "../../pages/student/StudentFooter.jsx";

const StudentLayout = () => {
  const { currentUser, logout } = useApp();
  
  // State to track if the mobile menu is open
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 sm:px-3 sm:py-1 rounded-full text-sm font-medium transition-colors ${
      isActive ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          
          {/* LOGO */}
          <Link to="/student" onClick={closeMenu} className="flex items-center gap-2 z-50">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
              🎓
            </div>
            <span className="text-base font-bold text-slate-800">EduPath Student</span>
          </Link>

          {/* DESKTOP NAVIGATION (Hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <NavLink to="/student" end className={navLinkClass}>Dashboard</NavLink>
            <NavLink to="/student/courses" className={navLinkClass}>My Courses</NavLink>
            <NavLink to="/student/mentor" className={navLinkClass}>Mentorship</NavLink>
            <NavLink to="/student/profile" className={navLinkClass}>Profile</NavLink>
          </nav>

          {/* DESKTOP ACTIONS (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-xs font-bold text-slate-500 truncate max-w-[150px]">
              {currentUser?.name || currentUser?.email || "Student"}
            </span>
            <button
              onClick={logout}
              className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              Log out
            </button>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button 
            className="md:hidden flex flex-col items-center justify-center h-8 w-8 space-y-1.5 z-50 cursor-pointer"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            <span className={`block w-6 h-0.5 bg-slate-700 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-slate-700 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-slate-700 transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>

        </div>

        {/* MOBILE NAVIGATION DROPDOWN */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl py-4 px-4 flex flex-col gap-2 animate-in slide-in-from-top-2">
            <NavLink to="/student" end className={navLinkClass} onClick={closeMenu}>Dashboard</NavLink>
            <NavLink to="/student/courses" className={navLinkClass} onClick={closeMenu}>My Courses</NavLink>
            <NavLink to="/student/mentor" className={navLinkClass} onClick={closeMenu}>Mentorship</NavLink>
            <NavLink to="/student/profile" className={navLinkClass} onClick={closeMenu}>Profile</NavLink>
            
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500 truncate mr-4">
                {currentUser?.name || currentUser?.email || "Student"}
              </span>
              <button
                onClick={() => { logout(); closeMenu(); }}
                className="rounded-full bg-red-50 px-5 py-2 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>

      <StudentFooter />
    </div>
  );
};

export default StudentLayout;
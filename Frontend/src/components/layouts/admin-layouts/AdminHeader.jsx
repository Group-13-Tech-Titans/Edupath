import React, { useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppProvider.jsx";
// Import necessary icons from lucide-react
import { MessageCircle, Menu, X, LogOut, GraduationCap } from "lucide-react";

export default function AdminHeader({ setIsChatOpen }) {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State to control the mobile hamburger menu
  const [open, setOpen] = useState(false);

  // Close the mobile menu automatically when the route (URL) changes
  useMemo(() => {
    setOpen(false);
  }, [location.pathname]);

  // Function to style navigation links based on their active status
  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
      isActive
        ? "bg-primary/60 text-white shadow"
        : "text-text-dark/70 hover:bg-black/5"
    }`;

    //nav bar
  const navItems = [
    { to: "/admin", label: "Home", end: true },
    { to: "/admin/verify-educators", label: "Verify Educators" },
    { to: "/admin/approvals", label: "Reviews Course" },
    { to: "/admin/specializations", label: "Specializations" },
    { to: "/admin/reviewers", label: "Create Reviewer" },
    { to: "/admin/pathway-builder", label: "Pathways" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/60 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* Logo and Branding */}
          <Link to="/admin" className="flex items-center gap-2 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm">

              <GraduationCap className="w-6 h-6" />  {/* graduation Icon */}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-text-dark">EduPath</p>
              <p className="text-[11px] text-muted -mt-0.5">Admin</p>
            </div>
          </Link>

          {/* Desktop Navigation Menu (Hidden on mobile) */}
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

          {/* Right Side Actions (Chat, Profile, Logout, Mobile Menu Toggle) */}
          <div className="flex items-center gap-3">
            
            {/* Live Chat Toggle Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition shadow-sm"
              title="Open Live Chat"
            >
              <MessageCircle className="w-5 h-5" />
                
            </button>

            {/* Profile Avatar Button (Hidden on very small screens) */}
            <button
              onClick={() => navigate("/admin/profile")}
              className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold shadow-sm"
              title="Go to profile"
            >
              {currentUser?.email?.charAt(0).toUpperCase()}
            </button>
            
            {/* Logout Button (Hidden on very small screens) */}
            <button
              onClick={logout}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white/70 px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log out
            </button>

            {/* Mobile Hamburger Menu Button (Hidden on large screens) */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 hover:bg-black/10 transition"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel (Slides down when 'open' is true) */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            open ? "max-h-96 mt-3" : "max-h-0"
          }`}
        >
          <div className="rounded-2xl border border-black/5 bg-white/70 p-3 backdrop-blur">
            <div className="flex flex-col gap-2">
              
              {/* Mobile Navigation Links */}
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

              {/* Mobile Profile & Logout Section */}
              <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-white/70 px-4 py-3">
                <span className="text-xs text-muted truncate">
                  {currentUser?.email}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate("/admin/profile")} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold">
                    {currentUser?.email?.charAt(0).toUpperCase()}
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log out
                  </button>
                </div>
              </div>
              
            </div>
          </div>
        </div>
        
      </div>
    </header>
  );
}
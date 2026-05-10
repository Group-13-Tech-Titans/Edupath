import React, { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../../../context/AppProvider.jsx";

// 1. Import the ChatSidebar component (Make sure the path is correct based on your folder structure)
import ChatSidebar from "../../../components/slideChatBar/ChatSidebar.jsx"; 

const AdminLayout = () => {
  const { currentUser, logout } = useApp();
  const [open, setOpen] = useState(false);
  
  // 2. State to handle whether the chat sidebar is open or closed
  const [isChatOpen, setIsChatOpen] = useState(false); 
  
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
    { to: "/admin/approvals", label: "Reviews Course" },
    { to: "/admin/specializations", label: "specializations" },
    { to: "/admin/pathways", label: "Pathway Management" },
    { to: "/admin/reviewers", label: "Create Reviewer" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-teal-100 to-emerald-50">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/60 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
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
              
              {/* 3. NEW: Chat Toggle Button (Visible on both Mobile and Desktop) */}
              <button
                onClick={() => setIsChatOpen(true)}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition shadow-sm"
                title="Open Live Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
                {/* Red notification dot to make it look alive */}
                <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
              </button>

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

              {/* Mobile view hamburger menu */}
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

                <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-white/70 px-4 py-3">
                  <span className="text-xs text-muted truncate">
                    {currentUser?.email}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => window.location.href = "/admin/profile"} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold">
                      {currentUser?.email?.charAt(0).toUpperCase()}
                    </button>
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

      {/* 4. NEW: Render the ChatSidebar Component */}
      {/* We pass the isChatOpen state, the function to close it, and the logged-in user data */}
      <ChatSidebar 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        currentUser={currentUser}
      />
    </div>
  );
};

export default AdminLayout;
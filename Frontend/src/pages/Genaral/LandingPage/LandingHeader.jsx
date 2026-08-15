import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Header Component with navigation links and login/signup buttons
export default function LandingHeader({ nav, scrollToId }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (id) => {
    setIsOpen(false);
    scrollToId(id);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        
        {/* Logo and Brand Name */}
        <button
          onClick={() => handleNavClick("home")}
          className="flex items-center gap-2 rounded-2xl px-2 py-1 hover:bg-black/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 shadow-sm">
            🎓
          </div>
          <div className="leading-tight text-left">
            <p className="text-sm font-extrabold">EduPath</p>
            <p className="-mt-0.5 text-[11px] text-slate-500 hidden sm:block">
              AI Paths • Verified Learning • Career Growth
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-black/5 hover:text-slate-900"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/login"
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-black/5 transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-95 transition-all"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center rounded-lg p-2 hover:bg-black/5 md:hidden text-slate-700"
        >
          {isOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute left-0 top-full w-full overflow-hidden border-b border-black/5 bg-white shadow-xl md:hidden"
          >
            <div className="flex flex-col p-4">
              {nav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-black/5"
                >
                  {item.label}
                </button>
              ))}
              
              <div className="mt-4 flex flex-col gap-3 border-t border-black/5 pt-4">
                <Link
                  to="/login"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 hover:bg-black/5"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow hover:brightness-95"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
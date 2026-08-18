import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppProvider.jsx";
import { getSubscriptionStatus } from "../../api/subscriptionApi.js";
import { isPremiumUser } from "../../utils/subscriptionUtils.js";
import PremiumReminderBanner from "../student/PremiumReminderBanner.jsx";
import {
  Sparkles,
  LayoutDashboard,
  Compass,
  GraduationCap,
  Users,
  CreditCard,
  User,
  LogOut,
  ChevronDown,
  Route,
  ShieldCheck,
  Zap
} from "lucide-react";

const StudentLayout = () => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const dropdownRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSubscription = () => {
    getSubscriptionStatus()
      .then((data) => setSubscription(data))
      .catch((err) => console.error("Failed to load subscription in layout:", err));
  };

  useEffect(() => {
    fetchSubscription();
    window.addEventListener("edupath_subscription_updated", fetchSubscription);
    return () => window.removeEventListener("edupath_subscription_updated", fetchSubscription);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isPremium = isPremiumUser(subscription, currentUser);

  const userInitial =
    currentUser?.name?.charAt(0).toUpperCase() ||
    currentUser?.email?.charAt(0).toUpperCase() ||
    "S";

  const displayName = currentUser?.name || currentUser?.email?.split("@")[0] || "Student";

  // Creative capsule navigation link styling
  const navLinkClass = ({ isActive }) =>
    `relative px-4 py-2 rounded-full text-xs lg:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
      isActive
        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      
      {/* ============================================================ */}
      {/* 🌟 CREATIVE MODERN NAVBAR */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl shadow-xs transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-2.5">
          
          {/* 1. LEFT: LOGO & ROLE IDENTITY */}
          <Link
            to="/student"
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 text-lg group-hover:scale-105 transition-transform">
              🎓
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-800">
                  EduPath
                </span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase px-2 py-0.2 rounded-md">
                  Student
                </span>
              </div>
            </div>
          </Link>

          {/* 2. CENTER: CREATIVE CAPSULE NAVIGATION (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60 shadow-inner">
            <NavLink to="/student" end className={navLinkClass}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/student/explore" className={navLinkClass}>
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Courses</span>
            </NavLink>
            <NavLink to="/student/courses" className={navLinkClass}>
              <GraduationCap className="w-3.5 h-3.5" />
              <span>My Courses</span>
            </NavLink>
            <NavLink to="/student/mentor" className={navLinkClass}>
              <Users className="w-3.5 h-3.5" />
              <span>Mentorship</span>
            </NavLink>
          </nav>

          {/* 3. RIGHT: CREATIVE UPGRADE CTA & USER PROFILE MENU */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* ⚡ CREATIVE STANDALONE UPGRADE BUTTON / PLAN BADGE */}
            {!isPremium ? (
              <Link
                to="/student/plans"
                className="group relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/35 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Sparkles className="w-3.5 h-3.5 fill-white animate-pulse" />
                <span>Upgrade Pro</span>
                <span className="ml-0.5 text-[9px] bg-white/25 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                  $49/mo
                </span>
              </Link>
            ) : (
              <Link
                to="/student/plans"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200/80 shadow-xs hover:bg-emerald-100 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
                <span>Premium Member</span>
              </Link>
            )}

            {/* 👤 USER PROFILE DROPDOWN CAPSULE */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white hover:bg-slate-100 border border-slate-200/80 shadow-xs transition-all cursor-pointer group"
                aria-label="User menu"
              >
                {/* Avatar Initial */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-800 to-slate-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {userInitial}
                </div>
                <span className="text-xs font-bold text-slate-700 max-w-[110px] truncate">
                  {displayName}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                    isProfileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* FLOATING GLASS DROPDOWN MENU */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* User info banner */}
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 mb-1.5">
                    <p className="text-xs font-black text-slate-800 truncate">
                      {currentUser?.name || "Student Member"}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 truncate">
                      {currentUser?.email}
                    </p>
                    
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-semibold">Plan:</span>
                      <span className={`font-black uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-md ${
                        isPremium ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                      }`}>
                        {isPremium ? "⚡ Premium" : "Free Plan"}
                      </span>
                    </div>
                  </div>

                  {/* Navigation Links inside User Menu */}
                  <div className="space-y-0.5 text-xs font-semibold text-slate-600">
                    <Link
                      to="/student/profile"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/student/plans"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span>Plans & Billing</span>
                    </Link>

                    <Link
                      to="/student/journey"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <Route className="w-4 h-4 text-slate-400" />
                      <span>Learning Journey</span>
                    </Link>
                  </div>

                  <div className="my-1.5 border-t border-slate-100" />

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* 4. MOBILE MENU BUTTON */}
          <div className="flex md:hidden items-center gap-2">
            {!isPremium && (
              <Link
                to="/student/plans"
                className="px-3 py-1.5 rounded-full text-[11px] font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xs flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Upgrade</span>
              </Link>
            )}

            <button
              className="flex flex-col items-center justify-center h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle Menu"
            >
              <span className={`block w-5 h-0.5 bg-slate-700 transition-transform duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`block w-5 h-0.5 bg-slate-700 my-1 transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-slate-700 transition-transform duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </button>
          </div>

        </div>

        {/* ============================================================ */}
        {/* 📱 MOBILE NAVIGATION DROPDOWN */}
        {/* ============================================================ */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-slate-200 shadow-2xl py-4 px-4 flex flex-col gap-2 animate-in slide-in-from-top-2">
            
            {/* Mobile User Card */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold text-sm flex items-center justify-center">
                  {userInitial}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">{displayName}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isPremium ? "text-emerald-600" : "text-slate-400"}`}>
                    {isPremium ? "✨ Premium Member" : "Free Plan"}
                  </span>
                </div>
              </div>

              {!isPremium && (
                <Link
                  to="/student/plans"
                  onClick={closeMobileMenu}
                  className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-sm"
                >
                  Upgrade
                </Link>
              )}
            </div>

            {/* Mobile Nav Links */}
            <NavLink to="/student" end className={navLinkClass} onClick={closeMobileMenu}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/student/explore" className={navLinkClass} onClick={closeMobileMenu}>
              <Compass className="w-4 h-4" />
              <span>Explore Courses</span>
            </NavLink>
            <NavLink to="/student/courses" className={navLinkClass} onClick={closeMobileMenu}>
              <GraduationCap className="w-4 h-4" />
              <span>My Courses</span>
            </NavLink>
            <NavLink to="/student/mentor" className={navLinkClass} onClick={closeMobileMenu}>
              <Users className="w-4 h-4" />
              <span>Mentorship</span>
            </NavLink>

            <div className="my-2 border-t border-slate-100" />

            <NavLink to="/student/plans" className={navLinkClass} onClick={closeMobileMenu}>
              <CreditCard className="w-4 h-4" />
              <span>Plans & Billing</span>
            </NavLink>
            <NavLink to="/student/profile" className={navLinkClass} onClick={closeMobileMenu}>
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </NavLink>

            <div className="mt-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => { handleLogout(); closeMobileMenu(); }}
                className="w-full rounded-2xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================================ */}
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <Outlet />
        </div>
      </main>

      {/* NON-INTRUSIVE PREMIUM REMINDER FOR FREE USERS */}
      <PremiumReminderBanner subscription={subscription} />
    </div>
  );
};

export default StudentLayout;
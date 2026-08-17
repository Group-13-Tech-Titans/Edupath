import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, X, ArrowRight, ShieldCheck } from "lucide-react";

const STORAGE_KEY = "edupath_premium_reminder_dismissed_until";
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours default cooldown

export default function PremiumReminderBanner({ subscription, onUpgradeClick }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show for Free plan users
    if (!subscription || subscription.isPremium || subscription.plan === "premium") {
      setIsVisible(false);
      return;
    }

    try {
      const dismissedUntil = localStorage.getItem(STORAGE_KEY);
      if (dismissedUntil && Date.now() < Number.parseInt(dismissedUntil, 10)) {
        setIsVisible(false);
        return;
      }
    } catch {
      // ignore storage error
    }

    // Delay appearing slightly after page load so it feels organic
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [subscription]);

  const handleDismiss = (days = 1) => {
    setIsVisible(false);
    try {
      const expiry = Date.now() + days * COOLDOWN_MS;
      localStorage.setItem(STORAGE_KEY, expiry.toString());
    } catch {
      // ignore storage error
    }
  };

  const handleUpgrade = () => {
    setIsVisible(false);
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      navigate("/student/plans");
    }
  };

  if (!isVisible) return null;

  const coursesWatched = subscription?.coursesWatchedCount || 0;
  const coursesLimit = subscription?.coursesWatchedLimit && subscription.coursesWatchedLimit > 0 ? subscription.coursesWatchedLimit : 10;
  const pathwaysCreated = subscription?.lifetimePathwaysCreatedCount || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-6 right-6 z-40 max-w-sm sm:max-w-md w-full p-1"
      >
        <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-5 text-white shadow-2xl border border-emerald-500/20 backdrop-blur-md">
          {/* Subtle Ambient glow */}
          <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />

          {/* Dismiss button */}
          <button
            onClick={() => handleDismiss(1)}
            className="absolute top-4 right-4 h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Remind me later"
            aria-label="Dismiss reminder"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Header Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>EduPath Premium</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              From $49/month
            </span>
          </div>

          {/* Title & Body */}
          <h4 className="text-base font-bold text-white mb-1.5 leading-snug">
            {coursesWatched >= 10 
              ? `You've used ${coursesWatched}/${coursesLimit} course watches this month!` 
              : "Unlock Unlimited Courses & 20 Pathways"}
          </h4>

          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Upgrade your plan to stream unlimited courses with no monthly caps, build up to 20 pathways, and earn verified certificates.
          </p>

          {/* Mini Usage Pill (if active) */}
          <div className="mb-4 flex items-center justify-between gap-2 bg-black/30 rounded-xl px-3 py-2 text-[11px] border border-white/5">
            <span className="text-slate-400">Current Free Plan:</span>
            <span className="font-semibold text-emerald-300">
              {coursesWatched}/{coursesLimit} courses • {pathwaysCreated}/3 pathways
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleUpgrade}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-2.5 px-4 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <span>Upgrade to Premium</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleDismiss(3)}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2 transition-colors font-medium"
            >
              Later
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

PremiumReminderBanner.propTypes = {
  subscription: PropTypes.object,
  onUpgradeClick: PropTypes.func
};

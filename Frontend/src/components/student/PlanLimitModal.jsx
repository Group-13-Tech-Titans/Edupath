import React from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, AlertTriangle, ArrowRight, X, BookOpen, Route, CheckCircle2 } from "lucide-react";

export default function PlanLimitModal({ isOpen, onClose, limitType, onUpgradeClick, resetDate }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isCourseLimit = limitType === "course_monthly";
  const isPathwayLifetimeLimit = limitType === "pathway_lifetime";
  const isPathwayActiveLimit = limitType === "pathway_active";

  const handleViewPlans = () => {
    onClose();
    navigate("/student/plans");
  };

  const handleDirectUpgrade = () => {
    onClose();
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      navigate("/student/plans");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 z-10"
        >
          {/* Header glow */}
          <div className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none ${
            isPathwayActiveLimit ? "bg-amber-400/20" : "bg-emerald-400/25"
          }`} />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Badge */}
          <div className="flex items-center gap-3 mb-5">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-md ${
              isPathwayActiveLimit 
                ? "bg-amber-100 text-amber-600" 
                : "bg-emerald-100 text-emerald-600"
            }`}>
              {isCourseLimit && <BookOpen className="w-7 h-7" />}
              {isPathwayLifetimeLimit && <Route className="w-7 h-7" />}
              {isPathwayActiveLimit && <AlertTriangle className="w-7 h-7" />}
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                {isPathwayActiveLimit ? "Limit Warning" : "Free Plan Limit Reached"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {isCourseLimit && "Monthly Course Limit Reached"}
                {isPathwayLifetimeLimit && "Lifetime Pathway Limit Reached"}
                {isPathwayActiveLimit && "Active Pathway Capacity Reached"}
              </h3>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 text-slate-600 text-sm leading-relaxed mb-6">
            {isCourseLimit && (
              <>
                <p>
                  You have enrolled in your quota of <strong className="text-slate-900 font-bold">10 courses</strong> for this month on the Free Plan.
                </p>
                {resetDate && (
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">🗓️ Reset Date:</span>
                    <span>Your 10-course quota will reset on <strong>{new Date(resetDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</strong>.</span>
                  </div>
                )}
              </>
            )}

            {isPathwayLifetimeLimit && (
              <>
                <p>
                  Free plan students can create up to <strong className="text-slate-900 font-bold">3 learning pathways lifetime</strong>. Deleting a pathway does not create a new slot on the Free plan.
                </p>
                <div className="bg-amber-50/70 rounded-2xl p-3.5 border border-amber-200/60 text-xs text-amber-800">
                  ⚡ Upgrade to <strong>EduPath Premium</strong> to unlock up to <strong>20 active pathways</strong> with freedom to replace anytime!
                </div>
              </>
            )}

            {isPathwayActiveLimit && (
              <p>
                You have reached your maximum capacity of <strong className="text-slate-900 font-bold">20 active pathways</strong> on your Premium plan. Please delete an existing pathway to start a new journey.
              </p>
            )}
          </div>

          {/* Value Props for Upgrade (if not active limit) */}
          {!isPathwayActiveLimit && (
            <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 rounded-2xl p-4 border border-emerald-200/60 mb-6">
              <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-500" />
                <span>EduPath Premium Plan ($49/mo or $499/yr)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Unlimited course streaming & access</strong> every month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Up to 20 active pathways</strong> (delete & replace freely)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Verified course certificates & priority support</span>
                </li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {!isPathwayActiveLimit ? (
              <>
                <button
                  type="button"
                  onClick={handleDirectUpgrade}
                  className="w-full sm:flex-1 bg-emerald-500 text-white hover:bg-emerald-600 py-3.5 px-5 rounded-full font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Upgrade to Premium</span>
                </button>
                <button
                  type="button"
                  onClick={handleViewPlans}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 px-5 rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Compare Plans</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { onClose(); navigate("/student"); }}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3.5 px-6 rounded-full font-bold text-sm shadow-md transition-all"
                >
                  Manage My Pathways
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 px-5 rounded-full font-semibold text-sm transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

PlanLimitModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  limitType: PropTypes.oneOf(["course_monthly", "pathway_lifetime", "pathway_active"]),
  onUpgradeClick: PropTypes.func,
  resetDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
};

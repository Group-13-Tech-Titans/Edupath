import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import { getSubscriptionStatus, cancelSubscription } from "../../api/subscriptionApi.js";
import { isPremiumUser } from "../../utils/subscriptionUtils.js";
import UpgradeModal from "../../components/student/UpgradeModal.jsx";
import {
  Sparkles,
  Check,
  X,
  BookOpen,
  Route,
  Calendar,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Zap,
  Award,
  HelpCircle,
  Clock,
  CheckCircle2,
  Compass,
  PlayCircle,
  GraduationCap,
  ChevronRight,
  Star
} from "lucide-react";
import toast from "react-hot-toast";

export default function StudentPlans() {
  const navigate = useNavigate();
  const { currentUser, setSession, refreshCurrentUser } = useApp();

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptionStatus();
      setSubscription(data);
      if (data.billingCycle) {
        setBillingCycle(data.billingCycle);
      }
    } catch (err) {
      console.error("Failed to load subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    window.addEventListener("edupath_subscription_updated", fetchStatus);
    return () => window.removeEventListener("edupath_subscription_updated", fetchStatus);
  }, []);

  const handleUpgradeSuccess = (updatedSub, updatedUser) => {
    setSubscription(updatedSub);
    if (updatedUser) {
      const token = localStorage.getItem("edupath_token");
      setSession(token, updatedUser);
    }
    fetchStatus();
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your Premium subscription? You will be reverted to the Free plan.")) {
      return;
    }

    try {
      setIsCancelling(true);
      const res = await cancelSubscription();
      toast.success("Your subscription has been cancelled and reverted to the Free plan.");
      setSubscription(res.subscription);
      if (res.user) {
        const token = localStorage.getItem("edupath_token");
        setSession(token, res.user);
      }
      // Force-refresh currentUser from DB so profile shows updated plan
      if (refreshCurrentUser) {
        await refreshCurrentUser();
      }
      window.dispatchEvent(new Event("edupath_subscription_updated"));
    } catch (err) {
      console.error("Cancellation error:", err);
      toast.error(err.response?.data?.message || "Failed to cancel subscription.");
    } finally {
      setIsCancelling(false);
    }
  };

  const isPremium = isPremiumUser(subscription, currentUser);
  const isYearly = billingCycle === "yearly";

  const coursesWatched = subscription?.coursesWatchedCount || 0;
  const coursesLimit = subscription?.coursesWatchedLimit && subscription.coursesWatchedLimit > 0 ? subscription.coursesWatchedLimit : (isPremium ? -1 : 10);
  const courseProgressPct = isPremium ? 100 : Math.min(100, Math.round((coursesWatched / (coursesLimit || 10)) * 100));

  const createdPathwaysList = subscription?.createdPathways || [];
  const pathwaysCreated = subscription?.lifetimePathwaysCreatedCount !== undefined
    ? Math.max(subscription.lifetimePathwaysCreatedCount, createdPathwaysList.length)
    : createdPathwaysList.length;
  const pathwaysLimit = subscription?.pathwaysLimit || (isPremium ? 20 : 3);
  const pathwayProgressPct = Math.min(100, Math.round((pathwaysCreated / pathwaysLimit) * 100));

  const monthlyCoursesList = subscription?.monthlyCourses || [];

  const faqs = [
    {
      q: "How does the monthly course enrollment limit reset on the Free plan?",
      a: "On the Free plan, students can enroll in up to 10 courses per month. The 30-day monthly cycle begins on your account start date (or payment date) and automatically refreshes every month."
    },
    {
      q: "Can I delete a pathway on the Free plan to create a new one?",
      a: "No. The Free plan has a lifetime creation limit of 3 pathways. Deleting an existing pathway does not restore a slot. To create more pathways and freely replace them, you can upgrade to Premium (which allows up to 20 active pathways)."
    },
    {
      q: "How do pathway limits work on the Premium plan?",
      a: "Premium members can maintain up to 20 active pathways simultaneously. If you hit 20 active pathways and want a new topic, you can simply delete an existing pathway and create a new one freely."
    },
    {
      q: "What happens if my Premium subscription expires or is cancelled?",
      a: "Your account will automatically and safely revert to the Free Plan. All your past progress, milestones, and completed courses remain saved in your account."
    },
    {
      q: "Can I switch between monthly and annual billing?",
      a: "Yes! You can switch your billing frequency anytime. Annual billing gives you an immediate 15% discount ($499/year instead of $588/year, saving you $89)."
    }
  ];

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-2">
        {/* Upgrade Checkout Modal */}
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          onSuccess={handleUpgradeSuccess}
          initialCycle={billingCycle}
        />

        {/* HERO BANNER */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>EduPath Student Membership</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Simple, Transparent Plans for Every Learner
          </h1>
          <p className="text-base sm:text-lg text-slate-500 font-medium">
            Start with our generous Free plan, or upgrade to Premium for unlimited course access and up to 20 active pathways.
          </p>
        </div>

        {/* CURRENT PLAN & LIVE USAGE METERS */}
        <div className="mb-12 bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${isPremium ? "bg-gradient-to-tr from-amber-400 to-emerald-400 text-white" : "bg-emerald-100 text-emerald-700"
                }`}>
                {isPremium ? "⭐" : "🎓"}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-black text-slate-900">
                    {isPremium ? "EduPath Premium Plan" : "EduPath Free Plan"}
                  </h2>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${isPremium ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-700"
                    }`}>
                    {isPremium ? "Active Premium" : "Active Free"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  {isPremium ? (
                    <span>
                      Billed {subscription?.billingCycle === "yearly" ? "Annually ($499/yr)" : "Monthly ($49/mo)"} • Next renewal on{" "}
                      <strong>
                        {subscription?.currentPeriodEnd
                          ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                          : "Active"}
                      </strong>
                    </span>
                  ) : (
                    <span>Free Forever • Up to 10 courses/mo & 3 lifetime pathways</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isPremium ? (
                <button
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Upgrade to Premium ($49/mo)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-2.5 rounded-full font-bold text-xs transition-colors cursor-pointer"
                >
                  {isCancelling ? "Processing..." : "Downgrade / Cancel"}
                </button>
              )}
            </div>
          </div>

          {/* METERS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* Meter 1: Course Watches */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Monthly Course Quota (10 Limit)
                  </span>
                </div>
                <span className="text-xs font-black text-slate-900">
                  {isPremium ? "Unlimited ⚡" : `${coursesWatched} / ${coursesLimit} Used`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isPremium ? "bg-emerald-500 w-full" : courseProgressPct >= 90 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  style={{ width: `${isPremium ? 100 : courseProgressPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>
                  {isPremium ? "No monthly course streaming limits" : `${Math.max(0, coursesLimit - coursesWatched)} course slots remaining`}
                </span>
                {subscription?.monthlyResetDate && (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <Clock className="w-3 h-3" />
                    <span>Resets {new Date(subscription.monthlyResetDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Meter 2: Pathway Creation */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {isPremium ? "Active Pathway Slots" : "Pathways Used (3 Limit)"}
                  </span>
                </div>
                <span className="text-xs font-black text-slate-900">
                  {isPremium ? `${subscription?.activePathwaysCount || createdPathwaysList.length} / 20 Active` : `${pathwaysCreated} / 3 Lifetime`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${pathwayProgressPct >= 90 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  style={{ width: `${pathwayProgressPct}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                {isPremium ? (
                  <span>Up to 20 active pathways (delete and replace freely anytime)</span>
                ) : (
                  <span className="text-slate-600">
                    Lifetime limit of 3 (deleting a pathway does not grant a new slot)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 📚 ENROLLED COURSES IN THIS MONTHLY BILLING CYCLE */}
        {/* ============================================================ */}
        <div className="mb-12 bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xl font-black text-slate-900">
                  Enrolled Courses This Month ({monthlyCoursesList.length} / {isPremium ? "∞" : coursesLimit})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Courses accessed during your current 30-day billing cycle. Resets on{" "}
                <strong>
                  {subscription?.monthlyResetDate
                    ? new Date(subscription.monthlyResetDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                    : "next billing cycle"}
                </strong>.
              </p>
            </div>

            <Link
              to="/student/explore"
              className="px-4 py-2 rounded-full bg-slate-800 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore More Courses</span>
            </Link>
          </div>

          {monthlyCoursesList.length === 0 ? (
            <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl mx-auto mb-2 shadow-2xs">
                📖
              </div>
              <p className="text-sm font-bold text-slate-700">No courses enrolled in this billing cycle yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                You have {isPremium ? "unlimited" : `${Math.max(0, coursesLimit - coursesWatched)}`} slots available to enroll in published courses this month!
              </p>
              <Link
                to="/student/explore"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
              >
                <span>Browse Course Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monthlyCoursesList.map((course) => (
                <div
                  key={course.courseId}
                  className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        {course.category || "General"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {course.level || "All Levels"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {course.description || "Interactive course with lessons & quizzes."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400">
                      By <strong className="text-slate-700">{course.educatorName}</strong>
                    </div>

                    <Link
                      to={`/student/courses/${course.courseId}`}
                      className="px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                    >
                      <span>Resume</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 🚀 CREATED LEARNING PATHWAYS */}
        {/* ============================================================ */}
        <div className="mb-12 bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Route className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xl font-black text-slate-900">
                  Created Learning Pathways ({createdPathwaysList.length} / {isPremium ? "20 Active" : "3 Lifetime"})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Personalized AI & curriculum journeys generated for your account.
              </p>
            </div>

            <Link
              to="/student/path-finder"
              className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate New Pathway</span>
            </Link>
          </div>

          {createdPathwaysList.length === 0 ? (
            <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl mx-auto mb-2 shadow-2xs">
                🧭
              </div>
              <p className="text-sm font-bold text-slate-700">No pathways created yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                Take our quick assessment to generate your personalized step-by-step career pathway!
              </p>
              <Link
                to="/student/path-finder"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-slate-800 text-white font-bold text-xs shadow-md hover:bg-emerald-600 transition-all"
              >
                <span>Launch Path Finder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {createdPathwaysList.map((pathway) => (
                <div
                  key={pathway._id}
                  className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        {pathway.level || "Beginner"} Level
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {pathway.progressPct || 0}% Done
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-800 line-clamp-1 mb-1">
                      {pathway.pathName || "Learning Journey"}
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">
                      {pathway.completedSteps || 0} of {pathway.totalSteps || 0} milestones completed
                    </p>

                    {/* Pathway mini progress bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pathway.progressPct || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Created {new Date(pathway.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>

                    <Link
                      to={`/student/journey?pathwayId=${pathway._id}`}
                      className="px-3 py-1 rounded-full bg-slate-800 hover:bg-emerald-600 text-white text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                    >
                      <span>Resume</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BILLING FREQUENCY TOGGLE */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="inline-flex items-center bg-slate-100 p-1.5 rounded-full border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`py-2 px-6 rounded-full text-xs font-black transition-all cursor-pointer ${billingCycle === "monthly"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-500 hover:text-slate-900"
                }`}
            >
              Monthly Billing ($49/mo)
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`relative py-2 px-6 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${billingCycle === "yearly"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-500 hover:text-slate-900"
                }`}
            >
              <span>Annual Billing ($499/yr)</span>
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                SAVE 15%
              </span>
            </button>
          </div>
          <span className="text-xs text-slate-400 font-semibold mt-2">
            Annual plan saves you $89 USD per year
          </span>
        </div>

        {/* PRICING CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 items-stretch">

          {/* FREE PLAN CARD */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-slate-100 text-slate-700 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  Free Plan
                </span>
                {!isPremium && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Current Plan
                  </span>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900">$0</span>
                  <span className="text-slate-400 font-semibold text-sm">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Free forever for all registered students.</p>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 font-medium pt-4 border-t border-slate-100 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Enroll in up to 10 courses per month</strong> (resets monthly from start date)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Create up to 3 pathways lifetime</strong> (hard limit of 3 created)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Access all standard reading materials, code snippets & quizzes</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Priority 1-on-1 mentor booking requests</span>
                </div>
                <div className="flex items-start gap-3 text-slate-400">
                  <X className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                  <span>No unlimited course streaming</span>
                </div>
                <div className="flex items-start gap-3 text-slate-400">
                  <X className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                  <span>Cannot replace pathways after creating 3</span>
                </div>
              </div>
            </div>

            <div>
              {!isPremium ? (
                <button
                  type="button"
                  disabled
                  className="w-full bg-slate-100 text-slate-400 font-bold py-3.5 rounded-full text-xs sm:text-sm cursor-not-allowed"
                >
                  Current Active Plan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                  className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-full text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Downgrade to Free
                </button>
              )}
            </div>
          </div>

          {/* PREMIUM PLAN CARD */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-[32px] p-8 text-white shadow-2xl border-2 border-emerald-500 relative flex flex-col justify-between">
            {/* Top recommendation pill */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
              ⚡ MOST POPULAR & POWERFUL
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-2">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>EduPath Premium</span>
                </span>
                {isPremium && (
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-500/40">
                    Your Current Plan
                  </span>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-white">
                    ${isYearly ? "499" : "49"}
                  </span>
                  <span className="text-slate-400 font-semibold text-sm">
                    {isYearly ? "/ year" : "/ month"}
                  </span>
                </div>
                <p className="text-xs text-emerald-400 mt-1 font-medium">
                  {isYearly ? "Billed annually • Save $89 USD per year (~$41.58/mo)" : "Billed monthly • Cancel anytime"}
                </p>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-200 font-medium pt-4 border-t border-slate-800 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white font-black">Unlimited course access</strong> with zero monthly caps</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white font-black">Up to 20 active pathways</strong> simultaneously</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white font-black">Flexible pathway replacement</strong> (delete & swap anytime)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Access all standard reading materials, code snippets & quizzes</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Priority 1-on-1 mentor booking requests</span>
                </div>

              </div>
            </div>

            <div>
              {isPremium ? (
                <div className="text-center py-3 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs sm:text-sm border border-emerald-500/30">
                  ✨ Active Premium Membership
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-full text-xs sm:text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Upgrade to Premium (${isYearly ? "499/yr" : "49/mo"})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FAQ ACCORDION SECTION */}
        <div className="max-w-3xl mx-auto bg-white rounded-[32px] p-6 sm:p-10 border border-slate-100 shadow-sm">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-slate-900">Frequently Asked Questions</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Everything you need to know about our plans, quotas, and billing.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-100 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-800 text-xs sm:text-sm hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-400 text-lg leading-none">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </PageShell>
  );
}
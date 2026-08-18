/**
 * STUDENT DASHBOARD COMPONENT
 * Primary landing hub for students to track pathways, course limits, and learning statistics.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import { getSubscriptionStatus } from "../../api/subscriptionApi.js";
import { isPremiumUser } from "../../utils/subscriptionUtils.js";
import PlanLimitModal from "../../components/student/PlanLimitModal.jsx";
import UpgradeModal from "../../components/student/UpgradeModal.jsx";
import { Sparkles, ArrowRight, BookOpen, Route, Clock, ShieldCheck } from "lucide-react";

// --- CONFIGURATION CONSTANTS ---
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const GRADIENTS = [
  "from-emerald-500 to-teal-400",
  "from-blue-500 to-cyan-400",
  "from-indigo-500 to-blue-400"
];

const getPathwayIcon = (index) => {
  if (index === 0) return "🚀";
  if (index === 1) return "💡";
  return "⭐";
};

const StatCard = ({ icon, title, value, themeClass }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${themeClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

StatCard.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  themeClass: PropTypes.string.isRequired,
};

const PathwayCard = ({ pathway, index, pathwayName, onResume, onDelete }) => {
  const totalSteps = pathway.totalSteps !== undefined ? pathway.totalSteps : (pathway.steps?.length || 0);
  const completedSteps = pathway.completedSteps !== undefined ? pathway.completedSteps : (pathway.steps?.filter((s) => s.isCompleted).length || 0);
  const pathwayProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const bgGradient = GRADIENTS[index % GRADIENTS.length];
  const icon = getPathwayIcon(index);

  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-[32px] p-8 sm:p-10 text-white shadow-xl relative overflow-hidden`}>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="w-full md:w-2/3">
          <span className="inline-block bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-4 shadow-sm">
            {pathway.level} Level
          </span>
          <h2 className="text-3xl sm:text-4xl font-black mb-2 leading-tight">
            {pathwayName}
          </h2>
          <p className="text-white/90 text-sm sm:text-base max-w-md">
            You've completed {completedSteps} out of {totalSteps} milestones. Keep up the great momentum!
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 max-w-sm bg-black/15 rounded-full h-3 shadow-inner overflow-hidden">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${pathwayProgress}%` }}
              ></div>
            </div>
            <span className="font-bold text-sm tracking-wider">{pathwayProgress}%</span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button 
              onClick={() => onResume(pathway._id)} 
              className="bg-white text-slate-800 px-8 py-3.5 rounded-full font-black shadow-xl hover:scale-105 transition-transform active:scale-95 cursor-pointer"
            >
              RESUME JOURNEY →
            </button>
            
            <button 
              onClick={() => onDelete(pathway._id)}
              className="text-white/80 hover:text-white text-sm font-semibold underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all cursor-pointer"
            >
              Delete Journey
            </button>
          </div>
        </div>
        
        <div className="hidden md:flex w-1/3 justify-end pr-8">
          <span className="text-[100px] drop-shadow-2xl hover:scale-110 transition-transform duration-500 cursor-default">
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
};

PathwayCard.propTypes = {
  pathway: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  pathwayName: PropTypes.string.isRequired,
  onResume: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, courses = [], lessonProgress = {}, setSession } = useApp();

  const email = currentUser?.email;
  const progress = lessonProgress[email] || {};
  const approvedCourses = courses.filter((c) => c.status === "approved");

  const completedCount = Object.values(progress).reduce(
    (acc, lessons) => acc + (lessons ? lessons.length : 0),
    0
  );
  
  const [activePathways, setActivePathways] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loadingPathway, setLoadingPathway] = useState(true);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pathwayToDelete, setPathwayToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modals for subscription limits
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitType, setLimitType] = useState("pathway_lifetime");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("edupath_token");
      if (!token) {
        setLoadingPathway(false);
        return;
      }
      
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [subData, specRes, pathwayRes] = await Promise.all([
        getSubscriptionStatus().catch((e) => {
          console.error("Failed to load subscription status:", e);
          return null;
        }),
        axios.get(`${API_BASE_URL}/specializations`, config).catch((e) => {
          console.error("Failed to load specializations:", e);
          return { data: { specializations: [] } };
        }),
        axios.get(`${API_BASE_URL}/pathway/my?summary=true`, config).catch((e) => {
          console.error("Failed to load user pathways:", e);
          return { data: { hasPathway: false } };
        })
      ]);

      setSubscription(subData);
      setSpecializations(specRes.data.specializations || []);
      const data = pathwayRes.data;
      
      setActivePathways((data.hasPathway && data.pathways) ? data.pathways : []);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoadingPathway(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getPathwayName = (val) => {
    if (!val) return "";
    const found = specializations.find((s) => s.slug === val || s.name === val);
    if (found) return found.name;
    
    if (val.includes(" ")) return val;
    return val.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const initiateDelete = (id) => {
    setPathwayToDelete(id);
    setShowDeleteModal(true);
  };

  const resumePathway = (id) => {
    navigate("/student/journey", { state: { pathwayId: id } });
  };

  const handleDeleteJourney = async () => {
    if (!pathwayToDelete) return;
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("edupath_token");
      
      await axios.delete(`${API_BASE_URL}/pathway/my/${pathwayToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setActivePathways((prev) => prev.filter((p) => p._id !== pathwayToDelete));
      setShowDeleteModal(false);
      setPathwayToDelete(null);
      fetchDashboardData();
    } catch (err) {
      console.error("Error deleting pathway:", err); 
      alert("Failed to delete pathway. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isPremium = isPremiumUser(subscription, currentUser);
  const lifetimePathways = subscription?.lifetimePathwaysCreatedCount || 0;
  const maxAllowedPathways = isPremium ? 20 : 3;
  const canCreateMore = isPremium ? activePathways.length < 20 : lifetimePathways < 3;
  const remainingSlots = isPremium ? Math.max(0, 20 - activePathways.length) : Math.max(0, 3 - lifetimePathways);

  const handleNewPathwayClick = () => {
    if (!canCreateMore) {
      setLimitType(isPremium ? "pathway_active" : "pathway_lifetime");
      setLimitModalOpen(true);
      return;
    }
    navigate("/student/path-finder");
  };

  const handleUpgradeSuccess = (updatedSub, updatedUser) => {
    setSubscription(updatedSub);
    if (updatedUser) {
      const token = localStorage.getItem("edupath_token");
      setSession(token, updatedUser);
    }
    fetchDashboardData();
  };

  const renderPathwayContent = () => {
    if (loadingPathway) {
      return <div className="w-full h-56 bg-slate-200 animate-pulse rounded-[32px]"></div>;
    }

    if (activePathways.length > 0) {
      return (
        <div className="space-y-6">
          {activePathways.map((pathway, index) => (
            <PathwayCard 
              key={pathway._id}
              pathway={pathway}
              index={index}
              pathwayName={getPathwayName(pathway.pathName)}
              onResume={resumePathway}
              onDelete={initiateDelete}
            />
          ))}

          {activePathways.length < maxAllowedPathways && (
            <div className="bg-slate-800 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-700">
              <div>
                <h3 className="text-2xl font-black mb-2">Want to learn something else?</h3>
                <p className="text-slate-400 text-sm">
                  {isPremium ? (
                    <span>You have {remainingSlots} active journey slot(s) remaining on your Premium plan!</span>
                  ) : (
                    <span>You have {remainingSlots} lifetime journey slot(s) remaining on your Free plan.</span>
                  )}
                </p>
              </div>
              <button 
                onClick={handleNewPathwayClick} 
                className="bg-primary text-white px-8 py-3.5 rounded-full font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                FIND A NEW PATHWAY ✨
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-slate-800 rounded-[32px] p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-slate-700 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="w-full md:w-2/3">
            <span className="inline-block bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
              No Active Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">
              Find Your Perfect Path
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-md">
              Take our quick interactive questionnaire to discover a curated, step-by-step curriculum built specifically for your goals.
            </p>

            <button 
              onClick={handleNewPathwayClick} 
              className="mt-8 bg-primary text-white px-8 py-3.5 rounded-full font-black shadow-xl shadow-primary/20 hover:scale-105 hover:brightness-110 transition-all active:scale-95 cursor-pointer"
            >
              FIND YOUR PATHWAY ✨
            </button>
          </div>
          
          <div className="hidden md:flex w-1/3 justify-end pr-8">
            <span className="text-[100px] drop-shadow-2xl hover:rotate-12 transition-transform duration-500 cursor-default">
              🧭
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Upgrade & Limit Modals */}
        <PlanLimitModal
          isOpen={limitModalOpen}
          onClose={() => setLimitModalOpen(false)}
          limitType={limitType}
          onUpgradeClick={() => {
            setLimitModalOpen(false);
            setUpgradeModalOpen(true);
          }}
          resetDate={subscription?.monthlyResetDate}
        />

        <UpgradeModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          onSuccess={handleUpgradeSuccess}
        />

        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800">
              Welcome back, {currentUser?.name || "Student"} 👋
            </h1>
            <p className="text-slate-500 mt-1 text-base sm:text-lg">
              Ready to continue your learning journey?
            </p>
          </div>

          <Link
            to="/student/plans"
            className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all ${
              isPremium
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-md shadow-emerald-500/20"
                : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isPremium ? "Premium Member" : "Free Plan • Upgrade"}</span>
          </Link>
        </div>

        {/* SUBSCRIPTION USAGE WIDGET */}
        {subscription && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shadow-inner">
                {isPremium ? "⚡" : "📊"}
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  {isPremium ? "Active Premium Plan" : "Active Free Plan"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                  <span>
                    {isPremium
                      ? "Unlimited Course Access"
                      : `${subscription.coursesWatchedCount} / ${subscription.coursesWatchedLimit} Courses Watched This Month`}
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
              {!isPremium && subscription.monthlyResetDate && (
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Resets {new Date(subscription.monthlyResetDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                </div>
              )}

              <Link
                to="/student/plans"
                className="text-slate-800 hover:text-emerald-600 font-bold flex items-center gap-1 underline underline-offset-4 decoration-slate-200 hover:decoration-emerald-500 transition-colors"
              >
                <span>View Plans & Limits</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* PATHWAY CONTENT SECTION */}
        {renderPathwayContent()}

        {/* GENERAL STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <Link
            to="/student/explore"
            className="group block"
          >
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between gap-5">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-blue-50 text-blue-500">
                  📚
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Available Courses</p>
                  <p className="text-3xl font-black text-slate-800">{approvedCourses.length}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <StatCard
            icon="✅"
            title="Lessons Completed"
            value={completedCount}
            themeClass="bg-emerald-50 text-emerald-500"
          />
          <StatCard
            icon="🔥"
            title="Study Streak"
            value="7 Days"
            themeClass="bg-orange-50 text-orange-500"
          />
        </div>

        {/* DELETE MODAL */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                ⚠️
              </div>
              <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Delete Learning Journey?</h3>
              <p className="text-slate-500 text-sm text-center mb-6 leading-relaxed">
                {!isPremium ? (
                  <span>
                    <strong>Notice for Free Plan:</strong> You have a lifetime limit of 3 created pathways. Deleting this pathway will <strong>not</strong> grant a new pathway slot.
                  </span>
                ) : (
                  <span>
                    Are you sure you want to delete this pathway? You can replace it with any other pathway up to your 20-pathway limit.
                  </span>
                )}
              </p>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-full text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteJourney}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-full text-sm shadow-lg shadow-red-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageShell>
  );
};

export default StudentDashboard;
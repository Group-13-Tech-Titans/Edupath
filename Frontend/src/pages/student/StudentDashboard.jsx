/**
 * STUDENT DASHBOARD COMPONENT
 * Primary landing hub for students to track pathways and learning statistics.
 * Design Patterns: Container/Presentational, Concurrent Fetching, Optimistic UI.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

// --- CONFIGURATION CONSTANTS ---
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
const MAX_ACTIVE_PATHWAYS = 3;

const GRADIENTS = [
  "from-emerald-500 to-teal-400",
  "from-blue-500 to-cyan-400",
  "from-indigo-500 to-blue-400"
];

// ==========================================
// HELPERS & EXTRACTED COMPONENTS
// ==========================================

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
  const totalSteps = pathway.steps?.length || 0;
  const completedSteps = pathway.steps?.filter((s) => s.isCompleted).length || 0;
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
              className="bg-white text-slate-800 px-8 py-3.5 rounded-full font-black shadow-xl hover:scale-105 transition-transform active:scale-95"
            >
              RESUME JOURNEY →
            </button>
            
            <button 
              onClick={() => onDelete(pathway._id)}
              className="text-white/80 hover:text-white text-sm font-semibold underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all"
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

// ==========================================
// MAIN CONTAINER COMPONENT
// ==========================================
const StudentDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, courses, lessonProgress } = useApp();
  
  const email = currentUser?.email;
  const progress = lessonProgress[email] || {};
  const approvedCourses = courses.filter((c) => c.status === "approved");

  const completedCount = Object.values(progress).reduce(
    (acc, lessons) => acc + (lessons ? lessons.length : 0),
    0
  );
  
  const streakDays = currentUser?.streakDays || 7; 

  const [activePathways, setActivePathways] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loadingPathway, setLoadingPathway] = useState(true);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pathwayToDelete, setPathwayToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        if (!token) {
          setLoadingPathway(false);
          return;
        }
        
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [specRes, pathwayRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/specializations`, config).catch((e) => {
            console.error("Failed to load specializations:", e);
            return { data: { specializations: [] } };
          }),
          axios.get(`${API_BASE_URL}/pathway/my`, config).catch((e) => {
            console.error("Failed to load user pathways:", e);
            return { data: { hasPathway: false } };
          })
        ]);

        setSpecializations(specRes.data.specializations || []);
        const data = pathwayRes.data;
        
        setActivePathways((data.hasPathway && data.pathways) ? data.pathways : []);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoadingPathway(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const getPathwayName = (val) => {
    if (!val) return "";
    const found = specializations.find((s) => s.slug === val || s.name === val);
    if (found) return found.name;
    
    if (val.includes(" ")) return val;
    if (val.toLowerCase() === "ui-ux") return "UI/UX Design";
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
    } catch (err) {
      // 🟢 FIXED S2486: Now we actually USE the 'err' object by logging it
      console.error("Error deleting pathway:", err); 
      alert("Failed to delete pathway. Please try again.");
    } finally {
      setIsDeleting(false);
    }
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

          {activePathways.length < MAX_ACTIVE_PATHWAYS && (
            <div className="bg-slate-800 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-700">
              <div>
                <h3 className="text-2xl font-black mb-2">Want to learn something else?</h3>
                <p className="text-slate-400 text-sm">
                  You can study multiple topics at once. You have {MAX_ACTIVE_PATHWAYS - activePathways.length} active journey slot(s) remaining!
                </p>
              </div>
              <button 
                onClick={() => navigate("/student/path-finder")} 
                className="bg-primary text-white px-8 py-3.5 rounded-full font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95 whitespace-nowrap"
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
              onClick={() => navigate("/student/path-finder")} 
              className="mt-8 bg-primary text-white px-8 py-3.5 rounded-full font-black shadow-xl shadow-primary/20 hover:scale-105 hover:brightness-110 transition-all active:scale-95"
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
        
        <div className="pt-4">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800">
            Welcome back, {currentUser?.name || "Student"} 👋
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Ready to continue your learning journey?</p>
        </div>

        {renderPathwayContent()}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <StatCard icon="📚" title="Active Courses" value={approvedCourses.length} themeClass="bg-blue-50 text-blue-500" />
          <StatCard icon="✅" title="Lessons Done" value={completedCount} themeClass="bg-emerald-50 text-emerald-500" />
          <StatCard icon="🔥" title="Study Streak" value={`${streakDays} Days`} themeClass="bg-orange-50 text-orange-500" />
        </div>

      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto">
              ⚠️
            </div>
            <h2 className="text-2xl font-black text-center text-slate-800 mb-2">Abandon Journey?</h2>
            <p className="text-center text-slate-500 mb-8">
              Are you sure you want to delete this learning pathway? You will lose all your progress and milestones for this specific journey.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDeleteJourney}
                disabled={isDeleting}
                className="w-full bg-red-500 text-white font-bold py-3.5 rounded-full shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Journey"}
              </button>
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setPathwayToDelete(null);
                }}
                disabled={isDeleting}
                className="w-full bg-slate-100 text-slate-700 font-bold py-3.5 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default StudentDashboard;
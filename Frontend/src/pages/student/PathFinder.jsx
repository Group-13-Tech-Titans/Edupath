/**
 * PATH FINDER COMPONENT (STUDENT ONBOARDING)
 * Interactive questionnaire that recommends a curriculum based on user selections.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import { getSubscriptionStatus } from "../../api/subscriptionApi.js";
import { isPremiumUser } from "../../utils/subscriptionUtils.js";
import PlanLimitModal from "../../components/student/PlanLimitModal.jsx";
import UpgradeModal from "../../components/student/UpgradeModal.jsx";
import { Sparkles, ArrowRight, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

// --- CONFIGURATION CONSTANTS ---
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const LEVEL_UI_CONFIG = {
  "Beginner": {
    title: "Absolute Beginner",
    desc: "I have never done this before and need to start from scratch.",
    icon: "🌱"
  },
  "Intermediate": {
    title: "Some Experience",
    desc: "I know the basics and want to learn intermediate skills.",
    icon: "🛠️"
  },
  "Advanced": {
    title: "Highly Experienced",
    desc: "I am ready for advanced concepts, architecture, and complex projects.",
    icon: "⚡"
  }
};

const PathFinder = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  
  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [limitType, setLimitType] = useState("pathway_lifetime");
  
  // Modals
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  // Data State
  const [allTemplates, setAllTemplates] = useState([]); 
  const [availablePaths, setAvailablePaths] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [recommendedTemplate, setRecommendedTemplate] = useState(null);
  const [subscription, setSubscription] = useState(null);

  // Form State
  const [answers, setAnswers] = useState({
    pathName: "",
    level: "",
  });

  useEffect(() => {
    const initializePathFinder = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Resolves Network Waterfall by fetching data concurrently
        const [subData, specRes, myDataRes, publishedRes] = await Promise.all([
          getSubscriptionStatus().catch(() => null),
          axios.get(`${API_BASE_URL}/specializations`, config).catch(() => ({ data: { specializations: [] } })),
          axios.get(`${API_BASE_URL}/pathway/my?summary=true`, config).catch(() => ({ data: { hasPathway: false, pathways: [] } })),
          axios.get(`${API_BASE_URL}/pathway/published?summary=true`, config).catch(() => ({ data: { templates: [] } }))
        ]);

        setSubscription(subData);

        // Map Specializations
        setSpecializations(specRes.data.specializations || []);

        const isPremium = isPremiumUser(subData, currentUser);
        const lifetimeCreated = subData?.lifetimePathwaysCreatedCount || 0;
        const activeCount = myDataRes.data.pathways?.length || 0;

        // Enforce Business Logic Limits
        if (!isPremium && lifetimeCreated >= 3) {
          setLimitReached(true);
          setLimitType("pathway_lifetime");
          setIsLoading(false);
          return;
        }

        if (isPremium && activeCount >= 20) {
          setLimitReached(true);
          setLimitType("pathway_active");
          setIsLoading(false);
          return;
        }

        // Populate Available Published Paths
        const templates = publishedRes.data.templates || [];
        setAllTemplates(templates); 
        
        // Extract unique path names dynamically - combine published templates, specializations, and standard curriculum tracks
        const specNames = (specRes.data.specializations || []).map((s) => s.name || s.slug).filter(Boolean);
        const defaultTracks = [
          "Web Development",
          "Data Science",
          "Artificial Intelligence",
          "Mobile App Development",
          "Cybersecurity",
          "UI/UX Design"
        ];
        const templatePaths = templates.map((t) => t.pathName).filter(Boolean);
        
        const combinedPaths = [...new Set([...templatePaths, ...specNames, ...defaultTracks])];
        setAvailablePaths(combinedPaths);
        
        setIsLoading(false);
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to load available pathways. Please try again.");
        setIsLoading(false);
      }
    };
    
    initializePathFinder();
  }, []);

  // --- HELPERS ---
  
  const getPathwayName = (val) => {
    if (!val) return "";
    const found = specializations.find(s => s.slug === val || s.name === val);
    if (found) return found.name;
    if (val.includes(" ")) return val;
    return val.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const handleSelect = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    
    setTimeout(() => {
      if (currentStep === 1) setCurrentStep(2);
      if (currentStep === 2) handleSubmitQuiz({ ...answers, [field]: value });
    }, 400);
  };

  const handleSubmitQuiz = async (finalAnswers) => {
    try {
      setIsLoading(true);
      setCurrentStep(3); 
      const token = localStorage.getItem("edupath_token");
      
      const payload = {
        pathName: finalAnswers.pathName || answers.pathName || "Web Development",
        level: finalAnswers.level || answers.level || "Beginner"
      };

      const { data } = await axios.post(
        `${API_BASE_URL}/pathway/recommend`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRecommendedTemplate(data.template);
      setIsLoading(false);
    } catch (err) {
      console.error("Recommendation error:", err);
      setError("Something went wrong while analyzing your profile. Please try again.");
      setIsLoading(false);
    }
  };

  const handleEnrollAndStart = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("edupath_token");
      const templateId = recommendedTemplate?._id || "auto";
      
      const { data } = await axios.post(
        `${API_BASE_URL}/pathway/enroll/${templateId}`,
        {
          pathName: answers.pathName || recommendedTemplate?.pathName || "Web Development",
          level: answers.level || recommendedTemplate?.level || "Beginner"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.pathway?._id) {
        toast.success(data.message || "Enrolled successfully!");
        navigate("/student/journey", { replace: true, state: { pathwayId: data.pathway._id } });
      } else {
        navigate("/student/journey", { replace: true });
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      if (err?.response?.data?.limitReached) {
        setLimitType(err.response.data.limitType || "pathway_lifetime");
        setLimitModalOpen(true);
      } else {
        const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Failed to enroll in the pathway.";
        toast.error(errorMsg);
      }
      setIsLoading(false);
    }
  };

  // Derive available levels dynamically based on what the user picked in Step 1 (always ensuring options exist)
  const dynamicLevels = answers.pathName 
    ? [...new Set(allTemplates.filter(t => t.pathName === answers.pathName).map(t => t.level).filter(Boolean))]
    : [];
  const availableLevelsForSelectedPath = dynamicLevels.length > 0 ? dynamicLevels : ["Beginner", "Intermediate", "Advanced"];

  const isPremium = isPremiumUser(subscription, currentUser);

  if (limitReached) {
    return (
      <PageShell>
        <UpgradeModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          onSuccess={() => {
            setLimitReached(false);
            window.location.reload();
          }}
        />

        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl border border-black/5 shadow-2xl rounded-[32px] p-8 md:p-12 text-center max-w-lg">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 text-4xl rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              ⚠️
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 mb-3">
              {limitType === "pathway_lifetime" ? "Lifetime Limit Reached" : "Active Pathway Limit Reached"}
            </h2>

            <p className="text-slate-600 mb-6 leading-relaxed text-sm">
              {limitType === "pathway_lifetime" ? (
                <span>
                  You have already created your quota of <strong>3 lifetime learning pathways</strong> on the Free plan. (Deleting a pathway does not restore or grant a new slot).
                </span>
              ) : (
                <span>
                  You currently have <strong>20 active pathways</strong> on Premium. To start a new pathway, please delete an existing pathway from your dashboard.
                </span>
              )}
            </p>

            <div className="flex flex-col gap-3">
              {limitType === "pathway_lifetime" ? (
                <>
                  <button 
                    onClick={() => setUpgradeModalOpen(true)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 px-6 rounded-full font-black text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Upgrade to Premium ($49/mo)</span>
                  </button>
                  <button 
                    onClick={() => navigate("/student/plans")}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-full font-bold text-xs transition-colors cursor-pointer"
                  >
                    Compare All Plans
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => navigate("/student")}
                  className="bg-slate-800 text-white px-8 py-3.5 rounded-full font-black shadow-xl hover:scale-105 transition-all cursor-pointer"
                >
                  RETURN TO DASHBOARD
                </button>
              )}
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
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
        onSuccess={() => {
          setLimitModalOpen(false);
          window.location.reload();
        }}
      />

      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          
          {currentStep < 3 && (
            <div className="mb-8 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500 ease-out" 
                style={{ width: currentStep === 1 ? '50%' : '100%' }}
              ></div>
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-xl border border-black/5 shadow-2xl rounded-[32px] p-8 md:p-12 overflow-hidden relative min-h-[400px] flex flex-col justify-center">
            
            <AnimatePresence mode="wait">
              {/* STEP 1: PATH SELECTION */}
              {currentStep === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                >
                  <h2 className="text-3xl font-black text-slate-800 mb-2">What do you want to master?</h2>
                  <p className="text-slate-500 mb-8">Select a specialization to help us customize your curriculum.</p>
                  
                  {availablePaths.length === 0 ? (
                    <div className="bg-amber-50 text-amber-700 p-4 rounded-xl font-bold">No pathways are currently published. Please check back later!</div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {availablePaths.map((pathName) => (
                        <OptionCard 
                          key={pathName}
                          title={getPathwayName(pathName)} 
                          icon="🎯" 
                          selected={answers.pathName === pathName} 
                          onClick={() => handleSelect("pathName", pathName)} 
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2: LEVEL SELECTION */}
              {currentStep === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                >
                  <button onClick={() => setCurrentStep(1)} className="text-sm font-bold text-gray-400 hover:text-primary mb-4 transition-colors">← Back</button>
                  <h2 className="text-3xl font-black text-slate-800 mb-2">What is your current skill level?</h2>
                  <p className="text-slate-500 mb-8">Select from the available difficulty levels for {getPathwayName(answers.pathName)}.</p>
                  
                  <div className="grid gap-4">
                    {availableLevelsForSelectedPath.map((level) => {
                      const uiData = LEVEL_UI_CONFIG[level] || { title: level, desc: "", icon: "📚" };
                      
                      return (
                        <OptionCard 
                          key={level}
                          title={uiData.title} 
                          desc={uiData.desc}
                          icon={uiData.icon} 
                          selected={answers.level === level} 
                          onClick={() => handleSelect("level", level)} 
                        />
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: RESULT & ENROLLMENT */}
              {currentStep === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <h2 className="text-2xl font-bold text-slate-800">Finding your perfect path...</h2>
                    </div>
                  ) : (
                    <div>
                      {error ? (
                         <div className="bg-red-50 text-red-600 p-6 rounded-2xl mb-8 font-bold">
                           {error}
                         </div>
                      ) : (
                        <>
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 text-4xl rounded-full mb-6 shadow-sm">🎉</div>
                          <h2 className="text-3xl font-black text-slate-800 mb-2">We found your path!</h2>
                          <p className="text-slate-500 mb-8">Based on your answers, here is the best curriculum for you.</p>
                          
                          {recommendedTemplate ? (
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-left relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                              <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {recommendedTemplate.level} Level
                              </span>
                              <h3 className="text-2xl font-bold text-slate-800 mt-4 mb-1">{getPathwayName(recommendedTemplate.pathName)}</h3>
                              <p className="text-slate-500 text-sm">{recommendedTemplate.steps.length} Selected Learning Steps included.</p>
                            </div>
                          ) : (
                            <div className="bg-amber-50 text-amber-600 p-6 rounded-2xl mb-8 font-bold border border-amber-200">
                              We couldn't find a perfect match for that specific level. Please check back later!
                            </div>
                          )}

                          <button 
                            onClick={handleEnrollAndStart}
                            disabled={!recommendedTemplate || isLoading}
                            className="bg-primary text-white px-10 py-4 rounded-full font-black text-lg shadow-xl hover:brightness-95 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            ENROLL & START JOURNEY
                          </button>
                        </>
                      )}

                      <div className="mt-6">
                        <button 
                          onClick={() => {
                            setCurrentStep(1);
                            setRecommendedTemplate(null);
                            setAnswers({ pathName: "", level: "" });
                            setError("");
                          }} 
                          className="text-sm font-bold text-slate-400 hover:text-primary transition-colors cursor-pointer"
                        >
                          ← Change my answers
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </PageShell>
  );
};

// --- SUB-COMPONENTS ---

const OptionCard = ({ title, desc, icon, selected, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
      selected 
        ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
        : 'border-slate-100 bg-white hover:border-primary/40 hover:bg-slate-50'
    }`}
  >
    <span className="text-3xl mr-4">{icon}</span>
    <div>
      <h4 className={`font-bold ${selected ? 'text-primary' : 'text-slate-700'}`}>{title}</h4>
      {desc && <p className="text-xs text-slate-500 mt-1">{desc}</p>}
    </div>
  </button>
);

OptionCard.propTypes = {
  title: PropTypes.string.isRequired,
  desc: PropTypes.string,
  icon: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default PathFinder;
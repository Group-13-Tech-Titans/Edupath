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

// --- CONFIGURATION CONSTANTS ---
const API_BASE_URL = "http://localhost:5000/api";
const MAX_ACTIVE_PATHWAYS = 3;

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
  
  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  
  // Data State
  const [allTemplates, setAllTemplates] = useState([]); 
  const [availablePaths, setAvailablePaths] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [recommendedTemplate, setRecommendedTemplate] = useState(null);

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
        const [specRes, myDataRes, publishedRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/specializations`, config).catch(() => ({ data: { specializations: [] } })),
          axios.get(`${API_BASE_URL}/pathway/my?summary=true`, config).catch(() => ({ data: { hasPathway: false, pathways: [] } })),
          axios.get(`${API_BASE_URL}/pathway/published?summary=true`, config).catch(() => ({ data: { templates: [] } }))
        ]);

        //  Map Specializations
        setSpecializations(specRes.data.specializations || []);

        //  Enforce Business Logic Limits
        if (myDataRes.data.hasPathway && myDataRes.data.pathways?.length >= MAX_ACTIVE_PATHWAYS) {
          setLimitReached(true);
          setIsLoading(false);
          return; // Early return to block rendering the wizard
        }

        //  Populate Available Published Paths
        const templates = publishedRes.data.templates || [];
        setAllTemplates(templates); 
        
        // Extract unique path names dynamically
        const uniquePaths = [...new Set(templates.map(t => t.pathName))]; // Remove duplicate path names
        setAvailablePaths(uniquePaths);
        
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
    return val.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "); // e.g., "ui-ux" -> "Ui Ux"
  };

  const handleSelect = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    
    // Slight delay for UX so the user sees their selection highlight before transitioning
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
      
      const { data } = await axios.post(
        `${API_BASE_URL}/pathway/recommend`,
        finalAnswers,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRecommendedTemplate(data.template);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while analyzing your profile.");
      setIsLoading(false);
    }
  };

  const handleEnrollAndStart = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("edupath_token");
      
      const { data } = await axios.post(
        `${API_BASE_URL}/pathway/enroll/${recommendedTemplate._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/student/journey", { replace: true, state: { pathwayId: data.pathway._id } });
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to enroll in the pathway.");
      setIsLoading(false);
    }
  };

  // Derive available levels dynamically based on what the user picked in Step 1(Pathway)
  const availableLevelsForSelectedPath = answers.pathName 
    ? [...new Set(allTemplates.filter(t => t.pathName === answers.pathName).map(t => t.level))]
    : [];

  // --- EARLY RETURNS ---
  
  if (isLoading && currentStep === 1) return <PageShell><div className="p-10 text-center font-bold text-slate-500">Loading your learning paths...</div></PageShell>;
  if (error && currentStep === 1) return <PageShell><div className="p-10 text-center font-bold text-red-500">{error}</div></PageShell>;

  if (limitReached) {
    return (
      <PageShell>
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-xl border border-black/5 shadow-2xl rounded-[32px] p-8 md:p-12 text-center max-w-lg">
            <div className="w-20 h-20 bg-amber-100 text-amber-500 text-4xl rounded-full flex items-center justify-center mx-auto mb-6">⚠️</div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">Limit Reached</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              You already have the maximum of {MAX_ACTIVE_PATHWAYS} active learning journeys. To start a new specialization, you must delete an existing one from your dashboard.
            </p>
            <button 
              onClick={() => navigate("/student")}
              className="bg-slate-800 text-white px-8 py-3.5 rounded-full font-black shadow-xl hover:scale-105 transition-all"
            >
              RETURN TO DASHBOARD
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
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
                            className="bg-primary text-white px-10 py-4 rounded-full font-black text-lg shadow-xl hover:brightness-95 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            setError(""); // Clear errors on reset
                          }} 
                          className="text-sm font-bold text-slate-400 hover:text-primary transition-colors"
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
    className={`flex items-center text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
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
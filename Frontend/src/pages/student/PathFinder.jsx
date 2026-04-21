import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "../../components/PageShell.jsx";

// 🟢 NEW: Configuration for the level UI to keep it looking beautiful
const LEVEL_UI_CONFIG = {
  "Beginner": {
    title: "Absolute Beginner",
    desc: "I have never done this before and need to start from scratch.",
    icon: "🌱"
  },
  "Intermediate": {
    title: "Some Experience",
    desc: "I know the basics and want to build intermediate skills.",
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
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Dynamic Options from Database
  const [allTemplates, setAllTemplates] = useState([]); // 🟢 NEW: Store all raw templates
  const [availablePaths, setAvailablePaths] = useState([]);
  const [recommendedTemplate, setRecommendedTemplate] = useState(null);

  // Store student answers
  const [answers, setAnswers] = useState({
    pathName: "",
    level: "",
  });

  // Fetch available pathways on load
  useEffect(() => {
    const fetchAvailablePaths = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        const { data } = await axios.get("http://localhost:5000/api/pathway/published", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setAllTemplates(data.templates); // 🟢 Store everything so we can filter levels later

        // Extract unique pathNames from the published templates
        const uniquePaths = [...new Set(data.templates.map(t => t.pathName))];
        setAvailablePaths(uniquePaths);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load available pathways.");
        setLoading(false);
      }
    };
    fetchAvailablePaths();
  }, []);

  const handleSelect = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    
    setTimeout(() => {
      if (currentStep === 1) setCurrentStep(2);
      if (currentStep === 2) handleSubmitQuiz({ ...answers, [field]: value });
    }, 400);
  };

  const handleSubmitQuiz = async (finalAnswers) => {
    try {
      setLoading(true);
      setCurrentStep(3); 
      
      const token = localStorage.getItem("edupath_token");
      
      const { data } = await axios.post(
        "http://localhost:5000/api/pathway/recommend",
        finalAnswers,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRecommendedTemplate(data.template);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while analyzing your profile.");
      setLoading(false);
    }
  };

  const handleEnrollAndStart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("edupath_token");
      
      await axios.post(
        `http://localhost:5000/api/pathway/enroll/${recommendedTemplate._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🟢 FIXED: Add { replace: true } so they can't hit the "Back" button to return to the quiz
      navigate("/student/journey", { replace: true });
      
    } catch (err) {
      alert("Failed to enroll in the pathway.");
      setLoading(false);
    }
  };

  // 🟢 NEW: Calculate which levels actually exist for the selected path
  const availableLevelsForSelectedPath = answers.pathName 
    ? [...new Set(allTemplates.filter(t => t.pathName === answers.pathName).map(t => t.level))]
    : [];

  if (loading && currentStep === 1) return <PageShell><div className="p-10 text-center">Loading paths...</div></PageShell>;
  if (error) return <PageShell><div className="p-10 text-center text-red-500">{error}</div></PageShell>;

  return (
    <PageShell>
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          
          {/* Progress Bar */}
          {currentStep < 3 && (
            <div className="mb-8 w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: currentStep === 1 ? '50%' : '100%' }}
              ></div>
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-xl border border-black/5 shadow-2xl rounded-[32px] p-8 md:p-12 overflow-hidden relative min-h-[400px] flex flex-col justify-center">
            
            <AnimatePresence mode="wait">
              {/* QUESTION 1: DYNAMIC PATHWAYS */}
              {currentStep === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                >
                  <h2 className="text-3xl font-black text-slate-800 mb-2">What do you want to master?</h2>
                  <p className="text-slate-500 mb-8">Select a specialization to help us customize your curriculum.</p>
                  
                  {availablePaths.length === 0 ? (
                    <div className="bg-amber-50 text-amber-700 p-4 rounded-xl">No pathways are currently published. Please check back later!</div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {availablePaths.map((pathName, idx) => (
                        <OptionCard 
                          key={idx}
                          title={pathName} 
                          icon="🎯" 
                          selected={answers.pathName === pathName} 
                          onClick={() => handleSelect("pathName", pathName)} 
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* QUESTION 2: DYNAMIC LEVELS BASED ON SELECTION */}
              {currentStep === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                >
                  <button onClick={() => setCurrentStep(1)} className="text-sm font-bold text-gray-400 hover:text-primary mb-4">← Back</button>
                  <h2 className="text-3xl font-black text-slate-800 mb-2">What is your current skill level?</h2>
                  <p className="text-slate-500 mb-8">Select from the available difficulty levels for {answers.pathName}.</p>
                  
                  <div className="grid gap-4">
                    {/* 🟢 NEW: Loop through the available levels for this specific path */}
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

              {/* RESULTS / LOADING */}
              {currentStep === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  {loading ? (
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <h2 className="text-2xl font-bold text-slate-800">Finding your path...</h2>
                    </div>
                  ) : (
                    <div>
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 text-4xl rounded-full mb-6 shadow-sm">
                        🎉
                      </div>
                      <h2 className="text-3xl font-black text-slate-800 mb-2">We found your path!</h2>
                      <p className="text-slate-500 mb-8">Based on your answers, here is the best curriculum for you.</p>
                      
                      {recommendedTemplate ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-left relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                          <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {recommendedTemplate.level} Level
                          </span>
                          <h3 className="text-2xl font-bold text-slate-800 mt-4 mb-1">{recommendedTemplate.pathName}</h3>
                          <p className="text-slate-500 text-sm">{recommendedTemplate.steps.length} Curated Learning Steps included.</p>
                        </div>
                      ) : (
                        <div className="bg-red-50 text-red-600 p-6 rounded-2xl mb-8 font-bold">
                          We couldn't find a perfect match. Please check back later!
                        </div>
                      )}

                      <button 
                        onClick={handleEnrollAndStart}
                        disabled={!recommendedTemplate || loading}
                        className="bg-primary text-white px-10 py-4 rounded-full font-black text-lg shadow-xl hover:brightness-95 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                      >
                        ENROLL & START JOURNEY
                      </button>

                      {/* Back / Restart Button */}
                      <div className="mt-6">
                        <button 
                          onClick={() => {
                            setCurrentStep(1);
                            setRecommendedTemplate(null);
                            setAnswers({ pathName: "", level: "" });
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

export default PathFinder;
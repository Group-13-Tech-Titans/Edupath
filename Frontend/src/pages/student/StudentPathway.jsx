/**
 * STUDENT PATHWAY COMPONENT (THE LEARNING MAP)
 * Renders the student's interactive learning journey.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../../components/PageShell.jsx";

// --- CONFIGURATION CONSTANTS ---
const API_BASE_URL = "http://localhost:5000/api";

// Strips MongoDB _id to accurately compare arrays
const cleanForSync = (arr) => (Array.isArray(arr) ? arr.map(({ _id, id, ...rest }) => rest) : []);

// Determines the visual theme of the nodes
const getStepTheme = (isEven, isCompleted, isLocked) => {
  if (isCompleted) return { bg: "bg-amber-500", text: "text-amber-500", stroke: "#f59e0b" };
  if (isLocked) return { bg: "bg-gray-300", text: "text-gray-300", stroke: "#cbd5e0" }; 
  
  return isEven 
    ? { bg: "bg-primary", text: "text-primary", stroke: "#00a9b5" } 
    : { bg: "bg-slate-700", text: "text-slate-700", stroke: "#334155" };
};

// Returns dynamic text to resolve nested ternaries
const getStepIcon = (isCompleted, isLocked) => {
  if (isCompleted) {
    return "⭐";
  } else if (isLocked) {
    return "🔒";
  } else {
    return "💡";
  }
};

const getButtonText = (isCompleted) => {
  return isCompleted ? "REVIEW STEP" : "START LEARNING";
};

// ==========================================
// BACKGROUND SYNC ADAPTER
// ==========================================

const checkStepNeedsUpdate = (studentStep, templateStep) => {
  return (
    studentStep.title !== templateStep.title ||
    studentStep.description !== templateStep.description ||
    // Strip database IDs and compare nested arrays as flat JSON strings
    JSON.stringify(cleanForSync(studentStep.resources)) !== JSON.stringify(cleanForSync(templateStep.resources)) ||
    JSON.stringify(cleanForSync(studentStep.linkedCourses)) !== JSON.stringify(cleanForSync(templateStep.linkedCourses)) ||
    JSON.stringify(cleanForSync(studentStep.quiz)) !== JSON.stringify(cleanForSync(templateStep.quiz))
  );
};

// update an existing matching step with fresh content by getting master templateStep and checks it against an existing array of a student's progress (syncedSteps)
const processTemplateStep = (templateStep, syncedSteps) => {
  const existingIndex = syncedSteps.findIndex((s) => s.order === templateStep.order);
  let updated = false;

  if (existingIndex >= 0) {
    const studentStep = syncedSteps[existingIndex];
    
    if (checkStepNeedsUpdate(studentStep, templateStep)) {
      syncedSteps[existingIndex] = {
        ...studentStep,
        title: templateStep.title,
        description: templateStep.description,
        resources: templateStep.resources || [], 
        linkedCourses: templateStep.linkedCourses || [],
        quiz: templateStep.quiz || [], 
      };
      updated = true;
    }
  } else {
    const isFullyComplete = syncedSteps.length > 0 && syncedSteps.every((s) => s.isCompleted);
    const isUnlockable = isFullyComplete && templateStep.order === syncedSteps.length + 1;

    // Append new step with default completion values
    syncedSteps.push({
      title: templateStep.title,
      description: templateStep.description,
      type: templateStep.type,
      resources: templateStep.resources || [],
      linkedCourses: templateStep.linkedCourses || [],
      quiz: templateStep.quiz || [],
      order: templateStep.order,
      isCompleted: false,
      isUnlocked: templateStep.order === 1 ? true : isUnlockable,
    });
    updated = true;
  }
  
  return updated;
};

const findMatchingTemplate = (studentPathway, templates) => {
  return templates.find((t) => {
    if (studentPathway.originalTemplateId) {
      return t._id === studentPathway.originalTemplateId;
    }
    return t.pathName === studentPathway.pathName && t.level === studentPathway.level;
  });
};

// Synchronizes a student's personal progress tracking pathway with the global master template.

const syncStudentPathwayWithTemplate = async (currentStudentPathway, templateData, config) => {
  const pathwayTemplate = findMatchingTemplate(currentStudentPathway, templateData.templates);

  if (!pathwayTemplate) return currentStudentPathway;

  let hasUpdates = false;
  const syncedSteps = [...currentStudentPathway.steps];

  pathwayTemplate.steps.forEach((templateStep) => {
    const stepWasUpdated = processTemplateStep(templateStep, syncedSteps);
    if (stepWasUpdated) hasUpdates = true;
  });

  if (hasUpdates) {
    // Sort steps in ascending numerical order (e.g., Step 1, Step 2, Step 3)
    syncedSteps.sort((a, b) => a.order - b.order);
    currentStudentPathway.steps = syncedSteps;
    // Silently persist changes to the backend in the background to ensure an uninterrupted user experience
    axios.put(`${API_BASE_URL}/pathway/my/sync`, { pathwayId: currentStudentPathway._id, steps: syncedSteps }, config)
         .catch((err) => console.error("Silent sync failed:", err));
  }

  return currentStudentPathway;
};


const StepCard = ({ step, theme, isActive, isCompleted, pathwayId, navigate, pointerDir }) => (
  <motion.div whileHover={{ y: -4 }} className={`relative w-full max-w-[360px] rounded-[30px] p-6 sm:p-8 text-white shadow-xl ${theme.bg}`}>
    <div className={`absolute top-1/2 -translate-y-1/2 ${pointerDir === 'right' ? '-right-2' : '-left-2'} w-6 h-6 rotate-45 rounded-sm ${theme.bg}`} />
    <h3 className="text-base sm:text-xl font-bold uppercase tracking-wide mb-1.5">{step.title}</h3>
    <p className="text-xs sm:text-sm leading-relaxed opacity-90">{step.description}</p>
    {(isActive || isCompleted) && (
      <button 
        onClick={() => navigate(`/student/journey/step/${step.order}`, { state: { pathwayId } })} 
        className="mt-5 text-xs font-black bg-white text-gray-800 px-6 py-2.5 rounded-full shadow hover:bg-gray-100 transition-transform active:scale-95"
      >
        {getButtonText(isCompleted)}
      </button>
    )}
  </motion.div>
);

StepCard.propTypes = {
  step: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  isActive: PropTypes.bool.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  pathwayId: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
  pointerDir: PropTypes.oneOf(['left', 'right']).isRequired,
};

const StepNumber = ({ index, theme, align }) => (
  <div className={`flex flex-col min-w-[120px] ${align === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
    <span className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-[-12px]">Step</span>
    <span className={`text-[80px] lg:text-[120px] font-black leading-none tracking-tighter drop-shadow-sm ${theme.text}`}>
      {String(index + 1).padStart(2, "0")}
    </span>
  </div>
);

StepNumber.propTypes = {
  index: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
  align: PropTypes.oneOf(['left', 'right']).isRequired,
};


// Middle PATHWAY NODE
const PathwayStepNode = ({ step, index, pathwayId, navigate }) => {
  const isEven = index % 2 === 0;
  const isCompleted = step.isCompleted;
  const isUnlocked = step.isUnlocked;
  const isLocked = !isUnlocked;
  const isActive = isUnlocked && !isCompleted;
  
  const theme = getStepTheme(isEven, isCompleted, isLocked);
  
  const svgPath = isEven ? "M 0 0 C 100 0, 100 100, 0 100" : "M 100 0 C 0 0, 0 100, 100 100";
  const svgStroke = isCompleted ? "#f59e0b" : "#cbd5e0";

  return (
    <div className="relative flex items-center justify-center w-full min-h-[220px] sm:min-h-[300px]">
      {/* BACKGROUND SVG CONNECTOR LINE */}
      <svg className={`hidden sm:block absolute top-1/2 h-full w-[25%] sm:w-[20%] pointer-events-none z-0 ${isEven ? "left-1/2" : "right-1/2"}`} preserveAspectRatio="none" viewBox="0 0 100 100">
        <path d={svgPath} fill="none" stroke={svgStroke} strokeWidth="4" strokeDasharray="6,8" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* DESKTOP LAYOUT */}
      <div className="hidden sm:flex w-full h-full relative z-10">
        <div className="w-1/2 flex items-center justify-end pr-12 sm:pr-20 lg:pr-32">
          {isEven ? (
            <StepCard step={step} theme={theme} isActive={isActive} isCompleted={isCompleted} pathwayId={pathwayId} navigate={navigate} pointerDir="right" />
          ) : (
            <StepNumber index={index} theme={theme} align="right" />
          )}
        </div>

        {/* CENTER NODE ICON */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <motion.div whileHover={(isActive || isCompleted) ? { scale: 1.05 } : {}} className={`flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white shadow-2xl border-[8px] sm:border-[10px] transition-transform ${theme.text.replace("text-", "border-")}`}>
            <span className={`text-3xl sm:text-4xl ${isLocked ? "grayscale opacity-30" : ""}`}>
              {getStepIcon(isCompleted, isLocked)}
            </span>
          </motion.div>
        </div>

        <div className="w-1/2 flex items-center justify-start pl-12 sm:pl-20 lg:pl-32">
          {isEven ? (
            <StepNumber index={index} theme={theme} align="left" />
          ) : (
            <StepCard step={step} theme={theme} isActive={isActive} isCompleted={isCompleted} pathwayId={pathwayId} navigate={navigate} pointerDir="left" />
          )}
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="sm:hidden flex w-full relative z-10 pl-4 pr-4 py-8">
        <div className="flex-shrink-0 z-20">
          <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl border-[6px] ${theme.text.replace("text-", "border-")}`}>
            <span className={`text-3xl ${isLocked ? "grayscale opacity-30" : ""}`}>
              {getStepIcon(isCompleted, isLocked)}
            </span>
          </div>
        </div>
        <div className="ml-6 flex flex-col w-full">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Step</span>
            <span className={`text-5xl font-black tracking-tighter ${theme.text}`}>{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div className={`relative w-full rounded-3xl p-6 text-white shadow-lg ${theme.bg}`}>
            <div className={`absolute top-6 -left-2 w-4 h-4 rotate-45 rounded-sm ${theme.bg}`} />
            <h3 className="text-lg font-bold uppercase tracking-wide mb-1">{step.title}</h3>
            <p className="text-xs opacity-90">{step.description}</p>
            {(isActive || isCompleted) && (
              <button onClick={() => navigate(`/student/journey/step/${step.order}`, { state: { pathwayId } })} className="mt-4 text-[10px] font-black bg-white text-gray-800 px-5 py-2.5 rounded-full shadow hover:bg-gray-50 active:scale-95">
                {getButtonText(isCompleted)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

PathwayStepNode.propTypes = {
  step: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  pathwayId: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
};


const StudentPathway = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const targetPathwayId = location.state?.pathwayId; 

  const [pathway, setPathway] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    try {
      const token = localStorage.getItem("edupath_token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const myUrl = targetPathwayId ? `${API_BASE_URL}/pathway/my?pathwayId=${targetPathwayId}` : `${API_BASE_URL}/pathway/my`;
      const [specRes, pathwayRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/specializations`, config).catch(() => ({ data: { specializations: [] } })),
        axios.get(myUrl, config).catch(() => ({ data: { hasPathway: false } }))
      ]);

      setSpecializations(specRes.data.specializations || []);
      const pathwayData = pathwayRes.data;

      if (pathwayData.hasPathway && pathwayData.pathways?.length > 0) {
        let currentStudentPathway = targetPathwayId
            ? pathwayData.pathways.find(p => p._id === targetPathwayId)
            : pathwayData.pathways[0];

        if (!currentStudentPathway)
          currentStudentPathway = pathwayData.pathways[0];

        // Render immediately using existing pathway data for instant loading
        setPathway({ ...currentStudentPathway });

        // Run template sync silently in the background without blocking UI rendering
        const queryParams = currentStudentPathway.originalTemplateId
          ? `?templateId=${currentStudentPathway.originalTemplateId}`
          : `?pathName=${encodeURIComponent(currentStudentPathway.pathName)}&level=${encodeURIComponent(currentStudentPathway.level)}`;
        axios.get(`${API_BASE_URL}/pathway/published${queryParams}`, config)
          .then(async ({ data: templateData }) => {
            const syncedPathway = await syncStudentPathwayWithTemplate(currentStudentPathway, templateData, config);
            if (syncedPathway && syncedPathway.steps !== currentStudentPathway.steps) {
              setPathway({ ...syncedPathway });
            }
          })
          .catch((syncErr) => {
            console.error("Template sync check failed, loading local copy.", syncErr);
          });
      } else {
        const res = await axios.get(`${API_BASE_URL}/pathway/published`, config);
        setAvailableTemplates(res.data.templates);
      }
    } catch (err) {
      console.error("Critical component failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPathwayName = (val) => {
    if (!val) return "";
    const found = specializations.find(s => s.slug === val || s.name === val);
    if (found) return found.name;
    
    if (val.includes(" ")) return val;
    return val.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const handleEnroll = async (templateId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("edupath_token");
      const { data } = await axios.post(`${API_BASE_URL}/pathway/enroll/${templateId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setPathway(data.pathway);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to enroll");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageShell><div className="p-10 text-center font-bold text-slate-500">Loading Journey...</div></PageShell>;

  if (!pathway) {
    return (
      <PageShell>
        <div className="mx-auto max-w-4xl pt-10 text-center">
          <h1 className="text-3xl font-bold mb-8">Available Pathways</h1>
          <div className="grid gap-6 sm:grid-cols-2">
            {availableTemplates.map((t) => (
              <motion.div whileHover={{ y: -4 }} key={t._id} className="p-6 bg-white rounded-3xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold mb-4">{getPathwayName(t.pathName)}</h3>
                <p className="text-muted mb-6">{t.steps.length} Steps Included</p>
                <button onClick={() => handleEnroll(t._id)} className="bg-primary text-white px-8 py-3 rounded-full font-bold w-full hover:brightness-95 transition-all">
                  Enroll Now
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  const completedCount = pathway.steps.filter((s) => s.isCompleted).length;
  const isPathwayStarted = completedCount > 0;
  const isPathwayFinished = completedCount === pathway.steps.length && pathway.steps.length > 0;

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl py-12 px-2 sm:px-4">
        <button onClick={() => navigate("/student")} className="mb-6 text-sm font-bold text-slate-400 hover:text-primary transition-colors">
            ← Back to Dashboard
        </button>

        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tight">
            {getPathwayName(pathway.pathName)}
          </h1>
          <p className="mt-3 text-lg font-bold text-primary uppercase tracking-widest">
            {pathway.level} Journey
          </p>
        </div>

        <div className="relative flex flex-col items-center w-full pb-20">
          <div className="sm:hidden absolute left-[3.25rem] top-[80px] bottom-[80px] w-0 border-l-[4px] border-dashed border-gray-300 z-0" />

          {/* START NODE */}
          <div className="relative flex items-center justify-center w-full min-h-[160px] sm:min-h-[220px]">
            <svg className="hidden sm:block absolute top-1/2 h-full w-[25%] sm:w-[20%] right-1/2 z-0" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M 100 0 C 0 0, 0 100, 100 100" fill="none" stroke={isPathwayStarted ? "#f59e0b" : "#cbd5e0"} strokeWidth="4" strokeDasharray="6,8" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="sm:hidden flex w-full relative z-10 pl-4 pr-4">
              <div className="flex-shrink-0 z-20">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl border-[6px] border-gray-200 text-3xl">🚀</div>
              </div>
            </div>
            <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white shadow-xl border-[8px] sm:border-[10px] border-gray-200 text-4xl">🚀</div>
            </div>
          </div>

          {/* DYNAMIC STEPS */}
          {pathway.steps.map((step, index) => (
            <PathwayStepNode 
              key={step._id || step.id || index} 
              step={step} 
              index={index} 
              pathwayId={pathway._id} 
              navigate={navigate} 
            />
          ))}

          {/* COMPLETE NODE */}
          <div className="relative flex items-center justify-center w-full min-h-[160px] sm:min-h-[220px]">
            <div className="sm:hidden flex w-full relative z-10 pl-4 pr-4">
              <div className="flex-shrink-0 z-20">
                <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl border-[6px] ${isPathwayFinished ? "border-amber-400" : "border-gray-200"} text-3xl transition-colors duration-500`}>🏁</div>
              </div>
            </div>
            <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className={`flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white shadow-xl border-[8px] sm:border-[10px] ${isPathwayFinished ? "border-amber-400" : "border-gray-200"} text-4xl transition-colors duration-500`}>🏁</div>
            </div>
          </div>

        </div>
      </div>
    </PageShell>
  );
};

export default StudentPathway;
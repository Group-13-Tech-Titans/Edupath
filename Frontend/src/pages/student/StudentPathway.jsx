import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../../components/PageShell.jsx";

const StudentPathway = () => {
  const navigate = useNavigate();
  const [pathway, setPathway] = useState(null);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    try {
      const token = localStorage.getItem("edupath_token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data: pathwayData } = await axios.get(
        "http://localhost:5000/api/pathway/my",
        config,
      );

      if (pathwayData.hasPathway) {
        let currentStudentPathway = pathwayData.pathway;

        // ==========================================
        // FEATURE: SMART PATHWAY DEEP-SYNCHRONIZATION
        // ==========================================
        try {
          const { data: templateData } = await axios.get(
            `http://localhost:5000/api/pathway/published`,
            config,
          );
          
          // 🟢 FIXED: Use originalTemplateId to find the EXACT match, fallback to name+level for old data
          const pathwayTemplate = templateData.templates.find((t) => {
            if (currentStudentPathway.originalTemplateId) {
              return t._id === currentStudentPathway.originalTemplateId;
            }
            return t.pathName === currentStudentPathway.pathName && t.level === currentStudentPathway.level;
          });

          if (pathwayTemplate) {
            let hasUpdates = false;
            let syncedSteps = [...currentStudentPathway.steps];

            // Iterate through the master template to find changes
            pathwayTemplate.steps.forEach((templateStep) => {
              // Match steps by their exact ORDER, not their Title
              const existingIndex = syncedSteps.findIndex(
                (s) => s.order === templateStep.order,
              );

              if (existingIndex !== -1) {
                // 1. STEP EXISTS: Did the admin change the content?
                const studentStep = syncedSteps[existingIndex];

                if (
                  studentStep.title !== templateStep.title ||
                  studentStep.description !== templateStep.description ||
                  // Compare the new arrays using JSON.stringify to detect ANY changes in links, titles, or quizzes
                  JSON.stringify(studentStep.resources || []) !==
                    JSON.stringify(templateStep.resources || []) ||
                  JSON.stringify(studentStep.quiz || []) !== JSON.stringify(templateStep.quiz || [])
                ) {
                  // Update the text and resources, but PRESERVE the student's progress
                  syncedSteps[existingIndex] = {
                    ...studentStep,
                    title: templateStep.title,
                    description: templateStep.description,
                    resources: templateStep.resources || [], // Safely copy the resources array
                    quiz: templateStep.quiz || [], // Sync the quiz
                  };
                  hasUpdates = true;
                }
              } else {
                // 2. STEP IS BRAND NEW: Admin added a completely new step
                const isFullyComplete = syncedSteps.every((s) => s.isCompleted);
                const isUnlockable =
                  isFullyComplete &&
                  templateStep.order === syncedSteps.length + 1;

                syncedSteps.push({
                  title: templateStep.title,
                  description: templateStep.description,
                  type: templateStep.type,
                  resource: templateStep.resource,
                  resources: templateStep.resources || [],
                  quiz: templateStep.quiz || [],
                  order: templateStep.order,
                  isCompleted: false,
                  isUnlocked: isUnlockable,
                });
                hasUpdates = true;
              }
            });

            // If changes were found, sort them and send the full synced array to the backend
            if (hasUpdates) {
              syncedSteps.sort((a, b) => a.order - b.order);
              currentStudentPathway.steps = syncedSteps;

              // Silent background save of the PERFECTLY synced array
              axios
                .put(
                  `http://localhost:5000/api/pathway/my/sync`,
                  { steps: syncedSteps },
                  config,
                )
                .catch((err) => console.error("Silent sync failed:", err));
            }
          }
        } catch (syncErr) {
          console.error(
            "Template sync check failed, loading local copy.",
            syncErr,
          );
        }

        setPathway({ ...currentStudentPathway });
      } else {
        const res = await axios.get(
          "http://localhost:5000/api/pathway/published",
          config,
        );
        setAvailableTemplates(res.data.templates);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleEnroll = async (templateId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("edupath_token");
      const { data } = await axios.post(
        `http://localhost:5000/api/pathway/enroll/${templateId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPathway(data.pathway);
      setLoading(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to enroll");
      setLoading(false);
    }
  };

  const getStepTheme = (isEven, isCompleted, isLocked) => {
    if (isCompleted)
      return { bg: "bg-amber-500", text: "text-amber-500", stroke: "#f59e0b" };
    if (isLocked)
      return { bg: "bg-gray-300", text: "text-gray-300", stroke: "#cbd5e0" };

    return isEven
      ? { bg: "bg-primary", text: "text-primary", stroke: "#00a9b5" }
      : { bg: "bg-slate-700", text: "text-slate-700", stroke: "#334155" };
  };

  if (loading)
    return (
      <PageShell>
        <div className="p-10 text-center">Loading Journey...</div>
      </PageShell>
    );

  if (!pathway) {
    return (
      <PageShell>
        <div className="mx-auto max-w-4xl pt-10 text-center">
          <h1 className="text-3xl font-bold mb-8">Available Pathways</h1>
          <div className="grid gap-6 sm:grid-cols-2">
            {availableTemplates.map((t, index) => (
              <motion.div
                whileHover={{ y: -4 }}
                key={`template-${t._id || index}`}
                className="p-6 bg-white rounded-3xl shadow-lg border border-gray-100"
              >
                <h3 className="text-xl font-bold mb-4">{t.pathName}</h3>
                <p className="text-muted mb-6">
                  {t.steps.length} Steps Included
                </p>
                <button
                  onClick={() => handleEnroll(t._id)}
                  className="bg-primary text-white px-8 py-3 rounded-full font-bold w-full hover:brightness-95 transition-all"
                >
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
  const isPathwayFinished =
    completedCount === pathway.steps.length && pathway.steps.length > 0;

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl py-12 px-2 sm:px-4">
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tight">
            {pathway.pathName}
          </h1>
          <p className="mt-3 text-lg font-bold text-primary uppercase tracking-widest">
            Your Learning Journey
          </p>
        </div>

        <div className="relative flex flex-col items-center w-full pb-20">
          <div className="sm:hidden absolute left-[3.25rem] top-[80px] bottom-[80px] w-0 border-l-[4px] border-dashed border-gray-300 z-0" />

          {/* START NODE */}
          <div className="relative flex items-center justify-center w-full min-h-[160px] sm:min-h-[220px]">
            <svg
              className="hidden sm:block absolute top-1/2 h-full w-[25%] sm:w-[20%] right-1/2 z-0"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <path
                d="M 100 0 C 0 0, 0 100, 100 100"
                fill="none"
                stroke={isPathwayStarted ? "#f59e0b" : "#cbd5e0"}
                strokeWidth="4"
                strokeDasharray="6,8"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div className="sm:hidden flex w-full relative z-10 pl-4 pr-4">
              <div className="flex-shrink-0 z-20">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl border-[6px] border-gray-200 text-3xl">
                  🚀
                </div>
              </div>
            </div>
            <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white shadow-xl border-[8px] sm:border-[10px] border-gray-200 text-4xl">
                🚀
              </div>
            </div>
          </div>

          {/* MAP STEPS LOOP */}
          {pathway.steps.map((step, index) => {
            const isEven = index % 2 === 0;
            const isCompleted = step.isCompleted;
            const isActive = step.isUnlocked && !step.isCompleted;
            const isLocked = !step.isUnlocked;

            const theme = getStepTheme(isEven, isCompleted, isLocked);

            return (
              <div
                key={`step-${index}-${step.order}`}
                className="relative flex items-center justify-center w-full min-h-[220px] sm:min-h-[300px]"
              >
                <svg
                  className={`hidden sm:block absolute top-1/2 h-full w-[25%] sm:w-[20%] pointer-events-none z-0 ${isEven ? "left-1/2" : "right-1/2"}`}
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <path
                    d={
                      isEven
                        ? "M 0 0 C 100 0, 100 100, 0 100"
                        : "M 100 0 C 0 0, 0 100, 100 100"
                    }
                    fill="none"
                    stroke={isCompleted ? "#f59e0b" : "#cbd5e0"}
                    strokeWidth="4"
                    strokeDasharray="6,8"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                <div className="hidden sm:flex w-full h-full relative z-10">
                  <div
                    className={`w-1/2 flex items-center justify-end pr-12 sm:pr-20 lg:pr-32`}
                  >
                    {isEven ? (
                      <motion.div
                        whileHover={{ y: -4 }}
                        className={`relative w-full max-w-[360px] rounded-[30px] p-6 sm:p-8 text-white shadow-xl ${theme.bg}`}
                      >
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 -right-2 w-6 h-6 rotate-45 rounded-sm ${theme.bg}`}
                        />
                        <h3 className="text-base sm:text-xl font-bold uppercase tracking-wide mb-1.5">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                          {step.description}
                        </p>
                        {isActive && (
                          <button
                            onClick={() =>
                              navigate(`/student/journey/step/${step.order}`)
                            }
                            className="mt-5 text-xs font-black bg-white text-gray-800 px-6 py-2.5 rounded-full shadow hover:bg-gray-100 transition-transform active:scale-95"
                          >
                            START LEARNING
                          </button>
                        )}
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-end text-right min-w-[120px]">
                        <span className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-[-12px]">
                          Step
                        </span>
                        <span
                          className={`text-[80px] lg:text-[120px] font-black leading-none tracking-tighter drop-shadow-sm ${theme.text}`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <motion.div
                      whileHover={isActive ? { scale: 1.05 } : {}}
                      className={`flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white shadow-2xl border-[8px] sm:border-[10px] transition-transform ${theme.text.replace("text-", "border-")}`}
                    >
                      <span
                        className={`text-3xl sm:text-4xl ${isLocked ? "grayscale opacity-30" : ""}`}
                      >
                        {isCompleted ? "⭐" : isLocked ? "🔒" : "💡"}
                      </span>
                    </motion.div>
                  </div>

                  <div
                    className={`w-1/2 flex items-center justify-start pl-12 sm:pl-20 lg:pl-32`}
                  >
                    {isEven ? (
                      <div className="flex flex-col items-start text-left min-w-[120px]">
                        <span className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-[-12px]">
                          Step
                        </span>
                        <span
                          className={`text-[80px] lg:text-[120px] font-black leading-none tracking-tighter drop-shadow-sm ${theme.text}`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                    ) : (
                      <motion.div
                        whileHover={{ y: -4 }}
                        className={`relative w-full max-w-[360px] rounded-[30px] p-6 sm:p-8 text-white shadow-xl ${theme.bg}`}
                      >
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 -left-2 w-6 h-6 rotate-45 rounded-sm ${theme.bg}`}
                        />
                        <h3 className="text-base sm:text-xl font-bold uppercase tracking-wide mb-1.5">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                          {step.description}
                        </p>
                        {isActive && (
                          <button
                            onClick={() =>
                              navigate(`/student/journey/step/${step.order}`)
                            }
                            className="mt-5 text-xs font-black bg-white text-gray-800 px-6 py-2.5 rounded-full shadow hover:bg-gray-100 transition-transform active:scale-95"
                          >
                            START LEARNING
                          </button>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* MOBILE LAYOUT */}
                <div className="sm:hidden flex w-full relative z-10 pl-4 pr-4 py-8">
                  <div className="flex-shrink-0 z-20">
                    <div
                      className={`flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl border-[6px] ${theme.text.replace("text-", "border-")}`}
                    >
                      <span
                        className={`text-3xl ${isLocked ? "grayscale opacity-30" : ""}`}
                      >
                        {isCompleted ? "⭐" : isLocked ? "🔒" : "💡"}
                      </span>
                    </div>
                  </div>
                  <div className="ml-6 flex flex-col w-full">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase">
                        Step
                      </span>
                      <span
                        className={`text-5xl font-black tracking-tighter ${theme.text}`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div
                      className={`relative w-full rounded-3xl p-6 text-white shadow-lg ${theme.bg}`}
                    >
                      <div
                        className={`absolute top-6 -left-2 w-4 h-4 rotate-45 rounded-sm ${theme.bg}`}
                      />
                      <h3 className="text-lg font-bold uppercase tracking-wide mb-1">
                        {step.title}
                      </h3>
                      <p className="text-xs opacity-90">{step.description}</p>
                      {isActive && (
                        <button
                          onClick={() =>
                            navigate(`/student/journey/step/${step.order}`)
                          }
                          className="mt-4 text-[10px] font-black bg-white text-gray-800 px-5 py-2.5 rounded-full shadow hover:bg-gray-50 active:scale-95"
                        >
                          START LEARNING
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* COMPLETE NODE */}
          <div className="relative flex items-center justify-center w-full min-h-[160px] sm:min-h-[220px]">
            <div className="sm:hidden flex w-full relative z-10 pl-4 pr-4">
              <div className="flex-shrink-0 z-20">
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl border-[6px] ${isPathwayFinished ? "border-amber-400" : "border-gray-200"} text-3xl transition-colors duration-500`}
                >
                  🏁
                </div>
              </div>
            </div>
            <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div
                className={`flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white shadow-xl border-[8px] sm:border-[10px] ${isPathwayFinished ? "border-amber-400" : "border-gray-200"} text-4xl transition-colors duration-500`}
              >
                🏁
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default StudentPathway;
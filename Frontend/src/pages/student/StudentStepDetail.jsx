/**
 * STUDENT STEP DETAIL COMPONENT
 * Renders the content, resources, and quiz for a specific pathway step.
 * Design Patterns: Single Responsibility Principle, Sub-component Extraction, Guard Clauses.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import PageShell from "../../components/PageShell.jsx"; 

const API_BASE_URL = "http://localhost:5000/api";

const cleanForSync = (arr) => (Array.isArray(arr) ? arr.map(({ _id, id, ...rest }) => rest) : []);

// ==========================================
// BACKGROUND SYNC ADAPTER
// ==========================================

const checkStepNeedsUpdate = (studentStep, templateStep) => {
  return (
    studentStep.title !== templateStep.title ||
    studentStep.description !== templateStep.description ||
    JSON.stringify(cleanForSync(studentStep.resources)) !== JSON.stringify(cleanForSync(templateStep.resources)) ||
    JSON.stringify(cleanForSync(studentStep.linkedCourses)) !== JSON.stringify(cleanForSync(templateStep.linkedCourses)) ||
    JSON.stringify(cleanForSync(studentStep.quiz)) !== JSON.stringify(cleanForSync(templateStep.quiz))
  );
};

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

const syncWithTemplate = async (currentStudentPathway, config) => {
  try {
    const { data: templateData } = await axios.get(`${API_BASE_URL}/pathway/published`, config);
    const pathwayTemplate = templateData.templates.find((t) => {
      if (currentStudentPathway.originalTemplateId) return t._id === currentStudentPathway.originalTemplateId;
      return t.pathName === currentStudentPathway.pathName && t.level === currentStudentPathway.level;
    });

    if (pathwayTemplate) {
      let hasUpdates = false;
      const syncedSteps = [...currentStudentPathway.steps];

      pathwayTemplate.steps.forEach((templateStep) => {
        if (processTemplateStep(templateStep, syncedSteps)) hasUpdates = true;
      });

      if (hasUpdates) {
        syncedSteps.sort((a, b) => a.order - b.order);
        currentStudentPathway.steps = syncedSteps;
        axios.put(`${API_BASE_URL}/pathway/my/sync`, { pathwayId: currentStudentPathway._id, steps: syncedSteps }, config).catch(console.error);
      }
    }
  } catch (syncErr) {
    console.error("Deep sync failed on step detail page", syncErr);
  }
  return currentStudentPathway;
};

// ==========================================
// EXTRACTED UI COMPONENTS 
// ==========================================

const ResourceCard = ({ res, icon, themeClass, hoverClass, isDownloadable, handleView, handleDownload, downloadingUrl, viewingUrl }) => {
  if (!isDownloadable) {
    return (
      <a href={res.url} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all group ${hoverClass}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${themeClass}`}>{icon}</div>
          <span className="font-bold text-sm text-slate-700 truncate">{res.title || "External Link"}</span>
        </div>
        <span className="text-gray-300 transition-colors ml-2 shrink-0">↗</span>
      </a>
    );
  }

  return (
    <div className={`flex flex-col bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all group ${hoverClass}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${themeClass}`}>{icon}</div>
        <span className="font-bold text-sm text-slate-700 line-clamp-2">{res.title || "Read Document"}</span>
      </div>
      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-50">
        <button 
          onClick={(e) => handleView(e, res.url, res.type)}
          disabled={viewingUrl === res.url}
          className="flex-1 text-center bg-slate-50 text-slate-600 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {viewingUrl === res.url ? "Opening..." : "View"}
        </button>
        <button 
          onClick={(e) => handleDownload(e, res.url, res.title, res.type)} 
          disabled={downloadingUrl === res.url}
          className="flex-1 text-center bg-blue-50 text-blue-600 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloadingUrl === res.url ? "⏳ Downloading..." : "↓ Download"}
        </button>
      </div>
    </div>
  );
};

ResourceCard.propTypes = {
  res: PropTypes.object.isRequired,
  icon: PropTypes.string.isRequired,
  themeClass: PropTypes.string.isRequired,
  hoverClass: PropTypes.string.isRequired,
  isDownloadable: PropTypes.bool,
  handleView: PropTypes.func,
  handleDownload: PropTypes.func,
  downloadingUrl: PropTypes.string,
  viewingUrl: PropTypes.string,
};

const ResourceSection = ({ title, icon, items, themeClass, hoverClass, isDownloadable, handleView, handleDownload, downloadingUrl, viewingUrl }) => {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h4>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((res) => (
          <ResourceCard 
            key={res._id || res.url || res.title} 
            res={res} 
            icon={icon} 
            themeClass={themeClass} 
            hoverClass={hoverClass} 
            isDownloadable={isDownloadable} 
            handleView={handleView} 
            handleDownload={handleDownload} 
            viewingUrl={viewingUrl} 
            downloadingUrl={downloadingUrl} 
          />
        ))}
      </div>
    </div>
  );
};

ResourceSection.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  themeClass: PropTypes.string.isRequired,
  hoverClass: PropTypes.string.isRequired,
  isDownloadable: PropTypes.bool,
  handleView: PropTypes.func,
  handleDownload: PropTypes.func,
  downloadingUrl: PropTypes.string,
  viewingUrl: PropTypes.string,
};

const LinkedCourseCard = ({ course }) => (
  <Link to={`/student/courses/${course.courseId}`} className="flex gap-4 bg-white border border-blue-100 p-3 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
    <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100">
      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    </div>
    <div className="flex flex-col justify-center">
      <h4 className="font-bold text-sm text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">{course.title}</h4>
      <p className="text-xs text-slate-500 mt-1">{course.educatorName}</p>
      <span className="text-xs font-bold text-blue-500 mt-2">View Course →</span>
    </div>
  </Link>
);

LinkedCourseCard.propTypes = {
  course: PropTypes.object.isRequired,
};

// 🟢 NEW: Extracted to flatten the S2004 Deep Nesting in the Quiz
const QuizOption = ({ opt, optId, inputName, isChecked, onChange }) => (
  <label
    htmlFor={optId}
    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${isChecked ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-slate-200 hover:border-primary/50'}`}
  >
    <input
      id={optId}
      type="radio"
      name={inputName}
      checked={isChecked}
      onChange={onChange}
      className="w-4 h-4 text-primary focus:ring-primary mr-3"
    />
    <span className="text-sm text-slate-700">{opt}</span>
  </label>
);

QuizOption.propTypes = {
  opt: PropTypes.string.isRequired,
  optId: PropTypes.string.isRequired,
  inputName: PropTypes.string.isRequired,
  isChecked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

// 🟢 NEW: Extracted to flatten the S2004 Deep Nesting in the Quiz
const QuizQuestion = ({ q, qIndex, stepIdentifier, selectedAnswer, onAnswerChange }) => {
  const qKey = q._id || `quiz-q-${qIndex}`;

  return (
    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
      <p className="font-semibold text-slate-800 mb-4"><span className="text-primary mr-2">Q{qIndex + 1}.</span>{q.question}</p>
      <div className="space-y-2">
        {q.options.map((opt, optIndex) => {
          const optId = `opt-${qKey}-${optIndex}`;
          const isChecked = selectedAnswer === optIndex;
          const handleChange = () => onAnswerChange(qIndex, optIndex);

          return (
            <QuizOption
              key={optId}
              opt={opt}
              optId={optId}
              inputName={`q-${stepIdentifier}-${qIndex}`}
              isChecked={isChecked}
              onChange={handleChange}
            />
          );
        })}
      </div>
    </div>
  );
};

QuizQuestion.propTypes = {
  q: PropTypes.object.isRequired,
  qIndex: PropTypes.number.isRequired,
  stepIdentifier: PropTypes.string.isRequired,
  selectedAnswer: PropTypes.number,
  onAnswerChange: PropTypes.func.isRequired,
};

// 🟢 CLEANED: QuizSection is now beautifully flat
const QuizSection = ({ quiz, quizAnswers, setQuizAnswers, stepIdentifier }) => {
  const handleAnswerChange = (qIndex, optIndex) => {
    setQuizAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  return (
    <div className="space-y-8">
      {quiz.map((q, qIndex) => (
        <QuizQuestion
          key={q._id || `quiz-q-${qIndex}`}
          q={q}
          qIndex={qIndex}
          stepIdentifier={stepIdentifier}
          selectedAnswer={quizAnswers[qIndex]}
          onAnswerChange={handleAnswerChange}
        />
      ))}
    </div>
  );
};

QuizSection.propTypes = {
  quiz: PropTypes.array.isRequired,
  quizAnswers: PropTypes.object.isRequired,
  setQuizAnswers: PropTypes.func.isRequired,
  stepIdentifier: PropTypes.string.isRequired,
};


// ==========================================
// MAIN COMPONENT
// ==========================================
const StudentStepDetail = () => {
  const { stepOrder } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const targetPathwayId = location.state?.pathwayId;

  const [pathway, setPathway] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  const [quizAnswers, setQuizAnswers] = useState({}); 
  const [quizScore, setQuizScore] = useState(null); 
  const [quizPassed, setQuizPassed] = useState(false);
  const [showQuizErrors, setShowQuizErrors] = useState(false);

  const [downloadingUrl, setDownloadingUrl] = useState(null);
  const [viewingUrl, setViewingUrl] = useState(null);

  const handleDownload = async (e, url, title, type) => {
    e.preventDefault();
    if (downloadingUrl === url) return; 
    
    setDownloadingUrl(url); 
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const blobUrl = globalThis.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      
      let fileName = (title || "Course_Material").replaceAll(/[^a-z0-9]/gi, "_");
      if ((type === "pdf" || type === "read") && !fileName.toLowerCase().endsWith(".pdf")) {
        fileName += ".pdf";
      }
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setTimeout(() => globalThis.URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error("Download failed:", err);
      globalThis.open(url, "_blank"); 
    } finally {
      setDownloadingUrl(null); 
    }
  };

  const handleView = async (e, url, type) => {
    e.preventDefault();
    if (viewingUrl === url) return; 

    setViewingUrl(url); 
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      
      let blob = await response.blob();

      if ((type === "pdf" || type === "read") && blob.type !== "application/pdf") {
        blob = new Blob([blob], { type: "application/pdf" });
      }

      const blobUrl = globalThis.URL.createObjectURL(blob);
      globalThis.open(blobUrl, "_blank"); 
      
      setTimeout(() => globalThis.URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      console.error("View failed:", err);
      globalThis.open(url, "_blank"); 
    } finally {
      setViewingUrl(null); 
    }
  };

  useEffect(() => {
    const fetchStepData = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`${API_BASE_URL}/pathway/my`, config);

        if (!data.hasPathway || !data.pathways?.length) {
          setError("No pathway found. Please enroll first.");
          setLoading(false);
          return;
        }

        let currentStudentPathway = targetPathwayId 
            ? data.pathways.find(p => p._id === targetPathwayId) 
            : data.pathways[0];

        if (!currentStudentPathway) currentStudentPathway = data.pathways[0];

        currentStudentPathway = await syncWithTemplate(currentStudentPathway, config);

        setPathway(currentStudentPathway);
        
        const step = currentStudentPathway.steps.find((s) => s.order === Number.parseInt(stepOrder, 10));

        if (!step) {
          setError("Step not found.");
        } else if (step.isUnlocked === false) {
          setError("This step is currently locked. Complete previous steps first!");
        } else {
          setCurrentStep(step);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load step details.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStepData();
  }, [stepOrder, targetPathwayId]);

  const handleCompleteAndContinue = async () => {
    try {
      setCompleting(true);
      const token = localStorage.getItem("edupath_token");

      await axios.post(
        `${API_BASE_URL}/pathway/complete-step`,
        { pathwayId: pathway._id, stepOrder: currentStep.order },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      navigate("/student/journey", { state: { pathwayId: pathway._id } });
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to mark as complete");
      setCompleting(false);
    }
  };

  if (loading) return <PageShell><div className="p-10 text-center font-bold text-slate-500">Loading Content...</div></PageShell>;

  if (error) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-50 text-red-600 rounded-2xl text-center">
          <p className="font-bold text-lg mb-4">{error}</p>
          <Link to="/student/journey" className="text-primary underline font-bold">Return to Map</Link>
        </div>
      </PageShell>
    );
  }

  const handleSubmitQuiz = () => {
    if (!currentStep.quiz || currentStep.quiz.length === 0) return;
    
    if (Object.keys(quizAnswers).length < currentStep.quiz.length) {
      setShowQuizErrors(true);
      return;
    }

    let correctCount = 0;
    currentStep.quiz.forEach((q, index) => {
      if (quizAnswers[index] === q.correctAnswerIndex) correctCount++;
    });

    const percentage = (correctCount / currentStep.quiz.length) * 100;
    setQuizScore(percentage);
    setShowQuizErrors(false);

    if (percentage >= 50) setQuizPassed(true);
  };

  const videos = currentStep.resources?.filter(r => r.type === "video") || [];
  const documents = currentStep.resources?.filter(r => r.type === "read" || r.type === "pdf") || [];
  const otherLinks = currentStep.resources?.filter(r => r.type !== "video" && r.type !== "read" && r.type !== "pdf") || [];

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto pb-12 space-y-6">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-black/5">
          <Link to="/student/journey" state={{ pathwayId: targetPathwayId }} className="text-primary font-bold hover:underline flex items-center gap-2">
            <span>←</span> Back to Map
          </Link>
          <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">
            Step {String(currentStep.order).padStart(2, "0")} of {pathway.steps.length}
          </div>
        </div>

        <div className="bg-white rounded-[28px] p-8 shadow-md border border-gray-100">
          <div className="mb-6">
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {currentStep.type || "Course"}
            </span>
            <h1 className="text-3xl font-bold text-slate-800 mt-4 mb-2">{currentStep.title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed">{currentStep.description}</p>
          </div>

          <hr className="border-gray-100 my-8" />

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Learning Materials</h3>
            {(!currentStep.resources || currentStep.resources.length === 0) ? (
              <p className="text-sm text-gray-500 italic bg-white p-4 rounded-xl border border-dashed border-slate-200 text-center">
                No external resources provided for this step.
              </p>
            ) : (
              <div className="space-y-6">
                <ResourceSection title="Video Resources" icon="▶" items={videos} themeClass="bg-violet-50 text-violet-500" hoverClass="hover:border-violet-300" />
                <ResourceSection title="Documents & Reading" icon="📑" items={documents} themeClass="bg-blue-50 text-blue-500" hoverClass="hover:border-blue-300" isDownloadable handleView={handleView} handleDownload={handleDownload} viewingUrl={viewingUrl} downloadingUrl={downloadingUrl} />
                <ResourceSection title="Other Links" icon="🌐" items={otherLinks} themeClass="bg-emerald-50 text-emerald-500" hoverClass="hover:border-emerald-300" />
              </div>
            )}
          </div>

          {currentStep.linkedCourses && currentStep.linkedCourses.length > 0 && (
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-8">
              <h3 className="text-lg font-bold text-blue-900 mb-2">Platform Courses</h3>
              <p className="text-sm text-blue-700/70 mb-4">Enroll in these official EduPath courses to master this step.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {currentStep.linkedCourses.map((course) => (
                  <LinkedCourseCard key={course.courseId} course={course} />
                ))}
              </div>
            </div>
          )}

          {currentStep.quiz && currentStep.quiz.length > 0 && !currentStep.isCompleted && (
            <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-slate-100 shadow-sm mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Step Assessment</h3>
              <p className="text-slate-500 text-sm mb-6">You must score at least 50% on this quiz to complete the step.</p>

              <QuizSection 
                quiz={currentStep.quiz} 
                quizAnswers={quizAnswers} 
                setQuizAnswers={setQuizAnswers} 
                stepIdentifier={currentStep._id || "quiz"} 
              />

              {showQuizErrors && <p className="text-red-500 font-bold text-sm mt-4 text-center">Please answer all questions before submitting!</p>}
              
              {quizScore !== null && (
                <div className={`mt-6 p-4 rounded-xl text-center font-bold ${quizPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  You scored {quizScore}%! {quizPassed ? 'Great job!' : 'You need 50% to pass. Please try again.'}
                </div>
              )}

              {!quizPassed && (
                <div className="mt-6 flex justify-center">
                  <button onClick={handleSubmitQuiz} className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-slate-700 transition-all active:scale-95">
                    Submit Quiz
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col items-center justify-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100 mt-10">
            {currentStep.isCompleted ? (
              <>
                <h3 className="text-emerald-800 font-bold mb-4">Step Completed</h3>
                <div className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-md flex items-center gap-2">
                  <span>⭐</span> Completed
                </div>
              </>
            ) : (
              <>
                {(!currentStep.quiz || currentStep.quiz.length === 0 || quizPassed) ? (
                  <>
                    <h3 className="text-emerald-800 font-bold mb-2">Ready to move on?</h3>
                    <p className="text-emerald-600 text-sm mb-6 text-center">Mark this step as complete to unlock the next part of your journey.</p>
                    <button onClick={handleCompleteAndContinue} disabled={completing} className="bg-primary text-white px-10 py-4 rounded-full font-black text-lg shadow-xl hover:brightness-95 hover:scale-105 transition-all active:scale-95 disabled:opacity-70">
                      {completing ? "SAVING..." : "MARK COMPLETE & CONTINUE"}
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-emerald-800 font-bold mb-2">Quiz Required</h3>
                    <p className="text-emerald-600 text-sm text-center opacity-70">Pass the quiz above to unlock the completion button.</p>
                    <button disabled className="mt-4 bg-slate-300 text-slate-500 px-10 py-4 rounded-full font-black text-lg cursor-not-allowed">
                      LOCKED
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default StudentStepDetail;
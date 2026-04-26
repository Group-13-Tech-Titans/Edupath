import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import PageShell from "../../components/PageShell.jsx"; 

// 🟢 HELPER: Strips MongoDB _id to accurately compare arrays
const cleanForSync = (arr) => (Array.isArray(arr) ? arr.map(({ _id, id, ...rest }) => rest) : []);

const StudentStepDetail = () => {
  const { stepOrder } = useParams(); 
  const navigate = useNavigate();

  const [pathway, setPathway] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  const [quizAnswers, setQuizAnswers] = useState({}); 
  const [quizScore, setQuizScore] = useState(null); 
  const [quizPassed, setQuizPassed] = useState(false);
  const [showQuizErrors, setShowQuizErrors] = useState(false);

  // 🟢 NEW: Track which specific file is processing to prevent spam clicks
  const [downloadingUrl, setDownloadingUrl] = useState(null);
  const [viewingUrl, setViewingUrl] = useState(null);

  // 🟢 UPGRADED DOWNLOAD HANDLER: Adds loading state and double-click protection
  const handleDownload = async (e, url, title, type) => {
    e.preventDefault();
    if (downloadingUrl === url) return; // Block double-clicks
    
    setDownloadingUrl(url); // Set loading state
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      
      let fileName = (title || "Course_Material").replace(/[^a-z0-9]/gi, "_");
      if ((type === "pdf" || type === "read") && !fileName.toLowerCase().endsWith(".pdf")) {
        fileName += ".pdf";
      }
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error("Download failed:", err);
      window.open(url, "_blank"); // Fallback
    } finally {
      setDownloadingUrl(null); // Remove loading state
    }
  };

  // 🟢 NEW VIEW HANDLER: Forces the browser to open extensionless files as PDFs
  const handleView = async (e, url, type) => {
    e.preventDefault();
    if (viewingUrl === url) return; // Block double-clicks

    setViewingUrl(url); // Set loading state
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      
      let blob = await response.blob();

      // Force the blob to be recognized as a PDF so the browser opens its viewer
      if ((type === "pdf" || type === "read") && blob.type !== "application/pdf") {
        blob = new Blob([blob], { type: "application/pdf" });
      }

      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank"); // Open in new tab
      
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      console.error("View failed:", err);
      window.open(url, "_blank"); // Fallback
    } finally {
      setViewingUrl(null); // Remove loading state
    }
  };

  useEffect(() => {
    fetchStepData();
  }, [stepOrder]);

  const fetchStepData = async () => {
    try {
      const token = localStorage.getItem("edupath_token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get("http://localhost:5000/api/pathway/my", config);

      if (data.hasPathway) {
        let currentStudentPathway = data.pathway;

        try {
          const { data: templateData } = await axios.get(`http://localhost:5000/api/pathway/published`, config);
          const pathwayTemplate = templateData.templates.find((t) => {
            if (currentStudentPathway.originalTemplateId) return t._id === currentStudentPathway.originalTemplateId;
            return t.pathName === currentStudentPathway.pathName && t.level === currentStudentPathway.level;
          });

          if (pathwayTemplate) {
            let hasUpdates = false;
            let syncedSteps = [...currentStudentPathway.steps];

            pathwayTemplate.steps.forEach((templateStep) => {
              const existingIndex = syncedSteps.findIndex((s) => s.order === templateStep.order);
              if (existingIndex !== -1) {
                const studentStep = syncedSteps[existingIndex];
                if (
                  studentStep.title !== templateStep.title ||
                  studentStep.description !== templateStep.description ||
                  JSON.stringify(cleanForSync(studentStep.resources)) !== JSON.stringify(cleanForSync(templateStep.resources)) ||
                  JSON.stringify(cleanForSync(studentStep.linkedCourses)) !== JSON.stringify(cleanForSync(templateStep.linkedCourses)) ||
                  JSON.stringify(cleanForSync(studentStep.quiz)) !== JSON.stringify(cleanForSync(templateStep.quiz))
                ) {
                  syncedSteps[existingIndex] = {
                    ...studentStep,
                    title: templateStep.title,
                    description: templateStep.description,
                    resources: templateStep.resources || [],
                    linkedCourses: templateStep.linkedCourses || [],
                    quiz: templateStep.quiz || [],
                  };
                  hasUpdates = true;
                }
              } else {
                const isFullyComplete = syncedSteps.every((s) => s.isCompleted);
                syncedSteps.push({
                  title: templateStep.title,
                  description: templateStep.description,
                  type: templateStep.type,
                  resources: templateStep.resources || [],
                  linkedCourses: templateStep.linkedCourses || [],
                  quiz: templateStep.quiz || [],
                  order: templateStep.order,
                  isCompleted: false,
                  isUnlocked: isFullyComplete && templateStep.order === syncedSteps.length + 1,
                });
                hasUpdates = true;
              }
            });

            if (hasUpdates) {
              syncedSteps.sort((a, b) => a.order - b.order);
              currentStudentPathway.steps = syncedSteps;
              axios.put(`http://localhost:5000/api/pathway/my/sync`, { steps: syncedSteps }, config).catch(console.error);
            }
          }
        } catch (syncErr) {
          console.error("Deep sync failed on step detail page", syncErr);
        }

        setPathway(currentStudentPathway);
        
        const step = currentStudentPathway.steps.find((s) => s.order === parseInt(stepOrder));

        if (!step) {
          setError("Step not found.");
        } else if (!step.isUnlocked) {
          setError("This step is currently locked. Complete previous steps first!");
        } else {
          setCurrentStep(step);
        }
      } else {
        setError("No pathway found. Please enroll first.");
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load step details.");
      setLoading(false);
    }
  };

  const handleCompleteAndContinue = async () => {
    try {
      setCompleting(true);
      const token = localStorage.getItem("edupath_token");

      await axios.post(
        "http://localhost:5000/api/pathway/complete-step",
        { pathwayId: pathway._id, stepOrder: currentStep.order },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      navigate("/student/journey");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to mark as complete");
      setCompleting(false);
    }
  };

  if (loading)
    return (
      <PageShell>
        <div className="p-10 text-center">Loading Content...</div>
      </PageShell>
    );

  if (error)
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-50 text-red-600 rounded-2xl text-center">
          <p className="font-bold text-lg mb-4">{error}</p>
          <Link to="/student/journey" className="text-primary underline font-bold">
            Return to Map
          </Link>
        </div>
      </PageShell>
    );

  const handleSubmitQuiz = () => {
    if (!currentStep.quiz || currentStep.quiz.length === 0) return;
    
    if (Object.keys(quizAnswers).length < currentStep.quiz.length) {
      setShowQuizErrors(true);
      return;
    }

    let correctCount = 0;
    currentStep.quiz.forEach((q, index) => {
      if (quizAnswers[index] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const percentage = (correctCount / currentStep.quiz.length) * 100;
    setQuizScore(percentage);
    setShowQuizErrors(false);

    if (percentage >= 50) {
      setQuizPassed(true);
    }
  };

  const videos = currentStep.resources?.filter(r => r.type === "video") || [];
  const documents = currentStep.resources?.filter(r => r.type === "read" || r.type === "pdf") || [];
  const otherLinks = currentStep.resources?.filter(r => r.type !== "video" && r.type !== "read" && r.type !== "pdf") || [];

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto pb-12 space-y-6">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-black/5">
          <Link to="/student/journey" className="text-primary font-bold hover:underline flex items-center gap-2">
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
            <h1 className="text-3xl font-bold text-slate-800 mt-4 mb-2">
              {currentStep.title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          <hr className="border-gray-100 my-8" />

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              Learning Materials
            </h3>

            {(!currentStep.resources || currentStep.resources.length === 0) ? (
              <p className="text-sm text-gray-500 italic bg-white p-4 rounded-xl border border-dashed border-slate-200 text-center">
                No external resources provided for this step.
              </p>
            ) : (
              <div className="space-y-6">
                
                {/* VIDEOS */}
                {videos.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span>🎬</span> Video Resources
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {videos.map((res, i) => (
                        <a key={`vid-${i}`} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-violet-300 transition-all group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center text-violet-500 shrink-0">▶</div>
                            <span className="font-bold text-sm text-slate-700 group-hover:text-violet-600 truncate">
                              {res.title || "Watch Video"}
                            </span>
                          </div>
                          <span className="text-gray-300 group-hover:text-violet-500 transition-colors ml-2 shrink-0">↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* DOCUMENTS & PDFS */}
                {documents.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span>📄</span> Documents & Reading
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {documents.map((res, i) => (
                        <div key={`doc-${i}`} className="flex flex-col bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">📑</div>
                            <span className="font-bold text-sm text-slate-700 group-hover:text-blue-600 line-clamp-2">
                              {res.title || "Read Document"}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-50">
                            {/* 🟢 UPGRADED: View Button with loading state & forced PDF MIME type */}
                            <button 
                              onClick={(e) => handleView(e, res.url, res.type)}
                              disabled={viewingUrl === res.url}
                              className="flex-1 text-center bg-slate-50 text-slate-600 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {viewingUrl === res.url ? "Opening..." : "View"}
                            </button>
                            
                            {/* 🟢 UPGRADED: Download Button with loading state & spam-click protection */}
                            <button 
                              onClick={(e) => handleDownload(e, res.url, res.title, res.type)} 
                              disabled={downloadingUrl === res.url}
                              className="flex-1 text-center bg-blue-50 text-blue-600 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {downloadingUrl === res.url ? "⏳ Downloading..." : "↓ Download"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* OTHER LINKS */}
                {otherLinks.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span>🔗</span> Other Links
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {otherLinks.map((res, i) => (
                        <a key={`oth-${i}`} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">🌐</div>
                            <span className="font-bold text-sm text-slate-700 group-hover:text-emerald-600 truncate">
                              {res.title || "External Link"}
                            </span>
                          </div>
                          <span className="text-gray-300 group-hover:text-emerald-500 transition-colors ml-2 shrink-0">↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* PLATFORM COURSES */}
          {currentStep.linkedCourses && currentStep.linkedCourses.length > 0 && (
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-8">
              <h3 className="text-lg font-bold text-blue-900 mb-2">Platform Courses</h3>
              <p className="text-sm text-blue-700/70 mb-4">Enroll in these official EduPath courses to master this step.</p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {currentStep.linkedCourses.map((course, i) => (
                  <Link
                    key={i}
                    to={`/student/courses/${course.courseId}`}
                    className="flex gap-4 bg-white border border-blue-100 p-3 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
                  >
                    <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-sm text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">{course.educatorName}</p>
                      <span className="text-xs font-bold text-blue-500 mt-2">View Course →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* QUIZ SECTION */}
          {currentStep.quiz && currentStep.quiz.length > 0 && !currentStep.isCompleted && (
            <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-slate-100 shadow-sm mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Step Assessment</h3>
              <p className="text-slate-500 text-sm mb-6">You must score at least 50% on this quiz to complete the step.</p>

              <div className="space-y-8">
                {currentStep.quiz.map((q, qIndex) => (
                  <div key={qIndex} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <p className="font-semibold text-slate-800 mb-4"><span className="text-primary mr-2">Q{qIndex + 1}.</span>{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => (
                        <label 
                          key={optIndex} 
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${quizAnswers[qIndex] === optIndex ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-slate-200 hover:border-primary/50'}`}
                        >
                          <input
                            type="radio"
                            name={`q-${qIndex}`}
                            value={optIndex}
                            checked={quizAnswers[qIndex] === optIndex}
                            onChange={() => setQuizAnswers(prev => ({ ...prev, [qIndex]: optIndex }))}
                            className="w-4 h-4 text-primary focus:ring-primary mr-3"
                          />
                          <span className="text-sm text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {showQuizErrors && (
                <p className="text-red-500 font-bold text-sm mt-4 text-center">Please answer all questions before submitting!</p>
              )}

              {quizScore !== null && (
                <div className={`mt-6 p-4 rounded-xl text-center font-bold ${quizPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  You scored {quizScore}%! {quizPassed ? 'Great job!' : 'You need 50% to pass. Please try again.'}
                </div>
              )}

              {!quizPassed && (
                <div className="mt-6 flex justify-center">
                  <button 
                    onClick={handleSubmitQuiz}
                    className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-slate-700 transition-all active:scale-95"
                  >
                    Submit Quiz
                  </button>
                </div>
              )}
            </div>
          )}

          {/* COMPLETION ACTION */}
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
                    <button 
                      onClick={handleCompleteAndContinue}
                      disabled={completing}
                      className="bg-primary text-white px-10 py-4 rounded-full font-black text-lg shadow-xl hover:brightness-95 hover:scale-105 transition-all active:scale-95 disabled:opacity-70"
                    >
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
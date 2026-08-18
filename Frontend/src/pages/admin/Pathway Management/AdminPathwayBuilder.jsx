import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Plus, Trash2, ArrowRight, ArrowLeft, Settings, AlignLeft, BookOpen, Layout } from "lucide-react";
import PageShell from "../../../components/PageShell.jsx"; // Adjust path as needed
import AiPathwayGenerator from "./components/AiPathwayGenerator.jsx";
import CourseSelectionPage from "../../../components/CourseSelectionPage.jsx";

// Helper to generate a unique ID for React keys
const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2);

const AdminPathwayBuilder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [activeCourseSelector, setActiveCourseSelector] = useState({ isActive: false, stepIndex: null });

  // Pathway Template State
  const [pathway, setPathway] = useState({
    pathName: "",
    specialization: "",
    level: "Beginner",
  });
  
  const [specializationsList, setSpecializationsList] = useState([]);

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        const { data } = await axios.get(import.meta.env.VITE_API_URL + "/api/specializations", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSpecializationsList(data.specializations || []);
      } catch (err) {
        console.error("Error fetching specializations", err);
      }
    };
    fetchSpecializations();
  }, []);

  // Steps State - added a unique 'id' for React keys
  const [steps, setSteps] = useState([
    {
      id: generateId(),
      title: "",
      description: "",
      type: "course",
      resources: [],
      linkedCourses: [],
    },
  ]);

  const handlePathwayChange = (e) => {
    setPathway({ ...pathway, [e.target.name]: e.target.value });
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        id: generateId(),
        title: "",
        description: "",
        type: "course",
        resources: [],
        linkedCourses: [],
        quiz: [],
      },
    ]);
  };

  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  // 🤖 AI Integration Handler
  const handleTopicsGenerated = (topics) => {
    // Generate new steps from topics
    const aiSteps = topics.map(topic => ({
      id: generateId(),
      title: topic,
      description: `Learn the fundamentals of ${topic.split(':').pop().trim()}`,
      type: "course",
      resources: [],
      linkedCourses: [],
      quiz: [],
    }));

    // If the current first step is completely empty, replace it. Otherwise append.
    if (steps.length === 1 && steps[0].title === "" && steps[0].description === "") {
      setSteps(aiSteps);
    } else {
      setSteps([...steps, ...aiSteps]);
    }
  };

  // 🟢 NEW HELPER FUNCTIONS FOR MULTIPLE RESOURCES
  const addResourceToStep = (stepIndex) => {
    const newSteps = [...steps];
    if (!newSteps[stepIndex].resources) newSteps[stepIndex].resources = [];
    // 🟢 Added type: "video" below
    newSteps[stepIndex].resources.push({ title: "", url: "", type: "video" });
    setSteps(newSteps);
  };

  const handleResourceChange = (stepIndex, resIndex, field, value) => {
    const newSteps = [...steps];
    newSteps[stepIndex].resources[resIndex][field] = value;
    setSteps(newSteps);
  };

  const removeResourceFromStep = (stepIndex, resIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].resources.splice(resIndex, 1);
    setSteps(newSteps);
  };

  const addQuizQuestion = (stepIndex) => {
    const newSteps = [...steps];
    if (!newSteps[stepIndex].quiz) newSteps[stepIndex].quiz = [];
    newSteps[stepIndex].quiz.push({ question: "", options: ["", "", "", ""], correctAnswerIndex: 0 });
    setSteps(newSteps);
  };

  const handleQuizChange = (stepIndex, qIndex, field, value) => {
    const newSteps = [...steps];
    newSteps[stepIndex].quiz[qIndex][field] = value;
    setSteps(newSteps);
  };

  const handleQuizOptionChange = (stepIndex, qIndex, optIndex, value) => {
    const newSteps = [...steps];
    newSteps[stepIndex].quiz[qIndex].options[optIndex] = value;
    setSteps(newSteps);
  };

  const removeQuizQuestion = (stepIndex, qIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].quiz.splice(qIndex, 1);
    setSteps(newSteps);
  };

  const openCourseSelector = (stepIndex) => setActiveCourseSelector({ isActive: true, stepIndex });

  const handleAttachCourse = (course) => {
    const newSteps = [...steps];
    const stepIdx = activeCourseSelector.stepIndex;

    if (!newSteps[stepIdx].linkedCourses)
      newSteps[stepIdx].linkedCourses = [];
    const courseId = course._id || course.id;
    
    if (!newSteps[stepIdx].linkedCourses.some((c) => c.courseId === courseId)) {
      newSteps[stepIdx].linkedCourses.push({
        id: generateId(),
        courseId: courseId,
        title: course.title,
        thumbnail: course.thumbnailUrl || course.thumbnail || "https://placehold.co/600x400?text=Course",
        educatorName: course.educatorName || course.createdByEducatorEmail || "EduPath Educator",
      });
    }

    setSteps(newSteps);
    setActiveCourseSelector({ isActive: false, stepIndex: null });
  };

  const removeLinkedCourse = (stepIndex, courseIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].linkedCourses.splice(courseIndex, 1);
    setSteps(newSteps);
  };

  const handleSavePathway = async () => {
    // 1. FRONTEND VALIDATION
    setError(""); // Clear any previous errors

    if (!pathway.pathName.trim()) {
      setError("Please enter a Pathway Name.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!pathway.specialization) {
      setError("Please select a Specialization.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (steps.length === 0) {
      setError("You must add at least one step to the curriculum.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Check each step for missing required fields
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step.title.trim() || !step.description.trim()) {
        setError(
          `Please fill out both the Title and Description for Step ${i + 1}.`,
        );
        window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll up so they see the error
        return;
      }
    }

    // 2. BACKEND SUBMISSION
    try {
      setLoading(true);

      const token = localStorage.getItem("edupath_token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Create the Template Pathway
      const { data: pathwayData } = await axios.post(
        import.meta.env.VITE_API_URL + "/api/pathway/template",
        pathway,
        config,
      );

      const templateId = pathwayData.template._id;

      // Add all steps sequentially
      let orderCounter = 1;
      for (const step of steps) {
        // Strip out the frontend-only 'id' before sending to the backend
        const { id, ...stepData } = step;

        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/pathway/template/${templateId}/steps`,
          { ...stepData, order: orderCounter },
          config,
        );
        orderCounter++;
      }

      setLoading(false);
      setShowSuccessPopup(true);
      setTimeout(() => {
        navigate("/admin/pathways");
      }, 2500);
    } catch (err) {
      setLoading(false);
      console.error(err);
      setError(err?.response?.data?.message || "Failed to save pathway");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (activeCourseSelector.isActive) {
    return (
      <PageShell>
        <CourseSelectionPage
          onClose={() => setActiveCourseSelector({ isActive: false, stepIndex: null })}
          onSelect={handleAttachCourse}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Success Popup Overlay */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center justify-center bg-white rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-500 max-w-sm mx-4 text-center border border-primary/20">
            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 animate-in spin-in-[180deg] duration-700 delay-100" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Pathway Created!</h2>
            <p className="text-sm text-slate-500">Your new curriculum template has been successfully saved and published.</p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl space-y-8 pb-12 pt-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate("/admin/pathways")} 
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors -mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Pathways
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 border-b border-primary/10 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
            <Layout className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Pathway Builder
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Create a new Master Course template and define its learning steps.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {/* Pathway Details Section */}
        <div className="rounded-[32px] border border-primary/10 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Settings className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              1. Pathway Details
            </h2>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              {/* Fix: Added htmlFor and id */}
              <label
                htmlFor="pathName"
                className="mb-1.5 block text-sm font-bold text-slate-700"
              >
                Pathway Name
              </label>
              <input
                id="pathName"
                type="text"
                name="pathName"
                value={pathway.pathName}
                onChange={handlePathwayChange}
                placeholder="e.g., Intro to React"
                className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary transition-all shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="specialization"
                className="mb-1.5 block text-sm font-bold text-slate-700"
              >
                Specialization
              </label>
              <select
                id="specialization"
                name="specialization"
                value={pathway.specialization}
                onChange={handlePathwayChange}
                className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary transition-all shadow-sm cursor-pointer"
              >
                <option value="">-- Select Specialization --</option>
                {specializationsList.map((spec) => (
                  <option key={spec._id} value={spec.name}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="level"
                className="mb-1.5 block text-sm font-bold text-slate-700"
              >
                Level
              </label>
              <select
                id="level"
                name="level"
                value={pathway.level}
                onChange={handlePathwayChange}
                className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary transition-all shadow-sm cursor-pointer"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- NEW AI GENERATOR SECTION --- */}
        <AiPathwayGenerator 
          pathName={pathway.pathName} 
          level={pathway.level} 
          onTopicsGenerated={handleTopicsGenerated}
        />

        {/* --- CURRICULUM STEPS --- */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pl-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              2. Curriculum Steps
            </h2>
          </div>

          {steps.map((step, index) => (
            <div
              key={step.id} // Fix: Using unique step.id instead of array index
              className="relative rounded-[32px] border border-primary/10 bg-white p-8 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-6 flex items-center justify-between border-b border-primary/5 pb-4">
                <span className="flex items-center gap-2 text-lg font-bold text-slate-800">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs text-primary">
                    {index + 1}
                  </span>
                  Step {index + 1}
                </span>
                {steps.length > 1 && (
                  <button
                    onClick={() => removeStep(index)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline"
                  >
                    Remove Step
                  </button>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor={`step-title-${step.id}`}
                    className="mb-1.5 block text-sm font-bold text-slate-700"
                  >
                    Step Title
                  </label>
                  <input
                    id={`step-title-${step.id}`}
                    type="text"
                    value={step.title}
                    onChange={(e) =>
                      handleStepChange(index, "title", e.target.value)
                    }
                    placeholder="e.g., Introduction to React"
                    className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary transition-all shadow-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor={`step-desc-${step.id}`}
                    className="mb-1.5 block text-sm font-bold text-slate-700"
                  >
                    Description
                  </label>
                  <textarea
                    id={`step-desc-${step.id}`}
                    rows={2}
                    value={step.description}
                    onChange={(e) =>
                      handleStepChange(index, "description", e.target.value)
                    }
                    className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary transition-all shadow-sm"
                  />
                </div>

                {/* 🟢 NEW: Multiple Resources UI */}
                <div className="sm:col-span-2 pt-2 border-t border-black/5 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-text-dark uppercase tracking-wider">
                      Learning Materials
                    </label>
                    <button
                      type="button"
                      onClick={() => addResourceToStep(index)}
                      className="text-[10px] font-bold bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                    >
                      + ADD LINK
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(step.resources || []).map((res, resIndex) => (
                      <div
                        key={resIndex}
                        className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100"
                      >
                        {/* 🟢 NEW: Content Type Selector for this specific link */}
                        <select
                          value={res.type || "video"}
                          onChange={(e) =>
                            handleResourceChange(
                              index,
                              resIndex,
                              "type",
                              e.target.value,
                            )
                          }
                          className="w-full sm:w-auto rounded-md border border-black/10 px-2 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                        >
                          <option value="video">🎥 Video</option>
                          <option value="read">📖 Reading / PDF</option>
                          <option value="project">💻 Project</option>
                          <option value="quiz">📝 Quiz</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Link Title (e.g. Watch Video)"
                          value={res.title}
                          onChange={(e) =>
                            handleResourceChange(
                              index,
                              resIndex,
                              "title",
                              e.target.value,
                            )
                          }
                          className="flex-1 min-w-[120px] rounded-md border border-black/10 px-3 py-1.5 text-xs outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          placeholder="https://..."
                          value={res.url}
                          onChange={(e) =>
                            handleResourceChange(
                              index,
                              resIndex,
                              "url",
                              e.target.value,
                            )
                          }
                          className="flex-1 min-w-[120px] rounded-md border border-black/10 px-3 py-1.5 text-xs outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeResourceFromStep(index, resIndex)
                          }
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors font-bold"
                          title="Remove link"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(!step.resources || step.resources.length === 0) && (
                      <p className="text-xs text-muted italic">
                        No materials added yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* 🟢 NEW: PLATFORM COURSES */}
                <div className="sm:col-span-2 pt-4 border-t border-black/10 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="block text-xs font-bold text-text-dark uppercase tracking-wider">Platform Courses</span>
                    <button onClick={() => openCourseSelector(index)} type="button" className="text-[10px] font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">+ ADD COURSE</button>
                  </div>

                  <div className="space-y-2">
                    {(step.linkedCourses || []).map((c, cIndex) => (
                      <div key={c.id} className="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                            <img src={c.thumbnail} alt="thumb" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{c.title}</p>
                            <p className="text-xs text-slate-500">{c.educatorName}</p>
                          </div>
                        </div>
                        <button onClick={() => removeLinkedCourse(index, cIndex)} type="button" className="text-red-400 hover:bg-red-50 p-2 rounded-lg font-bold transition-colors">✕</button>
                      </div>
                    ))}
                    {(!step.linkedCourses || step.linkedCourses.length === 0) && <p className="text-xs text-muted italic">No internal courses linked yet.</p>}
                  </div>
                </div>
                {/* 🟢 NEW: QUIZ SECTION */}
                  <div className="sm:col-span-2 pt-4 border-t border-black/10 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-bold text-text-dark uppercase tracking-wider">Step Assessment (Quiz)</label>
                      <button
                        type="button"
                        onClick={() => addQuizQuestion(index)}
                        className="flex items-center gap-1.5 text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-200 transition-colors shadow-sm"
                      >
                        <Plus className="h-3 w-3" /> ADD QUESTION
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(step.quiz || []).map((q, qIndex) => (
                        <div key={qIndex} className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-100/60 relative shadow-sm">
                          <button
                            type="button"
                            onClick={() => removeQuizQuestion(index, qIndex)}
                            className="absolute top-3 right-3 text-red-400 hover:bg-red-100 hover:text-red-600 p-2 rounded-xl font-bold text-xs transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          
                          <label className="text-xs font-semibold text-emerald-800 mb-1 block">Question {qIndex + 1}</label>
                          <input
                            type="text"
                            placeholder="Enter question here..."
                            value={q.question}
                            onChange={(e) => handleQuizChange(index, qIndex, "question", e.target.value)}
                            className="w-full mb-3 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-ans-${step.id}-${qIndex}`}
                                  checked={q.correctAnswerIndex === optIndex}
                                  onChange={() => handleQuizChange(index, qIndex, "correctAnswerIndex", optIndex)}
                                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                  title="Mark as correct answer"
                                />
                                <input
                                  type="text"
                                  placeholder={`Option ${optIndex + 1}`}
                                  value={opt}
                                  onChange={(e) => handleQuizOptionChange(index, qIndex, optIndex, e.target.value)}
                                  className={`flex-1 rounded-md border px-3 py-1.5 text-xs outline-none focus:border-emerald-500 ${q.correctAnswerIndex === optIndex ? 'border-emerald-400 bg-emerald-50/50' : 'border-black/10'}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {(!step.quiz || step.quiz.length === 0) && (
                        <p className="text-xs text-muted italic">No assessment added. Step will be completable without a quiz.</p>
                      )}
                    </div>
                  </div>
              </div>
            </div>
          ))}

          <button
            onClick={addStep}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[28px] border-2 border-dashed border-primary/30 bg-primary/5 py-5 text-sm font-bold text-primary hover:bg-primary/10 hover:border-primary/50 transition-all active:scale-[0.99]"
          >
            <Plus className="h-5 w-5" /> Add Another Step
          </button>
        </div>

        {/* Save Actions */}
        <div className="flex justify-end pt-8 pb-10">
          <button
            onClick={handleSavePathway}
            disabled={loading}
            className="flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:brightness-110 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none"
          >
            {loading ? "Publishing Template..." : "Publish Template"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </PageShell>
  );
};

export default AdminPathwayBuilder;

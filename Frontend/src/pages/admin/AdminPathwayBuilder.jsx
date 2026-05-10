import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";

// --- CONFIGURATION CONSTANTS ---
const API_BASE_URL = "http://localhost:5000/api";
const PATHWAY_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const VISIBLE_COURSE_STATUSES = new Set(["approve", "approved", "published", "pending"]);
const RESOURCE_TYPES = {
  VIDEO: "video",
  PDF: "pdf",
  LINK: "link"
};

// Generates a pseudo-random unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

// --- SUB-COMPONENT ---
const CourseSelectionPage = ({ onClose, onSelect }) => {
  const [dbCourses, setDbCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`${API_BASE_URL}/courses`, config);
        
        setDbCourses(data.courses || data || []);
      } catch (err) {
        console.error("Failed to fetch courses for selector:", err);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchAllCourses();
  }, []);

  const filteredCourses = dbCourses.filter((course) => {
    const status = (course.status || "").toLowerCase();
    const isVisible = VISIBLE_COURSE_STATUSES.has(status);
    const matchesSearch = (course.title || "").toLowerCase().includes(search.toLowerCase());
    return isVisible && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-80px)] bg-emerald-50/50 px-4 py-8 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl shadow-sm border border-emerald-100/50">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Select a Platform Course</h1>
            <p className="text-slate-500 text-sm mt-1">Browse and attach existing EduPath courses to your pathway step.</p>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-100 text-slate-600 px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition active:scale-95"
          >
            ← Back to Builder
          </button>
        </div>

        <div className="mb-8">
            <label htmlFor="courseSearch" className="sr-only">Search Courses</label>
            <input
                id="courseSearch"
                type="text"
                placeholder="Search by course title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-emerald-100 p-4 rounded-2xl shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-lg"
            />
        </div>

        {isLoadingCourses ? (
          <div className="text-center py-10 text-slate-500 font-bold">Fetching courses from database...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length === 0 ? (
              <p className="col-span-full text-center text-slate-500 py-10 italic">No courses found matching your search.</p>
            ) : (
              filteredCourses.map((course) => (
                <div
                  key={course.id || course._id}
                  className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={course.thumbnailUrl || course.thumbnail || "https://placehold.co/600x400?text=No+Image"}
                    alt="course"
                    className="w-full h-48 object-cover bg-slate-100"
                  />
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-2 mb-2">{course.title}</h3>
                    <p className="text-sm text-slate-500 mb-6">{course.educatorName}</p>

                    <div className="mt-auto flex items-center justify-between">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${course.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {course.status ? course.status.toUpperCase() : "ALL LEVELS"}
                      </span>
                      <button
                        onClick={() => onSelect(course)}
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors active:scale-95"
                      >
                        + Select Course
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

CourseSelectionPage.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
};

// --- MAIN COMPONENT ---
const AdminPathwayBuilder = () => {
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadingFile, setUploadingFile] = useState(null);

  const [specializations, setSpecializations] = useState([]);
  const [isFetchingSpecs, setIsFetchingSpecs] = useState(true);
  const [activeCourseSelector, setActiveCourseSelector] = useState({ isActive: false, stepIndex: null });

  const [pathway, setPathway] = useState({
    pathName: "",
    level: PATHWAY_LEVELS[0], 
  });

  const [steps, setSteps] = useState([
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

  useEffect(() => {
    const fetchSpecializations = async () => {
      setIsFetchingSpecs(true);
      try {
        const token = localStorage.getItem("edupath_token");
        const { data } = await axios.get(`${API_BASE_URL}/specializations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const specs = data.specializations || [];
        setSpecializations(specs);
        
        if (specs.length > 0) {
          setPathway(prev => ({ ...prev, pathName: specs[0].name }));
        }
      } catch (err) {
        console.error("Failed to load specializations", err);
        setError("Failed to load specializations from the server.");
      } finally {
        setIsFetchingSpecs(false);
      }
    };
    fetchSpecializations();
  }, []);

  // --- STATE HANDLERS ---
  const handlePathwayChange = (e) => setPathway({ ...pathway, [e.target.name]: e.target.value });
  
  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, { id: generateId(), title: "", description: "", type: "course", resources: [], linkedCourses: [], quiz: [] }]);
  };

  const removeStep = (index) => setSteps(steps.filter((_, i) => i !== index));

  const addResourceToStep = (stepIndex) => {
    const newSteps = [...steps];
    if (!newSteps[stepIndex].resources) newSteps[stepIndex].resources = [];
    newSteps[stepIndex].resources.push({ id: generateId(), title: "", url: "", type: RESOURCE_TYPES.VIDEO });
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

  const handleFileUpload = async (event, stepIndex, resIndex) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingFile({ stepIndex, resIndex });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("contentType", "Document");
    formData.append("itemName", file.name);

    try {
      const token = localStorage.getItem("edupath_token");
      const res = await axios.post(`${API_BASE_URL}/upload/content`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const newSteps = [...steps];
        newSteps[stepIndex].resources[resIndex].url = res.data.item.url;
        if (!newSteps[stepIndex].resources[resIndex].title) newSteps[stepIndex].resources[resIndex].title = file.name;
        if (file.name.toLowerCase().endsWith(".pdf")) newSteps[stepIndex].resources[resIndex].type = RESOURCE_TYPES.PDF;
        
        setSteps(newSteps);
        setError(""); 
      }
    } catch (err) {
      setError(`Upload failed: ${err.response?.data?.message || err.message}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setUploadingFile(null);
      event.target.value = null; 
    }
  };

  // --- QUIZ & COURSE HANDLERS ---
  const addQuizQuestion = (stepIndex) => {
    const newSteps = [...steps];
    if (!newSteps[stepIndex].quiz) newSteps[stepIndex].quiz = [];
    newSteps[stepIndex].quiz.push({
      id: generateId(), 
      question: "",
      options: [{ id: generateId(), text: "" }, { id: generateId(), text: "" }, { id: generateId(), text: "" }, { id: generateId(), text: "" }],
      correctAnswerIndex: 0,
    });
    setSteps(newSteps);
  };

  const handleQuizChange = (stepIndex, qIndex, field, value) => {
    const newSteps = [...steps];
    newSteps[stepIndex].quiz[qIndex][field] = value;
    setSteps(newSteps);
  };

  const handleQuizOptionChange = (stepIndex, qIndex, optIndex, value) => {
    const newSteps = [...steps];
    newSteps[stepIndex].quiz[qIndex].options[optIndex].text = value;
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

    if (!newSteps[stepIdx].linkedCourses) newSteps[stepIdx].linkedCourses = [];
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

  // --- VALIDATION HELPERS (Resolves S3776 Cognitive Complexity) ---
  const validateResource = (res, stepIndex, resIndex) => {
    if (!res.title.trim()) return `Please provide a Title for Learning Material #${resIndex + 1} in Step ${stepIndex + 1}.`;
    
    if (!res.url.trim()) {
      return res.type === RESOURCE_TYPES.PDF 
        ? `Please upload the PDF document for "${res.title}" in Step ${stepIndex + 1}.`
        : `Please paste a URL for "${res.title}" in Step ${stepIndex + 1}.`;
    }

    if (!/^(https?:\/\/)/i.test(res.url.trim())) {
      return `The URL for "${res.title}" in Step ${stepIndex + 1} is invalid. It must start with http:// or https://`;
    }
    return null;
  };

  const validateStep = (step, index) => {
    if (!step.title.trim() || !step.description.trim()) {
      return `Please fill out both the Title and Description for Step ${index + 1}.`;
    }
    const resources = step.resources || [];
    for (let j = 0; j < resources.length; j++) {
      const err = validateResource(resources[j], index, j);
      if (err) return err;
    }
    return null;
  };

  const validatePathwayPayload = () => {
    if (!pathway.pathName.trim()) return "Please select a Pathway Name.";
    if (steps.length === 0) return "You must add at least one step to the curriculum.";

    for (let i = 0; i < steps.length; i++) {
      const err = validateStep(steps[i], i);
      if (err) return err;
    }
    return null;
  };

  // --- SUBMISSION ---
  const handleSavePathway = async () => {
    setError("");

    const validationError = validatePathwayPayload();
    if (validationError) {
        setError(validationError);
        window.scrollTo({ top: 0, behavior: "smooth" }); 
        return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("edupath_token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data: pathwayData } = await axios.post(`${API_BASE_URL}/pathway/template`, pathway, config);
      const templateId = pathwayData.template._id;

      let orderCounter = 1;
      for (const step of steps) {
        const formattedQuiz = (step.quiz || []).map(q => ({
            ...q,
            options: q.options.map(opt => opt.text)
        }));

        const stepData = {
            title: step.title,
            description: step.description,
            type: step.type,
            resources: step.resources,
            linkedCourses: step.linkedCourses,
            quiz: formattedQuiz,
        };

        await axios.post(`${API_BASE_URL}/pathway/template/${templateId}/steps`, { ...stepData, order: orderCounter }, config);
        orderCounter++;
      }

      setIsSubmitting(false);
      navigate("/admin/pathways");
    } catch (err) {
      setIsSubmitting(false);
      setError(err?.response?.data?.message || "Failed to save pathway");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // --- RENDER HELPERS (Resolves S3358 and S2004) ---
  const renderSpecializationOptions = () => {
    if (isFetchingSpecs) return <option value="" disabled>⏳ Loading specializations...</option>;
    if (specializations.length === 0) return <option value="" disabled>❌ No specializations found</option>;
    return specializations.map((spec) => (
      <option key={spec._id} value={spec.name}>{spec.name}</option>
    ));
  };

  const renderQuizOptions = (q, qIndex, stepIndex, stepIdentifier) => {
    return q.options.map((opt, optIndex) => (
      <div key={opt.id} className="flex items-center gap-2">
        <label htmlFor={`quiz-opt-radio-${opt.id}`} className="sr-only">Set Correct Answer</label>
        <input 
          id={`quiz-opt-radio-${opt.id}`}
          type="radio" 
          name={`correct-ans-${stepIdentifier}-${q.id}`} 
          checked={q.correctAnswerIndex === optIndex} 
          onChange={() => handleQuizChange(stepIndex, qIndex, "correctAnswerIndex", optIndex)} 
          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
        />
        <label htmlFor={`quiz-opt-text-${opt.id}`} className="sr-only">Option Text</label>
        <input 
          id={`quiz-opt-text-${opt.id}`}
          type="text" 
          placeholder={`Option ${optIndex + 1}`} 
          value={opt.text} 
          onChange={(e) => handleQuizOptionChange(stepIndex, qIndex, optIndex, e.target.value)} 
          className={`flex-1 rounded-md border px-3 py-1.5 text-xs outline-none focus:border-emerald-500 bg-white ${q.correctAnswerIndex === optIndex ? "border-emerald-400 bg-emerald-50/50" : "border-black/10"}`} 
        />
      </div>
    ));
  };

  // Render Returns
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
      <div className="mx-auto max-w-4xl space-y-6 pb-12">
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-semibold text-text-dark">Pathway Builder</h1>
          <p className="mt-1 text-sm text-muted">Create a new Master Course template and define its learning steps.</p>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-text-dark mb-4">1. Pathway Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pathNameSelect" className="mb-1 block text-sm font-medium text-text-dark">
                Pathway Name (Specialization)
              </label>
              <select
                id="pathNameSelect"
                name="pathName"
                value={pathway.pathName}
                onChange={handlePathwayChange}
                disabled={isFetchingSpecs}
                className={`w-full rounded-xl border border-black/10 bg-white/50 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary ${isFetchingSpecs ? "opacity-60 cursor-wait text-slate-500 font-bold" : ""}`}
              >
                {renderSpecializationOptions()}
              </select>
            </div>

            <div>
              <label htmlFor="level" className="mb-1 block text-sm font-medium text-text-dark">
                Level
              </label>
              <select
                id="level"
                name="level"
                value={pathway.level}
                onChange={handlePathwayChange}
                className="w-full rounded-xl border border-black/10 bg-white/50 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {PATHWAY_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-dark pl-2">2. Curriculum Steps</h2>

          {steps.map((step, index) => {
            const stepIdentifier = step.id;

            return (
              <div key={stepIdentifier} className="relative rounded-[22px] border border-black/5 bg-white/80 p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-black/5 pb-3">
                  <span className="font-semibold text-primary">Step {index + 1}</span>
                  {steps.length > 1 && (
                    <button
                      onClick={() => removeStep(index)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline"
                    >
                      Remove Step
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor={`step-title-${stepIdentifier}`} className="mb-1 block text-xs font-medium text-text-dark">Step Title</label>
                    <input
                      id={`step-title-${stepIdentifier}`}
                      type="text"
                      value={step.title}
                      onChange={(e) => handleStepChange(index, "title", e.target.value)}
                      placeholder="e.g., Introduction to React"
                      className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor={`step-desc-${stepIdentifier}`} className="mb-1 block text-xs font-medium text-text-dark">Description</label>
                    <textarea
                      id={`step-desc-${stepIdentifier}`} 
                      rows={2}
                      value={step.description}
                      onChange={(e) => handleStepChange(index, "description", e.target.value)}
                      className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2 border-t border-black/5 mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="block text-xs font-bold text-text-dark uppercase tracking-wider">Learning Materials</span>
                      <button
                        type="button"
                        onClick={() => addResourceToStep(index)}
                        className="text-[10px] font-bold bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                      >
                        + ADD LINK / FILE
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(step.resources || []).map((res, resIndex) => {
                        const isUploading = uploadingFile?.stepIndex === index && uploadingFile?.resIndex === resIndex;
                        const resourceId = res.id; 

                        return (
                          <div key={resourceId} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            
                            <label htmlFor={`res-type-${resourceId}`} className="sr-only">Resource Type</label>
                            <select
                              id={`res-type-${resourceId}`} 
                              value={res.type || RESOURCE_TYPES.VIDEO}
                              onChange={(e) => handleResourceChange(index, resIndex, "type", e.target.value)}
                              className="w-full sm:w-auto rounded-md border border-black/10 px-2 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                            >
                              <option value={RESOURCE_TYPES.VIDEO}>🎥 Video</option>
                              <option value={RESOURCE_TYPES.PDF}>📄 PDF Document</option>
                              <option value={RESOURCE_TYPES.LINK}>🔗 External Link</option>
                            </select>

                            <label htmlFor={`res-title-${resourceId}`} className="sr-only">Resource Title</label>
                            <input
                              id={`res-title-${resourceId}`} 
                              type="text"
                              placeholder="Link Title (e.g. Read PDF)"
                              value={res.title}
                              onChange={(e) => handleResourceChange(index, resIndex, "title", e.target.value)}
                              className="flex-1 min-w-[120px] rounded-md border border-black/10 px-3 py-1.5 text-xs outline-none focus:border-primary"
                            />

                            <div className="flex-1 min-w-[160px] flex items-center gap-1">
                              {res.type === RESOURCE_TYPES.PDF ? (
                                <>
                                  <label htmlFor={`res-url-pdf-${resourceId}`} className="sr-only">PDF URL</label>
                                  <input
                                    id={`res-url-pdf-${resourceId}`}
                                    type="text"
                                    placeholder="Upload a PDF file →"
                                    value={res.url}
                                    readOnly 
                                    className="w-full rounded-md border border-black/10 px-3 py-1.5 text-xs outline-none bg-slate-50 text-slate-500 cursor-not-allowed"
                                  />
                                  <label className={`shrink-0 cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
                                    {isUploading ? "⏳ Uploading..." : "⬆️ Upload PDF"}
                                    <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, index, resIndex)} />
                                  </label>
                                </>
                              ) : (
                                <>
                                  <label htmlFor={`res-url-link-${resourceId}`} className="sr-only">External URL</label>
                                  <input
                                    id={`res-url-link-${resourceId}`}
                                    type="text"
                                    placeholder="Paste URL here (https://...)"
                                    value={res.url}
                                    onChange={(e) => handleResourceChange(index, resIndex, "url", e.target.value)}
                                    className="w-full rounded-md border border-black/10 px-3 py-1.5 text-xs outline-none focus:border-primary bg-white"
                                  />
                                </>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeResourceFromStep(index, resIndex)}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors font-bold shrink-0"
                              title="Remove link"
                            >✕</button>
                          </div>
                        );
                      })}
                      {(!step.resources || step.resources.length === 0) && <p className="text-xs text-muted italic">No materials added yet.</p>}
                    </div>
                  </div>

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

                  <div className="sm:col-span-2 pt-4 border-t border-black/10 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="block text-xs font-bold text-text-dark uppercase tracking-wider">Step Assessment (Quiz)</span>
                      <button type="button" onClick={() => addQuizQuestion(index)} className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-200 transition-colors">+ ADD QUESTION</button>
                    </div>

                    <div className="space-y-4">
                      {(step.quiz || []).map((q, qIndex) => (
                        <div key={q.id} className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 relative">
                          <button type="button" onClick={() => removeQuizQuestion(index, qIndex)} className="absolute top-2 right-2 text-red-400 hover:bg-red-50 p-1.5 rounded-md font-bold text-xs">✕ Remove</button>
                          
                          <label htmlFor={`quiz-q-${q.id}`} className="text-xs font-semibold text-emerald-800 mb-1 block">Question {qIndex + 1}</label>
                          <input 
                            id={`quiz-q-${q.id}`}
                            type="text" 
                            placeholder="Enter question here..." 
                            value={q.question} 
                            onChange={(e) => handleQuizChange(index, qIndex, "question", e.target.value)} 
                            className="w-full mb-3 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white" 
                          />
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {renderQuizOptions(q, qIndex, index, stepIdentifier)}
                          </div>
                        </div>
                      ))}
                      {(!step.quiz || step.quiz.length === 0) && <p className="text-xs text-muted italic">No assessment added.</p>}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}

          <button
            onClick={addStep}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-primary/40 bg-primary/5 py-4 text-sm font-semibold text-primary hover:bg-primary/10 hover:border-primary/60 transition-colors"
          >
            <span>+</span> Add Another Step
          </button>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSavePathway}
            disabled={isSubmitting}
            className="rounded-full bg-primary px-8 py-3 font-semibold text-white shadow-md hover:brightness-95 disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Publish Template"}
          </button>
        </div>
      </div>
    </PageShell>
  );
};

export default AdminPathwayBuilder;
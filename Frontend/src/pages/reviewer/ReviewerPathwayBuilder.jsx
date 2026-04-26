import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2);

// 🟢 HELPER: Converts "full-stack-development" into "Full Stack Development"
const formatSpecializationName = (slug) => {
  if (!slug) return "Specialization Not Found";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const CourseSelectionPage = ({ onClose, onSelect }) => {
  const [dbCourses, setDbCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("http://localhost:5000/api/courses", config); 
        setDbCourses(data.courses || data || []);
      } catch (err) {
        console.error("Failed to fetch courses for selector:", err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchAllCourses();
  }, []);

  const filteredCourses = dbCourses.filter((c) => {
    const status = (c.status || "").toLowerCase();
    const isVisible = status === "approve" || status === "approved" || status === "published" || status === "pending";
    const matchesSearch = (c.title || "").toLowerCase().includes(search.toLowerCase());
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

        <input
          type="text"
          placeholder="Search by course title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-emerald-100 p-4 rounded-2xl shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 mb-8 text-lg"
        />

        {loadingCourses ? (
          <div className="text-center py-10 text-slate-500 font-bold">Fetching courses from database...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length === 0 ? (
              <p className="col-span-full text-center text-slate-500 py-10 italic">No courses found matching your search.</p>
            ) : (
              filteredCourses.map((course) => (
                <div key={course.id || course._id} className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 transition-all duration-300">
                  <img 
                    src={course.thumbnailUrl || course.thumbnail || "https://placehold.co/600x400?text=No+Image"} 
                    alt="course" 
                    className="w-full h-48 object-cover bg-slate-100"
                  />
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-2 mb-2">{course.title}</h3>
                    <p className="text-sm text-slate-500 mb-6">{course.educatorName}</p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${course.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
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

const ReviewerPathwayBuilder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingFile, setUploadingFile] = useState(null); 

  const [activeCourseSelector, setActiveCourseSelector] = useState({
    isActive: false,
    stepIndex: null,
  });

  const [pathway, setPathway] = useState({
    pathName: "Loading specialization...",
    level: "Beginner",
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
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        const { data } = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const rawSlug = data.user?.specializationTag || data?.specializationTag;

        // 🟢 FIXED: Keep the RAW SLUG in state so the backend validation passes!
        setPathway((prev) => ({
          ...prev,
          pathName: rawSlug || "Specialization Not Found",
        }));
      } catch (err) {
        setError("Failed to load reviewer profile.");
      }
    };
    fetchProfile();
  }, []);

  const handlePathwayChange = (e) =>
    setPathway({ ...pathway, [e.target.name]: e.target.value });

  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const addStep = () =>
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

  const removeStep = (index) => setSteps(steps.filter((_, i) => i !== index));

  const addResourceToStep = (stepIndex) => {
    const newSteps = [...steps];
    if (!newSteps[stepIndex].resources) newSteps[stepIndex].resources = [];
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
      const res = await axios.post("http://localhost:5000/api/upload/content", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        const newSteps = [...steps];
        newSteps[stepIndex].resources[resIndex].url = res.data.item.url;
        
        if (!newSteps[stepIndex].resources[resIndex].title) {
          newSteps[stepIndex].resources[resIndex].title = file.name;
        }
        
        if (file.name.toLowerCase().endsWith('.pdf')) {
            newSteps[stepIndex].resources[resIndex].type = "pdf";
        }
        
        setSteps(newSteps);
      }
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploadingFile(null);
      event.target.value = null;
    }
  };

  const openCourseSelector = (stepIndex) => {
    setActiveCourseSelector({ isActive: true, stepIndex });
  };

  const handleAttachCourse = (course) => {
    const newSteps = [...steps];
    const stepIdx = activeCourseSelector.stepIndex;
    
    if (!newSteps[stepIdx].linkedCourses) newSteps[stepIdx].linkedCourses = [];
    
    const courseId = course._id || course.id;
    const exists = newSteps[stepIdx].linkedCourses.find(c => c.courseId === courseId);
    
    if (!exists) {
      newSteps[stepIdx].linkedCourses.push({
        courseId: courseId,
        title: course.title,
        thumbnail: course.thumbnailUrl || course.thumbnail || "https://placehold.co/600x400?text=Course",
        educatorName: course.educatorName || course.createdByEducatorEmail || "EduPath Educator"
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

  // 🟢 Included robust validation
  const handleSavePathway = async () => {
    setError("");

    if (!pathway.pathName || pathway.pathName === "Loading specialization..." || pathway.pathName === "Specialization Not Found") {
      return setError("Valid Specialization required.");
    }
    
    if (steps.length === 0) {
      return setError("Add at least one step.");
    }

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      if (!step.title.trim() || !step.description.trim()) {
        setError(`Please fill out both the Title and Description for Step ${i + 1}.`);
        window.scrollTo({ top: 0, behavior: "smooth" }); 
        return;
      }

      for (let j = 0; j < (step.resources || []).length; j++) {
        const res = step.resources[j];
        
        if (!res.title.trim()) {
          setError(`Please provide a Title for Learning Material #${j + 1} in Step ${i + 1}.`);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        if (!res.url.trim()) {
          if (res.type === "pdf") {
            setError(`Please upload the PDF document for "${res.title}" in Step ${i + 1}.`);
          } else {
            setError(`Please paste a URL for "${res.title}" in Step ${i + 1}.`);
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        if (!/^(https?:\/\/)/i.test(res.url.trim())) {
           setError(`The URL for "${res.title}" in Step ${i + 1} is invalid. It must start with http:// or https://`);
           window.scrollTo({ top: 0, behavior: "smooth" });
           return;
        }
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("edupath_token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data: pathwayData } = await axios.post(
        "http://localhost:5000/api/pathway/template",
        pathway,
        config,
      );
      const templateId = pathwayData.template._id;

      let orderCounter = 1;
      for (const step of steps) {
        const { id, ...stepData } = step;
        await axios.post(
          `http://localhost:5000/api/pathway/template/${templateId}/steps`,
          { ...stepData, order: orderCounter },
          config,
        );
        orderCounter++;
      }

      setLoading(false);
      alert("Pathway Template saved successfully!");
      navigate("/reviewer/pathways");
    } catch (err) {
      setLoading(false);
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
      <div className="mx-auto max-w-4xl space-y-6 pb-12">
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-semibold text-text-dark">
            Create Curriculum
          </h1>
          <p className="mt-1 text-sm text-muted">
            Build a master course for your assigned specialization.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-text-dark mb-4">
            1. Pathway Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pathName" className="mb-1 block text-sm font-medium text-text-dark">
                Assigned Specialization
              </label>
              <input
                id="pathName"
                type="text"
                name="pathName"
                // 🟢 FIXED: Format the raw slug into a pretty name ONLY for the visual input box
                value={formatSpecializationName(pathway.pathName)}
                disabled // 🔥 LOCKED INPUT
                className="w-full rounded-xl border border-black/10 bg-gray-100 text-gray-500 cursor-not-allowed px-4 py-2 text-sm outline-none"
              />
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
                className="w-full rounded-xl border border-black/10 bg-white/50 px-4 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-dark pl-2">
            2. Curriculum Steps
          </h2>
          {steps.map((step, index) => {
            const stepIdentifier = step._id || step.id;

            return (
              <div
                key={stepIdentifier}
                className="relative rounded-[22px] border border-black/5 bg-white/80 p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between border-b border-black/5 pb-3">
                  <span className="font-semibold text-primary">
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor={`step-title-${stepIdentifier}`}
                      className="mb-1 block text-xs font-medium text-text-dark"
                    >
                      Step Title
                    </label>
                    <input
                      id={`step-title-${stepIdentifier}`}
                      type="text"
                      value={step.title}
                      onChange={(e) =>
                        handleStepChange(index, "title", e.target.value)
                      }
                      className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor={`step-desc-${stepIdentifier}`}
                      className="mb-1 block text-xs font-medium text-text-dark"
                    >
                      Description
                    </label>
                    <textarea
                      id={`step-desc-${stepIdentifier}`}
                      rows={2}
                      value={step.description}
                      onChange={(e) =>
                        handleStepChange(index, "description", e.target.value)
                      }
                      className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>

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
                        + ADD LINK / FILE
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(step.resources || []).map((res, resIndex) => {
                        const isUploading =
                          uploadingFile?.stepIndex === index &&
                          uploadingFile?.resIndex === resIndex;

                        return (
                          <div
                            key={resIndex}
                            className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100"
                          >
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
                              <option value="pdf">📄 PDF Document</option>
                              <option value="link">🔗 External Link</option>
                            </select>

                            <input
                              type="text"
                              placeholder="Link Title (e.g. Read PDF)"
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

                            <div className="flex-1 min-w-[160px] flex items-center gap-1">
                              {res.type === "pdf" ? (
                                <>
                                  <input
                                    type="text"
                                    placeholder="Upload a PDF file →"
                                    value={res.url}
                                    readOnly 
                                    className="w-full rounded-md border border-black/10 px-3 py-1.5 text-xs outline-none bg-slate-50 text-slate-500 cursor-not-allowed"
                                  />
                                  <label
                                    className={`shrink-0 cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                                  >
                                    {isUploading
                                      ? "⏳ Uploading..."
                                      : "⬆️ Upload PDF"}
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept=".pdf"
                                      onChange={(e) =>
                                        handleFileUpload(e, index, resIndex)
                                      }
                                    />
                                  </label>
                                </>
                              ) : (
                                <input
                                  type="text"
                                  placeholder="Paste URL here (https://...)"
                                  value={res.url}
                                  onChange={(e) =>
                                    handleResourceChange(
                                      index,
                                      resIndex,
                                      "url",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full rounded-md border border-black/10 px-3 py-1.5 text-xs outline-none focus:border-primary bg-white"
                                />
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeResourceFromStep(index, resIndex)
                              }
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors font-bold shrink-0"
                              title="Remove link"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                      {(!step.resources || step.resources.length === 0) && (
                        <p className="text-xs text-muted italic">
                          No materials added yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2 pt-4 border-t border-black/10 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-bold text-text-dark uppercase tracking-wider">
                        Platform Courses
                      </label>
                      <button
                        type="button"
                        onClick={() => openCourseSelector(index)}
                        className="text-[10px] font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        + ADD COURSE
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(step.linkedCourses || []).map((c, cIndex) => (
                        <div
                          key={cIndex}
                          className="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                              <img
                                src={c.thumbnail}
                                alt="thumb"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                {c.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                {c.educatorName}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLinkedCourse(index, cIndex)}
                            className="text-red-400 hover:bg-red-50 p-2 rounded-lg font-bold transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {(!step.linkedCourses ||
                        step.linkedCourses.length === 0) && (
                        <p className="text-xs text-muted italic">
                          No internal courses linked yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2 pt-4 border-t border-black/10 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-bold text-text-dark uppercase tracking-wider">
                        Step Assessment (Quiz)
                      </label>
                      <button
                        type="button"
                        onClick={() => addQuizQuestion(index)}
                        className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-200 transition-colors"
                      >
                        + ADD QUESTION
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(step.quiz || []).map((q, qIndex) => (
                        <div
                          key={qIndex}
                          className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 relative"
                        >
                          <button
                            type="button"
                            onClick={() => removeQuizQuestion(index, qIndex)}
                            className="absolute top-2 right-2 text-red-400 hover:bg-red-50 p-1.5 rounded-md font-bold text-xs"
                          >
                            ✕ Remove
                          </button>

                          <label className="text-xs font-semibold text-emerald-800 mb-1 block">
                            Question {qIndex + 1}
                          </label>
                          <input
                            type="text"
                            placeholder="Enter question here..."
                            value={q.question}
                            onChange={(e) =>
                              handleQuizChange(
                                index,
                                qIndex,
                                "question",
                                e.target.value,
                              )
                            }
                            className="w-full mb-3 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white"
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, optIndex) => (
                              <div
                                key={optIndex}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="radio"
                                  name={`correct-ans-${stepIdentifier}-${qIndex}`}
                                  checked={q.correctAnswerIndex === optIndex}
                                  onChange={() =>
                                    handleQuizChange(
                                      index,
                                      qIndex,
                                      "correctAnswerIndex",
                                      optIndex,
                                    )
                                  }
                                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  title="Mark as correct answer"
                                />
                                <input
                                  type="text"
                                  placeholder={`Option ${optIndex + 1}`}
                                  value={opt}
                                  onChange={(e) =>
                                    handleQuizOptionChange(
                                      index,
                                      qIndex,
                                      optIndex,
                                      e.target.value,
                                    )
                                  }
                                  className={`flex-1 rounded-md border px-3 py-1.5 text-xs outline-none focus:border-emerald-500 bg-white ${q.correctAnswerIndex === optIndex ? "border-emerald-400 bg-emerald-50/50" : "border-black/10"}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {(!step.quiz || step.quiz.length === 0) && (
                        <p className="text-xs text-muted italic">
                          No assessment added. Step will be completable without
                          a quiz.
                        </p>
                      )}
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
            disabled={loading}
            className="rounded-full bg-primary px-8 py-3 font-semibold text-white shadow-md hover:brightness-95 disabled:opacity-70"
          >
            {loading ? "Saving..." : "Publish Template"}
          </button>
        </div>
      </div>
    </PageShell>
  );
};

export default ReviewerPathwayBuilder;
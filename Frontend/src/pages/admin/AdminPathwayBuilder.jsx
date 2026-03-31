import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx"; // Adjust path as needed

// Helper to generate a unique ID for React keys
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const AdminPathwayBuilder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pathway Template State
  const [pathway, setPathway] = useState({
    pathName: "",
    level: "Beginner",
  });

  // Steps State - added a unique 'id' for React keys
  const [steps, setSteps] = useState([
    { id: generateId(), title: "", description: "", type: "course", resource: "" },
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
      { id: generateId(), title: "", description: "", type: "course", resource: "" },
    ]);
  };

  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  const handleSavePathway = async () => {
    // 1. FRONTEND VALIDATION
    setError(""); // Clear any previous errors

    if (!pathway.pathName.trim()) {
      setError("Please enter a Pathway Name.");
      return;
    }

    if (steps.length === 0) {
      setError("You must add at least one step to the curriculum.");
      return;
    }

    // Check each step for missing required fields
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step.title.trim() || !step.description.trim()) {
        setError(`Please fill out both the Title and Description for Step ${i + 1}.`);
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
        "http://localhost:5000/api/pathway/template",
        pathway,
        config
      );

      const templateId = pathwayData.template._id;

      // Add all steps sequentially
      let orderCounter = 1;
      for (const step of steps) {
        // Strip out the frontend-only 'id' before sending to the backend
        const { id, ...stepData } = step;

        await axios.post(
          `http://localhost:5000/api/pathway/template/${templateId}/steps`,
          { ...stepData, order: orderCounter },
          config
        );
        orderCounter++;
      }

      setLoading(false);
      alert("Pathway Template saved successfully!");
      navigate("/admin/pathways"); 
      
    } catch (err) {
      setLoading(false);
      console.error(err);
      setError(err?.response?.data?.message || "Failed to save pathway");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-6 pb-12">
        {/* Header */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <h1 className="text-2xl font-semibold text-text-dark">
            Pathway Builder
          </h1>
          <p className="mt-1 text-sm text-muted">
            Create a new Master Course template and define its learning steps.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {/* Pathway Details Section */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-text-dark mb-4">
            1. Pathway Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {/* Fix: Added htmlFor and id */}
              <label htmlFor="pathName" className="mb-1 block text-sm font-medium text-text-dark">
                Pathway Name
              </label>
              <input
                id="pathName"
                type="text"
                name="pathName"
                value={pathway.pathName}
                onChange={handlePathwayChange}
                placeholder="e.g., Fullstack Web Development"
                className="w-full rounded-xl border border-black/10 bg-white/50 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              {/* Fix: Added htmlFor and id */}
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
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-dark pl-2">
            2. Curriculum Steps
          </h2>

          {steps.map((step, index) => (
            <div
              key={step.id} // Fix: Using unique step.id instead of array index
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
                  {/* Fix: Dynamic htmlFor and id based on step.id */}
                  <label htmlFor={`step-title-${step.id}`} className="mb-1 block text-xs font-medium text-text-dark">
                    Step Title
                  </label>
                  <input
                    id={`step-title-${step.id}`}
                    type="text"
                    value={step.title}
                    onChange={(e) => handleStepChange(index, "title", e.target.value)}
                    placeholder="e.g., Introduction to React"
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  {/* Fix: Dynamic htmlFor and id */}
                  <label htmlFor={`step-desc-${step.id}`} className="mb-1 block text-xs font-medium text-text-dark">
                    Description
                  </label>
                  <textarea
                    id={`step-desc-${step.id}`}
                    rows={2}
                    value={step.description}
                    onChange={(e) => handleStepChange(index, "description", e.target.value)}
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  {/* Fix: Dynamic htmlFor and id */}
                  <label htmlFor={`step-type-${step.id}`} className="mb-1 block text-xs font-medium text-text-dark">
                    Content Type
                  </label>
                  <select
                    id={`step-type-${step.id}`}
                    value={step.type}
                    onChange={(e) => handleStepChange(index, "type", e.target.value)}
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="course">Video / Course</option>
                    <option value="project">Project Assignment</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>

                <div>
                  {/* Fix: Dynamic htmlFor and id */}
                  <label htmlFor={`step-res-${step.id}`} className="mb-1 block text-xs font-medium text-text-dark">
                    Resource URL (Optional)
                  </label>
                  <input
                    id={`step-res-${step.id}`}
                    type="text"
                    value={step.resource}
                    onChange={(e) => handleStepChange(index, "resource", e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addStep}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-primary/40 bg-primary/5 py-4 text-sm font-semibold text-primary hover:bg-primary/10 hover:border-primary/60 transition-colors"
          >
            <span>+</span> Add Another Step
          </button>
        </div>

        {/* Save Actions */}
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

export default AdminPathwayBuilder;
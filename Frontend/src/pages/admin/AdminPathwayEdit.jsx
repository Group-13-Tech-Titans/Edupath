import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";

// Helper to generate a unique ID for new steps added during editing
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const AdminPathwayEdit = () => {
  const { id } = useParams(); // Get the ID from the URL
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [pathway, setPathway] = useState({ pathName: "", level: "Beginner" });
  const [steps, setSteps] = useState([]);

  // Fetch data on load
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        const { data } = await axios.get(`http://localhost:5000/api/pathway/template/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPathway({
          pathName: data.template.pathName,
          level: data.template.level
        });
        setSteps(data.template.steps || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching template:", err); // Fix: S2486 - Handle exception properly
        setError("Failed to load pathway details.");
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [id]);

  const handlePathwayChange = (e) => {
    setPathway({ ...pathway, [e.target.name]: e.target.value });
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    // Fix: S6479 - Assign a temporary id for new steps to use as a React key
    setSteps([...steps, { id: generateId(), title: "", description: "", type: "course", resource: "" }]);
  };

  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleUpdatePathway = async () => {
    setError("");

    if (!pathway.pathName.trim()) return setError("Please enter a Pathway Name.");
    if (steps.length === 0) return setError("Add at least one step.");

    // Fix the order numbers before sending
    const formattedSteps = steps.map((step, index) => {
      if (!step.title.trim() || !step.description.trim()) {
        setError(`Please fill out Title and Description for Step ${index + 1}.`);
        throw new Error("Validation Failed");
      }
      
      // Strip out the frontend-only 'id' for new steps (keep _id if it exists)
      const { id, ...stepData } = step; 
      
      return { ...stepData, order: index + 1 }; // Ensure order is exactly right
    });

    try {
      setSaving(true);
      const token = localStorage.getItem("edupath_token");
      
      await axios.put(`http://localhost:5000/api/pathway/template/${id}`, 
        { 
          pathName: pathway.pathName, 
          level: pathway.level, 
          steps: formattedSteps 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSaving(false);
      alert("Pathway updated successfully!");
      navigate("/admin/pathways");
    } catch (err) {
      if (err.message !== "Validation Failed") {
        setError(err?.response?.data?.message || "Failed to update pathway");
      }
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) return <PageShell><div className="p-10 text-center">Loading editor...</div></PageShell>;

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-6 pb-12">
        {/* Header */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-semibold text-text-dark">Edit Pathway</h1>
          <p className="mt-1 text-sm text-muted">Modify this master course and its steps.</p>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">{error}</div>
        )}

        {/* Pathway Details */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-text-dark mb-4">1. Pathway Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {/* Fix: S6853 - Added htmlFor and id */}
              <label htmlFor="pathName" className="mb-1 block text-sm font-medium text-text-dark">Pathway Name</label>
              <input
                id="pathName"
                type="text"
                name="pathName"
                value={pathway.pathName}
                onChange={handlePathwayChange}
                className="w-full rounded-xl border border-black/10 px-4 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              {/* Fix: S6853 - Added htmlFor and id */}
              <label htmlFor="level" className="mb-1 block text-sm font-medium text-text-dark">Level</label>
              <select
                id="level"
                name="level"
                value={pathway.level}
                onChange={handlePathwayChange}
                className="w-full rounded-xl border border-black/10 px-4 py-2 text-sm outline-none focus:border-primary"
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
          <h2 className="text-lg font-semibold text-text-dark pl-2">2. Curriculum Steps</h2>
          
          {steps.map((step, index) => {
            // Determine a unique identifier for this step to use in keys and input IDs
            const stepIdentifier = step._id || step.id; 

            return (
              <div key={stepIdentifier} className="relative rounded-[22px] border border-black/5 bg-white/80 p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-black/5 pb-3">
                  <span className="font-semibold text-primary">Step {index + 1}</span>
                  <button
                    onClick={() => removeStep(index)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline"
                  >
                    Remove Step
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    {/* Fix: S6853 - Dynamic htmlFor and id */}
                    <label htmlFor={`step-title-${stepIdentifier}`} className="mb-1 block text-xs font-medium text-text-dark">Step Title</label>
                    <input
                      id={`step-title-${stepIdentifier}`}
                      type="text"
                      value={step.title}
                      onChange={(e) => handleStepChange(index, "title", e.target.value)}
                      className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    {/* Fix: S6853 - Dynamic htmlFor and id */}
                    <label htmlFor={`step-desc-${stepIdentifier}`} className="mb-1 block text-xs font-medium text-text-dark">Description</label>
                    <textarea
                      id={`step-desc-${stepIdentifier}`}
                      rows={2}
                      value={step.description}
                      onChange={(e) => handleStepChange(index, "description", e.target.value)}
                      className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    {/* Fix: S6853 - Dynamic htmlFor and id */}
                    <label htmlFor={`step-type-${stepIdentifier}`} className="mb-1 block text-xs font-medium text-text-dark">Content Type</label>
                    <select
                      id={`step-type-${stepIdentifier}`}
                      value={step.type}
                      onChange={(e) => handleStepChange(index, "type", e.target.value)}
                      className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      <option value="course">Video / Course</option>
                      <option value="project">Project Assignment</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>
                  <div>
                    {/* Fix: S6853 - Dynamic htmlFor and id */}
                    <label htmlFor={`step-res-${stepIdentifier}`} className="mb-1 block text-xs font-medium text-text-dark">Resource URL</label>
                    <input
                      id={`step-res-${stepIdentifier}`}
                      type="text"
                      value={step.resource || ""}
                      onChange={(e) => handleStepChange(index, "resource", e.target.value)}
                      className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <button onClick={addStep} className="mt-2 flex w-full items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-primary/40 bg-primary/5 py-4 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">
            <span>+</span> Add Another Step
          </button>
        </div>

        <div className="flex justify-end pt-4">
          <button onClick={handleUpdatePathway} disabled={saving} className="rounded-full bg-primary px-8 py-3 font-semibold text-white shadow-md hover:brightness-95 disabled:opacity-70">
            {saving ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>
    </PageShell>
  );
};

export default AdminPathwayEdit;
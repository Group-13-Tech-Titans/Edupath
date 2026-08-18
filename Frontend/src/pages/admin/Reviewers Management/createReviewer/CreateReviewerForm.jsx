import React, { useState } from "react";
import axios from "axios";

export default function CreateReviewerForm({
  activeSpecializations = [],
  API_BASE,
  getAuthHeader,
  fetchReviewers, 
}) {
  // Local States for form data, error/success messages, and submission status
  const [form, setForm] = useState({ name: "", email: "", specializationTags: [] });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Handlers
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Handles adding a specialization tag 
  const handleAddSpecToForm = (e) => {
    const spec = e.target.value;
    if (spec && !form.specializationTags.includes(spec)) {
      setForm((p) => ({ ...p, specializationTags: [...p.specializationTags, spec] }));
    }
  };

  // Handles removing a specialization tag from the form
  const handleRemoveSpecFromForm = (spec) => {
    setForm((p) => ({ ...p, specializationTags: p.specializationTags.filter((s) => s !== spec) }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setSuccess("");
    
    const email = form.email.trim().toLowerCase();
    if (!email.endsWith("@gmail.com") || !/^[a-z0-9._%+-]+@gmail\.com$/.test(email)) {
      return setError("Only valid @gmail.com addresses are allowed.");
    }
    
    if (form.specializationTags.length === 0) { // Ensure at least one specialization is selected
      return setError("Please select at least one specialization.");
    }

    //payload created based on the form state
    setIsSubmitting(true);
    try {
      await axios.post(API_BASE, { ...form, email: email }, getAuthHeader());
      fetchReviewers(); 
      setSuccess("Reviewer account created ✅");
      setForm({ name: "", email: "", specializationTags: [] });
      
      
      setTimeout(() => setSuccess(""), 3000); // hide success message after 3 seconds
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create reviewer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    //form header and description
    <div className="rounded-[26px] bg-white/80 shadow-lg p-6 ring-1 ring-emerald-100 h-fit">
      <h2 className="text-lg font-bold text-slate-900">Create Reviewer</h2>
      <p className="text-sm text-slate-500 mt-1">
        Fill the form and create a new reviewer login.
      </p>
      

    
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        {success && <p className="text-green-500 text-sm font-medium">{success}</p>}

        <div>
          {/* Name Input Field */}
          <label className="text-sm font-semibold text-slate-700">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Eg: Nuwan Silva"
            className="mt-2 w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100 transition"
            required
          />
        </div>

        <div>
          {/* Email Input Field */}
          <label className="text-sm font-semibold text-slate-700">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value.toLowerCase() }))}
            placeholder="reviewer@edupath.com"
            className="mt-2 w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100 transition"
            required
          />
        </div>

        <div>
          {/* Specialization Tags Multi-select */}
          <label className="text-sm font-semibold text-slate-700 block mb-2">
            Specialization Tags
          </label>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {form.specializationTags.map((tag) => (
              <div key={tag} className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
                {tag}
                <button 
                  type="button" 
                  onClick={() => handleRemoveSpecFromForm(tag)}
                  className="ml-1 text-emerald-600 hover:text-red-500 font-black"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <select
            value=""
            onChange={handleAddSpecToForm}
            className="w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100 bg-white cursor-pointer transition"
          >
            {/* Specialization dropdown options */}
            <option value="" disabled>+ Add a specialization...</option> {/*  */}
            {activeSpecializations
              .filter((spec) => !form.specializationTags.includes(spec.name))
              .map((spec) => (
                <option key={spec._id} value={spec.name}>
                  {spec.name}
                </option>
              ))}
          </select>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-emerald-500 py-3 font-bold text-white shadow-md hover:bg-emerald-600 transition disabled:opacity-70"
        >
          {isSubmitting ? "Creating..." : "Create reviewer"}
        </button>
      </form>
    </div>
  );
}
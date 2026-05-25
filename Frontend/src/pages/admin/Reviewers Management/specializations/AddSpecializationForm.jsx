import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SPEC_API = `${API_URL}/api/specializations`;


//Add specialization form component


export default function AddSpecializationForm({ getAuthHeader, showToast, onSuccess }) {
  const [newSpecName, setNewSpecName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to save the new specialization
  const handleAddSpecialization = async (e) => {
    e.preventDefault();
    if (!newSpecName.trim()) return;

    setIsSubmitting(true);
    try {
      // Send data to the backend
      await axios.post(SPEC_API, { name: newSpecName }, getAuthHeader());
      
      showToast("success", "Specialization added successfully!");
      setNewSpecName(""); // Clear the input box
      onSuccess(); // Tell the main page to refresh the list
    } catch (error) {
      console.error(error);
      showToast("error", error.response?.data?.message || "Failed to add specialization.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      <h2 className="text-base font-semibold text-slate-800 mb-4">Add New Specialization</h2>
      {/* Form to add a new specialization */}
      <form onSubmit={handleAddSpecialization} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="e.g. Cyber Security, Python, Graphic Design"
          value={newSpecName}
          onChange={(e) => setNewSpecName(e.target.value)}
          className="flex-grow rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          disabled={isSubmitting}
        />
        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || !newSpecName.trim()}
          className="whitespace-nowrap rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 disabled:opacity-50 transition"
        >
          {isSubmitting ? "Adding..." : "+ Add Field"}
        </button>
      </form>
    </div>
  );
}
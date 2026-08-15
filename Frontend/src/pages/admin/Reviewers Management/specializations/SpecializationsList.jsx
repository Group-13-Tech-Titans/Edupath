import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const SPEC_API = `${API_URL}/api/specializations`;

// List Component
export default function SpecializationsList({ getAuthHeader, showToast, refreshKey }) {
  const [specializations, setSpecializations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from the server
  useEffect(() => {
    const fetchSpecializations = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(SPEC_API, getAuthHeader());
        setSpecializations(res.data.specializations || []);
      } catch (error) {
        console.error(error);
        showToast("error", "Failed to load specializations.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpecializations();
  }, [refreshKey]); // Runs again if 'refreshKey' changes (when a new item is added)

  // Active inactive toggle handler
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`${SPEC_API}/${id}/toggle`, {}, getAuthHeader());
      
      // Update the screen immediately without reloading
      setSpecializations(prevSpecs => 
        prevSpecs.map(spec => 
          spec._id === id ? { ...spec, isActive: !spec.isActive } : spec
        )
      );

      showToast("success", `Status updated to ${!currentStatus ? 'Active' : 'Inactive'}`);
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to change status.");
    }
  };

  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-slate-800">Current Specializations</h2>
        <span className="px-3 py-1 bg-slate-100 text-xs font-bold text-slate-600 rounded-full">
        {/* Show total count of specializations */}
          Total: {specializations.length}
        </span>
      </div>

      {isLoading ? (
        <div className="p-4 text-center text-sm text-slate-500 animate-pulse">Loading specializations...</div>
      ) : specializations.length === 0 ? (
        <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
          <p className="text-sm text-slate-500">No specializations added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {specializations.map((spec) => (
            <div key={spec._id} className="p-4 rounded-2xl border border-black/5 bg-white shadow-sm flex items-center justify-between hover:shadow-md transition">
              <div className="min-w-0 pr-3">
                <p className="font-bold text-sm text-slate-800 truncate">{spec.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">Slug: {spec.slug}</p>
              </div>
              
              {/* Toggle Button */}
              <div>
                <button
                  onClick={() => handleToggleStatus(spec._id, spec.isActive)}
                  className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-full tracking-wider transition-colors shadow-sm hover:shadow focus:outline-none ${
                    spec.isActive 
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                  title={`Click to make ${spec.isActive ? 'Inactive' : 'Active'}`}
                >
                  {spec.isActive ? "Active" : "Inactive"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
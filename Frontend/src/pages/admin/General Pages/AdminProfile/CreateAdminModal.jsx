import React, { useState } from "react";
import axios from "axios";
import { Loader2, CheckCircle2 } from "lucide-react";

//create new admin modal component
export default function CreateAdminModal({ onClose, onAdminCreated, createAdminApi, getAuthHeader, showToast }) {
  const [newAdminForm, setNewAdminForm] = useState({ fullName: "", email: "" });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setIsCreatingAdmin(true);

    try {
      const payload = {
        name: newAdminForm.fullName,
        email: newAdminForm.email,
        role: "admin",
      };

      await axios.post(createAdminApi, payload, getAuthHeader());
      
      setIsSuccess(true);
      setTimeout(() => {
        if(onAdminCreated) onAdminCreated();
        else onClose();
      }, 2000);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to create Admin.");
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[26px] bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Create New Admin</h3>
        
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
            <h4 className="text-lg font-bold text-slate-900 mb-2">Admin Created Successfully!</h4>
            <p className="text-sm text-slate-500">The temporary password has been sent to their email.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">Fill the details. A temporary password will be auto-generated and emailed.</p>
            
            <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAdminForm.fullName} 
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, fullName: e.target.value })} 
                  placeholder="Eg: Kasun Perera" 
                  className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50 transition" 
                />
              </div>
              
              <div>
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={newAdminForm.email} 
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })} 
                  placeholder="newadmin@edupath.com" 
                  className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50 transition" 
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="flex-1 rounded-full bg-slate-100 py-3 font-semibold text-slate-600 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isCreatingAdmin} 
                  className="flex-1 rounded-full bg-slate-800 py-3 font-semibold text-white shadow-md hover:bg-slate-700 transition disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isCreatingAdmin ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Confirm & Create"
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
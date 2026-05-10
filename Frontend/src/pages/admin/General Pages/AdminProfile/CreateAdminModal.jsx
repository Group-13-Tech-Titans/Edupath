import React, { useState } from "react";
import axios from "axios";

export default function CreateAdminModal({ onClose, createAdminApi, getAuthHeader, showToast }) {
  const [newAdminForm, setNewAdminForm] = useState({ fullName: "", email: "", password: "" });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setIsCreatingAdmin(true);

    try {
      const payload = {
        name: newAdminForm.fullName,
        email: newAdminForm.email,
        password: newAdminForm.password,
        role: "admin"
      };
      await axios.post(createAdminApi, payload, getAuthHeader());
      showToast("success", "New Admin created successfully!");
      onClose(); 
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
        <p className="text-sm text-slate-500 mb-6">Fill the details and set a temporary password for the new admin.</p>
        
        <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Full Name</label>
            <input type="text" required value={newAdminForm.fullName} onChange={(e) => setNewAdminForm({ ...newAdminForm, fullName: e.target.value })} placeholder="Eg: Kasun Perera" className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <input type="email" required value={newAdminForm.email} onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })} placeholder="newadmin@edupath.com" className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Temporary Password</label>
            <input type="text" required value={newAdminForm.password} onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })} placeholder="Set a temp password..." className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50" />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-full bg-slate-100 py-3 font-semibold text-slate-600 hover:bg-slate-200 transition">Cancel</button>
            <button type="submit" disabled={isCreatingAdmin} className="flex-1 rounded-full bg-slate-800 py-3 font-semibold text-white shadow-md hover:bg-slate-700 transition disabled:opacity-70">
              {isCreatingAdmin ? "Creating..." : "Confirm & Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
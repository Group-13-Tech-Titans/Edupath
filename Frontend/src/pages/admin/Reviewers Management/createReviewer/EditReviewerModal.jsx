import React from "react";
// edit form component to be used in the Edit Reviewer modal
export default function EditReviewerModal({
  editingReviewer,
  setEditingReviewer,
  handleEditChange,
  handleEditSubmit,
  handleAddSpecToEdit,
  handleRemoveSpecFromEdit,
  activeSpecializations,
}) {
  if (!editingReviewer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[26px] bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Edit Reviewer</h3>
        
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Name</label>
            <input
              name="name"
              value={editingReviewer.name || ""}
              onChange={handleEditChange}
              className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              value={editingReviewer.email || ""}
              onChange={handleEditChange}
              className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Specialization Tags</label>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {(editingReviewer.specializationTags || []).map((tag) => (
                <div key={tag} className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSpecFromEdit(tag)}
                    className="ml-1 text-emerald-600 hover:text-red-500 font-black"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <select
              value=""
              onChange={handleAddSpecToEdit}
              className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
            >
              <option value="" disabled>+ Add a specialization...</option>
              {activeSpecializations
                .filter((spec) => !(editingReviewer.specializationTags || []).includes(spec.name))
                .map((spec) => (
                  <option key={spec._id} value={spec.name}>
                    {spec.name}
                  </option>
                ))}
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setEditingReviewer(null)}
              className="flex-1 rounded-full bg-slate-100 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-full bg-emerald-500 py-2.5 font-semibold text-white shadow-md hover:bg-emerald-600 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React from "react";

export default function CreateReviewerForm({
  form = { name: "", email: "", specializationTags: [] }, 
  error = "",
  success = "",
  activeSpecializations = [], 
  handleChange,
  handleAddSpecToForm,
  handleRemoveSpecFromForm,
  handleSubmit,
}) {
  return (
    <div className="rounded-[26px] bg-white/80 shadow-lg p-6 ring-1 ring-emerald-100">
      <h2 className="text-lg font-bold text-slate-900">Create Reviewer</h2>
      <p className="text-sm text-slate-500 mt-1">
        Fill the form and create a new reviewer login.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        {success && <p className="text-green-500 text-sm font-medium">{success}</p>}

        <div>
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
          <label className="text-sm font-semibold text-slate-700">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="reviewer@edupath.com"
            className="mt-2 w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100 transition"
            required
          />
        </div>

        <div>
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
            <option value="" disabled>+ Add a specialization...</option>
            {activeSpecializations
              .filter((spec) => !form.specializationTags.includes(spec.name))
              .map((spec) => (
                <option key={spec._id} value={spec.name}>
                  {spec.name}
                </option>
              ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-emerald-500 py-3 font-bold text-white shadow-md hover:bg-emerald-600 transition"
        >
          Create reviewer
        </button>
      </form>
    </div>
  );
}
import React from "react";

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "R";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function ReviewersList({
  search = "",
  setSearch,
  filteredReviewers = [],
  openEditModal,
  setDeleteConfirmId,
}) {
  return (
    <div className="rounded-[26px] bg-white/80 shadow-lg p-6 ring-1 ring-emerald-100">
      <h2 className="text-lg font-bold text-slate-900">Existing reviewers</h2>
      <p className="text-sm text-slate-500 mt-1">
        Search and view created reviewer accounts.
      </p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search reviewers..."
        className="mt-4 w-full rounded-full border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100 transition"
      />

      <div className="mt-4 space-y-3 lg:max-h-[520px] lg:overflow-y-auto pr-1">
        {filteredReviewers.length === 0 && (
          <p className="text-sm text-slate-400 mt-4 text-center">No reviewers found...</p>
        )}

        {filteredReviewers.map((r) => {
          let tagsArray = [];
          if (Array.isArray(r.specializationTags) && r.specializationTags.length > 0) {
            tagsArray = r.specializationTags;
          } else if (r.specializationTag) {
            tagsArray = [r.specializationTag];
          }

          return (
            <div
              key={r._id || r.id}
              className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 min-w-0 w-full">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm shrink-0">
                  {getInitials(r.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 truncate text-sm">{r.name}</p>
                  <p className="text-sm text-slate-500 truncate">{r.email}</p>
                  
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {tagsArray.length > 0 ? (
                      tagsArray.map((tag, idx) => (
                        <span key={idx} className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400">No Specialization</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 border-l pl-3 ml-1">
                  <button
                    onClick={() => openEditModal(r)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(r._id || r.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
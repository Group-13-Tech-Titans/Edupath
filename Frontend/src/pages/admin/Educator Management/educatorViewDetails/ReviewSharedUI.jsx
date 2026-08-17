import React from "react";

export const DetailField = ({ label, value }) => (
  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
    <span className="block mt-1 text-sm font-medium text-slate-900">{value}</span>
  </div>
);

export const DocStatus = ({ label, provided }) => (
  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
    <span className="text-sm font-semibold text-slate-700">{label}</span>
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${provided ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
      {provided ? "Provided" : "Missing"}
    </span>
  </div>
);
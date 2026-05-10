import React from "react";

export default function ChartHeader({ timeRange, setTimeRange }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Student Registration Growth</h2>
        <p className="text-xs text-slate-500 mt-1">Number of new students joined over the selected period.</p>
      </div>
      
      <select 
        value={timeRange} 
        onChange={(e) => setTimeRange(e.target.value)}
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 shadow-sm cursor-pointer"
      >
        <option value="1d">Last 24 Hours</option>
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
        <option value="3m">Last 3 Months</option>
        <option value="6m">Last 6 Months</option>
        <option value="1y">Last 1 Year</option>
      </select>
    </div>
  );
}
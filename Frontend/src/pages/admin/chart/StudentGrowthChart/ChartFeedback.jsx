import React from "react";
import { GraduationCap } from "lucide-react"; 

export function ChartLoading() {
  return (
    <div className="h-[300px] flex items-center justify-center text-slate-400 animate-pulse text-sm font-semibold">
      Loading Chart Data...
    </div>
  );
}

export function ChartError() {
  return (
    <div className="h-[300px] flex items-center justify-center text-red-500 text-sm font-semibold bg-red-50 rounded-2xl">
      Failed to load chart data. Check server connection.
    </div>
  );
}

export function ChartEmpty() {
  return (
    <div className="h-[300px] flex flex-col items-center justify-center text-slate-500 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
      <GraduationCap className="w-10 h-10 mb-2 text-slate-300" strokeWidth={1.5} />
      No student registrations in this period.
    </div>
  );
}
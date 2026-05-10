import React from "react";
import { DetailField, DocStatus } from "./ReviewSharedUI";

export default function ApplicantInfo({ educator, fullName }) {
  return (
    <div className="lg:col-span-2 rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur space-y-6">
      <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Applicant Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailField label="Full Name" value={fullName} />
        <DetailField label="Email Address" value={educator.email} />
        <DetailField label="Field / Specialization" value={educator.field || educator.specialization || "Not Provided"} />
        <DetailField label="Education Level" value={educator.educationLevel || "Not Provided"} />
        <DetailField label="Expected Courses" value={educator.courseCount || "0"} />
        <DetailField 
          label="Application Date" 
          value={educator.submittedAt || educator.createdAt ? new Date(educator.submittedAt || educator.createdAt).toLocaleString() : "Unknown"} 
        />
      </div> 

      <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mt-6">Submitted Documents</h2>
      
      <div className="flex flex-col gap-3">
        <DocStatus label="National Identity Card (NIC)" provided={!!educator.docs?.nic} />
        <DocStatus label="Educational Certificates" provided={!!educator.docs?.certificate} />
        
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Portfolio Link</span>
          {educator.docs?.portfolio ? (
            <a href={educator.docs.portfolio} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
              View Portfolio ↗
            </a>
          ) : (
            <span className="text-sm text-slate-400">Not Provided</span>
          )}
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { DetailField } from "./ReviewSharedUI";

export default function ApplicantInfo({ educator, fullName }) {
  
  // Extract portfolio link safely from possible database fields
  const portfolioLink = 
    educator?.profile?.credentialsLink || 
    educator?.credentialsLink ||
    educator?.profile?.portfolio || 
    educator?.portfolio;

  // Extract contact number safely from possible database fields
  const contactNum = 
    educator?.profile?.contact || 
    educator?.contact ||
    educator?.profile?.contactNumber || 
    educator?.contactNumber;

  // Extract expertise/specialization from various possible fields
  let expertise = "Not Provided";
  if (educator?.profile?.specializationTag) {
    expertise = educator.profile.specializationTag;
  } else if (educator?.specializationTag) {
    expertise = educator.specializationTag;
  } else if (educator?.specializationTags && educator.specializationTags.length > 0) {
    expertise = educator.specializationTags.join(", ");
  }

  return (
    <div className="lg:col-span-2 rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur space-y-6">
      
      {/* Basic Information Section */}
      <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Applicant Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <DetailField 
          label="Full Name" 
          value={educator?.profile?.fullName || educator?.name || fullName || "Not Provided"} 
        />
        
        {/* Email Address */}
        <DetailField 
          label="Email Address" 
          value={educator?.profile?.email || educator?.email || "Not Provided"} 
        />
        
        {/* Contact Number */}
        <DetailField 
          label="Contact Number" 
          value={contactNum || "Not Provided"} 
        />
        {/* Expertise / Specialization */}
        <DetailField 
          label="Expertise / Specialization" 
          value={expertise} 
        />
        
        {/* Application Date (using updatedAt or createdAt as fallback) */}
        <DetailField 
          label="Application Date" 
          value={educator?.updatedAt || educator?.createdAt ? new Date(educator.updatedAt || educator.createdAt).toLocaleString() : "Unknown"} 
        />
      </div> 

      {/* External Links Section */}
      <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mt-6">Credentials & Links</h2>
      
      <div className="flex flex-col gap-3">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Portfolio / Credentials Link</span>
          
          {/* Render external link if available, otherwise show fallback text */}
          {portfolioLink ? (
            <a 
              href={portfolioLink.startsWith("http") ? portfolioLink : `https://${portfolioLink}`} 
              target="_blank" 
              rel="noreferrer" 
              className="text-sm font-bold text-blue-600 hover:underline"
            >
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
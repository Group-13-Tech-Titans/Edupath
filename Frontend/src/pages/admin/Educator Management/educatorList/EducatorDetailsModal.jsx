import React from "react";
import { User as UserIcon } from "lucide-react";

const Avatar = ({ name }) => (
  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
    <UserIcon className="h-6 w-6" />
  </div>
);

const MiniPill = ({ label }) => (
  <span className="rounded-full bg-black/5 px-2 py-0.5 whitespace-nowrap text-[11px]">
    {label}
  </span>
);

const DocLine = ({ label, ok }) => (
  <span className="flex items-center gap-1 text-[11px] text-muted">
    <span className={ok ? "text-emerald-500" : "text-rose-500"}>{ok ? "✓" : "✗"}</span>
    {label}
  </span>
);

const DocLink = ({ label, url }) => (
  <span className="flex items-center gap-1 text-[11px] text-muted">
    {url ? (
      <a href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
        <span>🔗</span> {label}
      </a>
    ) : (
      <span className="text-rose-500">✗ {label}</span>
    )}
  </span>
);

const EducatorDetailsModal = ({ educator, onClose }) => {
  if (!educator) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-text-dark mb-4">Educator Details</h3>
        
        <div className="flex items-start gap-4 mb-6">
          <Avatar name={educator.name || educator.email} />
          <div>
            <p className="text-base font-semibold text-text-dark flex items-center gap-2">
              {educator.name || "Unknown"}
              {educator.status === "VERIFIED" && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Verified</span>}
              {educator.status === "PENDING_VERIFICATION" && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Pending</span>}
              {educator.status === "REJECTED" && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Rejected</span>}
            </p>
            <p className="text-sm text-muted">{educator.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Profile Information</p>
            <div className="flex flex-wrap gap-2">
              <MiniPill label={`Field: ${educator.specializationTag || educator.profile?.specialization || "N/A"}`} />
              <MiniPill label={`Level: ${educator.profile?.educationLevel || "N/A"}`} />
              <MiniPill label={`Role: ${educator.role || "N/A"}`} />
              <MiniPill label={`Joined: ${new Date(educator.createdAt).toLocaleDateString()}`} />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Documents</p>
            <div className="flex flex-col gap-2 bg-black/5 rounded-xl p-3">
              <DocLine label="NIC" ok={!!educator.docs?.nic} />
              <DocLine label="Certificates" ok={!!educator.docs?.certificate} />
              <DocLink label="Portfolio" url={educator.docs?.portfolio} />
            </div>
          </div>
          
          {educator.profile?.contact && (
            <div>
               <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Contact</p>
               <p className="text-sm text-text-dark bg-black/5 rounded-xl p-3">{educator.profile.contact}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-black/10 px-6 py-2 text-sm font-semibold text-text-dark hover:bg-black/20 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EducatorDetailsModal;

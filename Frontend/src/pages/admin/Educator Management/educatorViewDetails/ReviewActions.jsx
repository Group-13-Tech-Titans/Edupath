import React from "react";
import { Check, X, Mail } from "lucide-react";



//Actions Card Component for Educator Review Page

export default function ReviewActions({ handleVerifyAction, handleContactAction, actionStatus }) {
  const isProcessing = actionStatus === "approving" || actionStatus === "rejecting";
  const isDone = actionStatus === "approved" || actionStatus === "rejected";
  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur h-fit space-y-4">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Actions</h2>
      

 {/* Approve Button */}   
   
      <button
        onClick={() => handleVerifyAction("VERIFIED")}
        disabled={isProcessing || isDone}
        className="w-full rounded-2xl bg-emerald-500 py-3.5 font-bold text-white shadow hover:bg-emerald-600 transition disabled:opacity-70 flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5" />
        {actionStatus === "approving" ? "Approving..." : actionStatus === "approved" ? "Application Approved" : "Approve Educator"}
      </button>


{/* Reject Button */}
      <button
        onClick={() => handleVerifyAction("REJECTED")}
        disabled={isProcessing || isDone}
        className="w-full rounded-2xl bg-red-500 py-3.5 font-bold text-white shadow hover:bg-red-600 transition disabled:opacity-70 flex items-center justify-center gap-2"
      >
        <X className="w-5 h-5" />
        {actionStatus === "rejecting" ? "Rejecting..." : actionStatus === "rejected" ? "Application Rejected" : "Reject Educator"}
      </button>


      <div className="my-4 border-t border-slate-200"></div>


{/* Email Contact Button */}

      <button
        onClick={handleContactAction}
        className="w-full rounded-2xl bg-blue-500 py-3.5 font-bold text-white shadow hover:bg-blue-600 transition flex items-center justify-center gap-2"
      >
        
        <Mail className="w-5 h-5" />
        Contact via Email
      </button>

      <p className="text-xs text-slate-400 text-center mt-2">
        Opens your default email client.
      </p>
    </div>
  );
}
import React, { useState } from "react";
import axios from "axios";
import { Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AiPathwayGenerator({ pathName, level, onTopicsGenerated }) {
  const [context, setContext] = useState("");
  const [loadingState, setLoadingState] = useState("idle"); // idle, analyzing, generating, success, error
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerate = async () => {
    if (!pathName) {
      setErrorMsg("Please enter a Pathway Name above first.");
      setLoadingState("error");
      setTimeout(() => setLoadingState("idle"), 3000);
      return;
    }

    try {
      setErrorMsg("");
      setLoadingState("analyzing");
      
      // Simulate analysis phase for better UX
      await new Promise(r => setTimeout(r, 1500));
      setLoadingState("generating");

      const token = localStorage.getItem("edupath_token");
      const res = await axios.post(
        `${API_URL}/api/pathway/generate-suggestions`,
        { pathName, level, context },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success && res.data.topics) {
        setLoadingState("success");
        onTopicsGenerated(res.data.topics);
        setTimeout(() => setLoadingState("idle"), 2000);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || "Failed to generate AI topics.");
      setLoadingState("error");
      setTimeout(() => setLoadingState("idle"), 4000);
    }
  };

  return (
    <div className="rounded-[28px] border border-primary/20 bg-primary/5 p-6 shadow-sm mb-8 relative overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl mix-blend-multiply pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">AI Curriculum Generator</h3>
            <p className="text-[11px] text-slate-500">Let Gemini AI draft the learning topics for you.</p>
          </div>
        </div>

        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Optional: What specific technologies or focus areas should the AI include? (e.g. Focus on MERN stack, include testing...)"
          className="w-full rounded-2xl border-0 bg-white/80 px-4 py-3 text-sm text-slate-800 shadow-sm ring-1 ring-inset ring-black/5 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary transition-all mb-4 min-h-[80px]"
        />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loadingState !== "idle" && loadingState !== "error"}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 shadow-sm
              ${loadingState === "idle" ? "bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md" : ""}
              ${(loadingState === "analyzing" || loadingState === "generating") ? "bg-primary/70 text-white cursor-wait" : ""}
              ${loadingState === "success" ? "bg-emerald-500 text-white" : ""}
              ${loadingState === "error" ? "bg-red-500 text-white" : ""}
            `}
          >
            {loadingState === "idle" && <><Sparkles className="h-4 w-4" /> Generate with AI</>}
            {loadingState === "analyzing" && <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing context...</>}
            {loadingState === "generating" && <><Loader2 className="h-4 w-4 animate-spin" /> Generating topics...</>}
            {loadingState === "success" && <><CheckCircle className="h-4 w-4" /> Topics Generated!</>}
            {loadingState === "error" && <><AlertCircle className="h-4 w-4" /> Error</>}
          </button>
          
          {errorMsg && (
            <p className="text-xs text-red-500 font-medium animate-pulse">{errorMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}

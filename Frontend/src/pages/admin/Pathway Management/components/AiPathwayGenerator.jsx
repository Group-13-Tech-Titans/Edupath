import React, { useState } from "react";
import axios from "axios";
import { Sparkles, Loader2, CheckCircle, AlertCircle, Bot, Cpu } from "lucide-react";

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
    <div className="relative overflow-hidden rounded-[32px] border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8 shadow-sm mb-8 transition-all hover:shadow-md hover:border-primary/30 group">
      {/* Decorative gradient background animations */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl mix-blend-multiply pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />
      <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-blue-400/10 blur-2xl mix-blend-multiply pointer-events-none group-hover:scale-150 transition-all duration-1000" />
      
      {/* "Thinking" overlay animation when generating */}
      {(loadingState === "analyzing" || loadingState === "generating") && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -skew-x-12 translate-x-[-150%] animate-[shimmer_2s_infinite]" />
      )}
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30">
            <Bot className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">AI Pathway suggestions</h3>
            <p className="text-xs font-medium text-slate-500">support to build a pathway template.</p>
          </div>
        </div>

        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Optional: What specific technologies or focus areas should the AI include? (e.g. Focus on MERN stack, include unit testing...)"
          className="w-full rounded-2xl border-0 bg-white/60 backdrop-blur-md px-5 py-4 text-sm font-medium text-slate-800 shadow-inner ring-1 ring-inset ring-black/5 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary transition-all mb-6 min-h-[100px] resize-none"
        />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loadingState !== "idle" && loadingState !== "error"}
            className={`relative overflow-hidden flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-500 shadow-md min-w-[200px]
              ${loadingState === "idle" ? "bg-slate-800 text-white hover:bg-slate-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-800/20 active:scale-95" : ""}
              ${(loadingState === "analyzing" || loadingState === "generating") ? "bg-primary text-white cursor-wait scale-[0.98]" : ""}
              ${loadingState === "success" ? "bg-emerald-500 text-white scale-105" : ""}
              ${loadingState === "error" ? "bg-red-500 text-white" : ""}
            `}
          >
            {/* Thinking Background Pulse */}
            {(loadingState === "analyzing" || loadingState === "generating") && (
               <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            )}

            <div className="relative flex items-center gap-2 z-10">
              {loadingState === "idle" && <><Sparkles className="h-4 w-4 text-yellow-400" /> Generate </>}
              {loadingState === "analyzing" && <><Cpu className="h-4 w-4 animate-bounce text-blue-200" /> AI is Thinking...</>}
              {loadingState === "generating" && <><Loader2 className="h-4 w-4 animate-spin text-white" /> Crafting Steps...</>}
              {loadingState === "success" && <><CheckCircle className="h-4 w-4 text-white" /> Topics Ready!</>}
              {loadingState === "error" && <><AlertCircle className="h-4 w-4" /> Try Again</>}
            </div>
          </button>
          
          {errorMsg && (
            <p className="text-xs text-red-500 font-bold bg-red-50 px-3 py-1.5 rounded-full animate-pulse">{errorMsg}</p>
          )}
        </div>

      </div>
    </div>
  );
}

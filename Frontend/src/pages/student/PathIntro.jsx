import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";


export default function PathIntro() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-teal-100 to-emerald-50 text-slate-900 relative overflow-hidden">
      {/* soft bubbles */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/25 blur-3xl" />
        <div className="absolute top-20 -right-24 h-80 w-80 rounded-full bg-teal-400/25 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-emerald-300/25 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur shadow-xl overflow-hidden"
        >
          <div className="grid md:grid-cols-[320px_1fr]">
            {/* Left illustration panel */}
            <div className="relative bg-gradient-to-b from-emerald-500/10 to-teal-500/5 border-b md:border-b-0 md:border-r border-black/10 p-6">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white grid place-items-center shadow-lg">
                  <span className="font-black">E</span>
                </div>
                <div>
                  <p className="text-sm font-black leading-tight">EduPath</p>
                  <p className="text-xs font-bold text-slate-600 leading-tight">
                    AI Path Selector
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-extrabold text-emerald-900">
                  QUICK START
                </p>
                <h2 className="mt-2 text-xl font-black leading-snug">
                  Find a career path that fits your passion.
                </h2>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  Answer a few questions (2–3 minutes). We’ll recommend multiple
                  career paths and a step-by-step learning plan.
                </p>
              </div>

              {/* Illustration placeholder */}
              <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 shadow-lg overflow-hidden">
                <div className="h-44 bg-gradient-to-br from-emerald-500/15 to-teal-500/10 flex items-center justify-center">
                  <span className="text-5xl">🧭</span>
                </div>
                <div className="p-4">
                  <p className="text-sm font-black">AI Recommendations</p>
                  <p className="mt-1 text-xs font-bold text-slate-600">
                    Based on interests, education level, and preferences.
                  </p>
                </div>
              </div>

              <div className="mt-6 text-xs font-bold text-slate-600">
                Need help? <span className="font-black">Ask EduPath AI</span>
              </div>
            </div>

            {/* Right content */}
            <div className="p-6 md:p-10">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.45 }}
                className="text-2xl md:text-3xl font-black tracking-tight"
              >
                Choose how you want to start
              </motion.h1>
              <p className="mt-2 text-sm md:text-base font-semibold text-slate-700 max-w-2xl">
                You can take the questionnaire for automatic path suggestions,
                or skip and choose a career goal manually.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <motion.button
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/student/path-finder")}
                  className="rounded-3xl border border-emerald-500/25 bg-white/75 backdrop-blur shadow-lg p-5 text-left"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black">AI Path Finder</p>
                    <span className="text-xs font-extrabold rounded-full px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-900">
                      Recommended
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Answer questions → get 2–5 best paths + stepstones.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-extrabold text-white shadow-lg">
                    Start questionnaire →
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/student/career-goals")}
                  className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-lg p-5 text-left"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black">Manual Goal Select</p>
                    <span className="text-xs font-extrabold rounded-full px-3 py-1 bg-black/5 border border-black/10 text-slate-700">
                      Skip
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Browse goals like Web Dev, UI/UX, Data, QA, Cloud.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-white/80 px-4 py-2 text-sm font-extrabold text-emerald-950 shadow-sm">
                    Choose goal →
                  </div>
                </motion.button>
              </div>

              <div className="mt-8 rounded-3xl border border-black/10 bg-white/60 p-5">
                <p className="text-sm font-black">What you get</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {[
                    { t: "2–5 Path Matches", d: "Ranked suggestions" },
                    { t: "Stepstones", d: "Topic order + courses" },
                    { t: "Milestones", d: "Quizzes + cert prompts" },
                  ].map((x) => (
                    <div
                      key={x.t}
                      className="rounded-2xl border border-black/10 bg-white/75 p-4 shadow-sm"
                    >
                      <p className="text-sm font-black">{x.t}</p>
                      <p className="text-xs font-bold text-slate-600 mt-1">
                        {x.d}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-xs font-bold text-slate-600">
                By continuing, you agree to Terms & Privacy.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
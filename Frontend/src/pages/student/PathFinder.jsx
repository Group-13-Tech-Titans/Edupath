import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";


const QUESTIONS = [
  {
    id: "edu",
    title: "What is your education level?",
    subtitle: "This helps us match the right starting stepstones.",
    type: "single",
    options: [
      { label: "O/L", value: "ol" },
      { label: "A/L", value: "al" },
      { label: "Undergraduate", value: "ug" },
      { label: "Graduate", value: "grad" },
    ],
  },
  {
    id: "interest",
    title: "Which topics excite you most?",
    subtitle: "Pick one to start (you can change later).",
    type: "single",
    options: [
      { label: "Building websites", value: "web" },
      { label: "Design & creativity", value: "design" },
      { label: "Data & analysis", value: "data" },
      { label: "Cloud & DevOps", value: "devops" },
    ],
  },
  {
    id: "style",
    title: "How do you prefer learning?",
    subtitle: "We’ll tune your path recommendations.",
    type: "single",
    options: [
      { label: "Hands-on projects", value: "projects" },
      { label: "Short lessons", value: "short" },
      { label: "Deep theory", value: "theory" },
      { label: "Mixed style", value: "mixed" },
    ],
  },
  {
    id: "goal",
    title: "What’s your target outcome?",
    subtitle: "Choose the goal you want to reach first.",
    type: "single",
    options: [
      { label: "Web Developer", value: "webdev" },
      { label: "UI/UX Designer", value: "uiux" },
      { label: "Data Analyst", value: "analyst" },
      { label: "QA Engineer", value: "qa" },
    ],
  },
];

function getRecommendations(answers) {
  // simple rule-based mapping for prototype (can replace with AI later)
  const interest = answers.interest;
  const goal = answers.goal;

  const pool = [
    { title: "Web Developer", score: 0, steps: "HTML → CSS → JS → React → APIs", tag: "web" },
    { title: "UI/UX Designer", score: 0, steps: "Design Basics → Figma → UX → Portfolio", tag: "design" },
    { title: "Data Analyst", score: 0, steps: "Excel → SQL → Python → BI Tools", tag: "data" },
    { title: "QA Engineer", score: 0, steps: "Testing Basics → Test Cases → Automation → CI", tag: "qa" },
    { title: "DevOps Associate", score: 0, steps: "Linux → Git → Docker → CI/CD → Cloud", tag: "devops" },
  ];

  pool.forEach((p) => {
    if (interest && p.tag === interest) p.score += 50;
    if (goal && p.title.toLowerCase().includes(goal.replace("webdev","web").replace("uiux","ui").replace("analyst","analyst").replace("qa","qa")))
      p.score += 30;
    if (answers.style === "projects" && (p.tag === "web" || p.tag === "devops")) p.score += 10;
    if (answers.style === "theory" && p.tag === "data") p.score += 10;
  });

  return pool
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((p, idx) => ({ ...p, match: Math.min(95, 70 + p.score / 2 + idx * 3) }));
}

export default function PathFinder() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  const current = QUESTIONS[step];
  const progress = useMemo(() => Math.round(((step + 1) / QUESTIONS.length) * 100), [step]);

  const canNext = Boolean(answers[current?.id]);
  const recommendations = useMemo(() => getRecommendations(answers), [answers]);

  const selectOption = (qid, value) => setAnswers((p) => ({ ...p, [qid]: value }));

  const next = () => {
    if (step < QUESTIONS.length - 1) setStep((s) => s + 1);
    else setDone(true);
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-teal-100 to-emerald-50 text-slate-900 relative overflow-hidden">
      {/* bubbles like your sample UI */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="absolute top-24 right-14 h-56 w-56 rounded-full bg-teal-400/20 blur-2xl" />
        <div className="absolute bottom-10 left-1/2 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 relative z-10">
        <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-[320px_1fr]">
            {/* Left illustration panel (like image #1) */}
            <div className="relative bg-gradient-to-b from-emerald-500/10 to-teal-500/5 border-b md:border-b-0 md:border-r border-black/10 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white grid place-items-center shadow-lg">
                    <span className="font-black">E</span>
                  </div>
                  <div>
                    <p className="text-sm font-black leading-tight">EduPath</p>
                    <p className="text-xs font-bold text-slate-600 leading-tight">
                      Path Finder
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/student")}
                  className="text-xs font-extrabold rounded-full px-3 py-2 bg-white/75 border border-black/10 hover:bg-white"
                >
                  Exit
                </button>
              </div>

              <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 shadow-lg overflow-hidden">
                <div className="h-44 bg-gradient-to-br from-emerald-500/15 to-teal-500/10 flex items-center justify-center">
                  <span className="text-6xl">🧑‍💻</span>
                </div>
                <div className="p-4">
                  <p className="text-sm font-black">AI-powered matching</p>
                  <p className="mt-1 text-xs font-bold text-slate-600">
                    Your answers help us suggest the best career paths.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 p-4 shadow-lg">
                <p className="text-xs font-extrabold text-slate-700">Progress</p>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${done ? 100 : progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-600">
                  {done ? "Completed" : `Question ${step + 1} of ${QUESTIONS.length}`} • {done ? "100" : progress}%
                </p>
              </div>

              <div className="mt-6 text-xs font-bold text-slate-600">
                Tip: You can retake this later from your dashboard.
              </div>
            </div>

            {/* Right main card (like image #2) */}
            <div className="p-6 md:p-10">
              <AnimatePresence mode="wait">
                {!done ? (
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="mx-auto max-w-2xl"
                  >
                    <div className="text-center">
                      <p className="text-xs font-extrabold text-slate-600">
                        QUESTION {step + 1} / {QUESTIONS.length}
                      </p>
                      <h1 className="mt-2 text-xl md:text-2xl font-black tracking-tight">
                        {current.title}
                      </h1>
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        {current.subtitle}
                      </p>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {current.options.map((opt) => {
                        const active = answers[current.id] === opt.value;
                        return (
                          <motion.button
                            key={opt.value}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => selectOption(current.id, opt.value)}
                            className={`rounded-2xl border px-4 py-4 text-left shadow-sm transition backdrop-blur
                              ${active
                                ? "border-emerald-500/30 bg-emerald-500/10"
                                : "border-black/10 bg-white/70 hover:bg-white/80"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-black text-slate-900">{opt.label}</p>
                              <span
                                className={`h-3 w-3 rounded-full border ${
                                  active ? "bg-emerald-500 border-emerald-600" : "bg-white border-black/20"
                                }`}
                              />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                      <button
                        onClick={back}
                        disabled={step === 0}
                        className={`rounded-full px-5 py-2 text-sm font-extrabold border transition
                          ${step === 0
                            ? "bg-white/40 border-black/10 text-slate-400 cursor-not-allowed"
                            : "bg-white/75 border-black/10 text-slate-800 hover:bg-white"
                          }`}
                      >
                        ← Back
                      </button>

                      <button
                        onClick={next}
                        disabled={!canNext}
                        className={`rounded-full px-6 py-2 text-sm font-extrabold shadow-lg transition
                          ${canNext
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-95"
                            : "bg-white/50 text-slate-400 border border-black/10 cursor-not-allowed"
                          }`}
                      >
                        {step === QUESTIONS.length - 1 ? "Finish →" : "Next →"}
                      </button>
                    </div>

                    {/* mini preview of recommendation (subtle) */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="mt-8 rounded-3xl border border-black/10 bg-white/60 p-5"
                    >
                      <p className="text-sm font-black">Live preview</p>
                      <p className="mt-1 text-xs font-bold text-slate-600">
                        Based on your current answers, top suggestion:
                      </p>
                      <p className="mt-2 text-sm font-extrabold text-emerald-900">
                        {recommendations[0]?.title || "—"}{" "}
                        <span className="text-slate-600 font-black">
                          • {recommendations[0]?.match || 0}% match
                        </span>
                      </p>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mx-auto max-w-3xl"
                  >
                    <div className="text-center">
                      <p className="text-xs font-extrabold text-slate-600">
                        RESULTS
                      </p>
                      <h1 className="mt-2 text-2xl md:text-3xl font-black tracking-tight">
                        Your best career path matches
                      </h1>
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        Choose one to generate your step-by-step learning pathway.
                      </p>
                    </div>

                    <div className="mt-7 grid gap-4 md:grid-cols-3">
                      {recommendations.map((r) => (
                        <motion.button
                          key={r.title}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            // Save selection for later usage
                            localStorage.setItem("edupath_selected_path", JSON.stringify(r));
                            navigate("/student"); // or /student/pathway if you have it
                          }}
                          className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-xl p-5 text-left"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-black">{r.title}</p>
                            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-900">
                              {r.match}% match
                            </span>
                          </div>
                          <p className="mt-2 text-xs font-bold text-slate-600">
                            Suggested stepstones:
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-700">
                            {r.steps}
                          </p>
                          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-extrabold text-white shadow-lg">
                            Select path →
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                      <button
                        onClick={() => {
                          setDone(false);
                          setStep(0);
                          setAnswers({});
                        }}
                        className="rounded-full border border-black/10 bg-white/75 px-6 py-3 text-sm font-extrabold text-slate-800 hover:bg-white shadow-sm"
                      >
                        Retake questionnaire
                      </button>
                      <button
                        onClick={() => navigate("/student/career-goals")}
                        className="rounded-full border border-emerald-500/25 bg-white/75 px-6 py-3 text-sm font-extrabold text-emerald-950 hover:bg-white shadow-sm"
                      >
                        Choose goal manually
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
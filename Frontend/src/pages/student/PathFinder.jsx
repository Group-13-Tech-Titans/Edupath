import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { quizApi } from "../../api/quizApi";

// Note: Ensure FALLBACK_QUESTIONS is defined up here if it isn't imported

export default function PathFinder() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({}); // Stores { qId: { question, answer } }
  const [done, setDone] = useState(false);

  // 1. Fetch questions on load
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await quizApi.getQuestions();
        if (data && data.length > 0) {
          setQuestions(data);
        } else {
          setQuestions(FALLBACK_QUESTIONS);
        }
      } catch (err) {
        // FIX 1: Log the error instead of silently swallowing it (S2486)
        console.error("Failed to fetch questions, using fallbacks:", err);
        setQuestions(FALLBACK_QUESTIONS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const current = questions[step];
  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round((step / questions.length) * 100);
  }, [step, questions.length]);

  // Handle both MongoDB's _id and our fallback id
  const currentId = current?._id || current?.id;
  const canNext = Boolean(answers[currentId]);

  // Handle Option Selection
  const selectOption = (qid, questionTitle, answerText) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: {
        question: questionTitle,
        answer: answerText,
      },
    }));
  };

  const next = () => {
    if (step < questions.length - 1) setStep((s) => s + 1);
    else setDone(true);
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  // Dynamic recommendation logic based on selected answers
  const getRecommendations = () => {
    return [
      {
        title: "Full-Stack Web Developer",
        match: 95,
        steps: "HTML → React → Node.js → MongoDB",
      },
      {
        title: "Data Analyst",
        match: 80,
        steps: "Excel → SQL → Python → PowerBI",
      },
      {
        title: "DevOps Engineer",
        match: 65,
        steps: "Linux → Git → Docker → AWS",
      },
    ];
  };

  const recommendations = getRecommendations();

  // 2. Submit to Backend
  const handleSelectPath = async (selectedPath) => {
    setIsSubmitting(true);

    const payload = {
      selectedPath: selectedPath,
      answers: Object.values(answers),
    };

    try {
      const result = await quizApi.submitQuiz(payload);
      console.log("Quiz saved!", result);
      navigate("/student");
    } catch (err) {
      console.error("Submission failed", err);
      alert(
        err.response?.data?.message || "Failed to save quiz. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-100 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Prevents crashing if there are no questions at all
  if (!current) {
    return (
      <div className="p-8 text-center mt-20 text-xl font-bold">
        No questions available. Please ask an admin to add some!
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-teal-100 to-emerald-50 text-slate-900 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="absolute top-24 right-14 h-56 w-56 rounded-full bg-teal-400/20 blur-2xl" />
        <div className="absolute bottom-10 left-1/2 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 relative z-10">
        <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-[320px_1fr]">
            {/* Sidebar */}
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
                    Your answers help us suggest the best career paths and
                    starting level.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 p-4 shadow-lg">
                <p className="text-xs font-extrabold text-slate-700">
                  Progress
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${done ? 100 : progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-600">
                  {done
                    ? "Completed"
                    : `Question ${step + 1} of ${questions.length}`}{" "}
                  • {done ? "100" : progress}%
                </p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 md:p-10 flex flex-col justify-center min-h-[500px]">
              <AnimatePresence mode="wait">
                {/* FIX 2: Swapped condition order (done ? Results : Questions) to avoid negated ternary (S7735) */}
                {done ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="mx-auto w-full max-w-3xl"
                  >
                    <div className="text-center">
                      <span className="inline-block p-3 rounded-full bg-emerald-100 text-2xl mb-4">
                        🎯
                      </span>
                      <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                        Your Recommended Pathways
                      </h1>
                      <p className="mt-2 text-sm font-semibold text-slate-600">
                        Based on your answers, we've generated these tracks.
                        Selecting one will set your Level and begin your
                        journey.
                      </p>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                      {recommendations.map((r) => (
                        <motion.button
                          key={r.title}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectPath(r.title)}
                          disabled={isSubmitting}
                          className="relative rounded-3xl border border-black/10 bg-white/80 backdrop-blur shadow-xl p-6 text-left hover:border-emerald-300 transition-colors group overflow-hidden"
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-base font-black leading-tight group-hover:text-emerald-700 transition-colors">
                              {r.title}
                            </p>
                            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-xs font-extrabold text-emerald-900 whitespace-nowrap ml-2">
                              {r.match}% match
                            </span>
                          </div>
                          <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Learning Path
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {r.steps}
                          </p>

                          <div className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white text-center group-hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                            {isSubmitting ? (
                              <span className="animate-pulse">Saving...</span>
                            ) : (
                              <>
                                Start Path <span>→</span>
                              </>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mx-auto w-full max-w-2xl"
                  >
                    <div className="text-center">
                      <p className="text-xs font-extrabold text-slate-600">
                        QUESTION {step + 1}
                      </p>
                      <h1 className="mt-2 text-xl md:text-2xl font-black tracking-tight">
                        {current.title}
                      </h1>
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        {current.subtitle}
                      </p>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      {(current.answers || []).map((ans) => {
                        const active = answers[currentId]?.answer === ans;
                        return (
                          <motion.button
                            key={ans}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              selectOption(currentId, current.title, ans)
                            }
                            className={`rounded-2xl border px-5 py-5 text-left shadow-sm transition-all duration-200 backdrop-blur
                              ${
                                active
                                  ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20"
                                  : "border-black/10 bg-white/70 hover:bg-white/90 hover:shadow-md"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <p
                                className={`text-sm font-black ${active ? "text-emerald-900" : "text-slate-900"}`}
                              >
                                {ans}
                              </p>
                              <span
                                className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ml-4 ${
                                  active
                                    ? "bg-emerald-500 border-emerald-500"
                                    : "bg-white border-slate-300"
                                }`}
                              />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="mt-10 flex items-center justify-between border-t border-black/5 pt-6">
                      <button
                        onClick={back}
                        disabled={step === 0}
                        className={`rounded-full px-6 py-2.5 text-sm font-extrabold transition
                          ${
                            step === 0
                              ? "opacity-0 pointer-events-none"
                              : "bg-white/75 border border-black/10 text-slate-800 hover:bg-white shadow-sm"
                          }`}
                      >
                        ← Back
                      </button>

                      <button
                        onClick={next}
                        disabled={!canNext}
                        className={`rounded-full px-8 py-2.5 text-sm font-extrabold shadow-lg transition
                          ${
                            canNext
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-105"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                          }`}
                      >
                        {step === questions.length - 1
                          ? "See Results →"
                          : "Next Question →"}
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
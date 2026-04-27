import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import PageShell from "../../components/PageShell.jsx"; // Adjust path if needed

const StudentStepDetail = () => {
  const { stepOrder } = useParams(); // Gets the step number from the URL
  const navigate = useNavigate();

  const [pathway, setPathway] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  const [quizAnswers, setQuizAnswers] = useState({}); // Stores student's selected answers { qIndex: selectedOptIndex }
  const [quizScore, setQuizScore] = useState(null); // Score percentage
  const [quizPassed, setQuizPassed] = useState(false);
  const [showQuizErrors, setShowQuizErrors] = useState(false);

  useEffect(() => {
    fetchStepData();
  }, [stepOrder]);

  const fetchStepData = async () => {
    try {
      const token = localStorage.getItem("edupath_token");
      const { data } = await axios.get("http://localhost:5000/api/pathway/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.hasPathway) {
        setPathway(data.pathway);
        // Find the specific step the user is trying to access
        const step = data.pathway.steps.find(
          (s) => s.order === parseInt(stepOrder),
        );

        if (!step) {
          setError("Step not found.");
        } else if (!step.isUnlocked) {
          setError(
            "This step is currently locked. Complete previous steps first!",
          );
        } else {
          setCurrentStep(step);
        }
      } else {
        setError("No pathway found. Please enroll first.");
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load step details.");
      setLoading(false);
    }
  };

  const handleCompleteAndContinue = async () => {
    try {
      setCompleting(true);
      const token = localStorage.getItem("edupath_token");

      await axios.post(
        "http://localhost:5000/api/pathway/complete-step",
        { pathwayId: pathway._id, stepOrder: currentStep.order },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Successfully completed! Send them back to the pathway map to see the animation
      navigate("/student/journey");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to mark as complete");
      setCompleting(false);
    }
  };

  if (loading)
    return (
      <PageShell>
        <div className="p-10 text-center">Loading Content...</div>
      </PageShell>
    );

  if (error)
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-50 text-red-600 rounded-2xl text-center">
          <p className="font-bold text-lg mb-4">{error}</p>
          <Link
            to="/student/journey"
            className="text-primary underline font-bold"
          >
            Return to Map
          </Link>
        </div>
      </PageShell>
    );

  const handleSubmitQuiz = () => {
    if (!currentStep.quiz || currentStep.quiz.length === 0) return;

    // Check if all questions are answered
    if (Object.keys(quizAnswers).length < currentStep.quiz.length) {
      setShowQuizErrors(true);
      return;
    }

    let correctCount = 0;
    currentStep.quiz.forEach((q, index) => {
      if (quizAnswers[index] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const percentage = (correctCount / currentStep.quiz.length) * 100;
    setQuizScore(percentage);
    setShowQuizErrors(false);

    if (percentage >= 50) {
      setQuizPassed(true);
    }
  };

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto pb-12 space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-black/5">
          <Link
            to="/student/journey"
            className="text-primary font-bold hover:underline flex items-center gap-2"
          >
            <span>←</span> Back to Map
          </Link>
          <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">
            Step {String(currentStep.order).padStart(2, "0")} of{" "}
            {pathway.steps.length}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-[28px] p-8 shadow-md border border-gray-100">
          <div className="mb-6">
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {currentStep.type}
            </span>
            <h1 className="text-3xl font-bold text-slate-800 mt-4 mb-2">
              {currentStep.title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          <hr className="border-gray-100 my-8" />

          {/* 🟢 UPDATED: Learning Resource Section */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Learning Materials
            </h3>

            {currentStep.resources && currentStep.resources.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {currentStep.resources.map((res, i) => (
                  <a
                    key={i}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-primary transition-all group"
                  >
                    <span className="font-semibold text-sm text-slate-700 group-hover:text-primary">
                      {res.title || "External Resource"}
                    </span>
                    <span className="text-gray-400 group-hover:text-primary transition-colors">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No external resources provided for this step.
              </p>
            )}

            {/* Fallback for old legacy data that might still use the string format */}
            {currentStep.resource &&
              (!currentStep.resources ||
                currentStep.resources.length === 0) && (
                <a
                  href={currentStep.resource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex mt-3 bg-slate-800 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-slate-700 transition-colors"
                >
                  Open Legacy Resource ↗
                </a>
              )}
          </div>

          {/* 🟢 NEW: QUIZ SECTION */}
          {currentStep.quiz && currentStep.quiz.length > 0 && !currentStep.isCompleted && (
            <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-slate-100 shadow-sm mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Step Assessment</h3>
              <p className="text-slate-500 text-sm mb-6">You must score at least 50% on this quiz to complete the step.</p>

              <div className="space-y-8">
                {currentStep.quiz.map((q, qIndex) => (
                  <div key={qIndex} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <p className="font-semibold text-slate-800 mb-4"><span className="text-primary mr-2">Q{qIndex + 1}.</span>{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => (
                        <label
                          key={optIndex}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${quizAnswers[qIndex] === optIndex ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-slate-200 hover:border-primary/50'}`}
                        >
                          <input
                            type="radio"
                            name={`q-${qIndex}`}
                            value={optIndex}
                            checked={quizAnswers[qIndex] === optIndex}
                            onChange={() => setQuizAnswers(prev => ({ ...prev, [qIndex]: optIndex }))}
                            className="w-4 h-4 text-primary focus:ring-primary mr-3"
                          />
                          <span className="text-sm text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {showQuizErrors && (
                <p className="text-red-500 font-bold text-sm mt-4 text-center">Please answer all questions before submitting!</p>
              )}

              {quizScore !== null && (
                <div className={`mt-6 p-4 rounded-xl text-center font-bold ${quizPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  You scored {quizScore}%! {quizPassed ? 'Great job!' : 'You need 50% to pass. Please try again.'}
                </div>
              )}

              {!quizPassed && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleSubmitQuiz}
                    className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-slate-700 transition-all active:scale-95"
                  >
                    Submit Quiz
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Completion Action */}
          <div className="flex flex-col items-center justify-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100 mt-10">
            {currentStep.isCompleted ? (
              <>
                <h3 className="text-emerald-800 font-bold mb-4">Step Completed</h3>
                <div className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-md flex items-center gap-2">
                  <span>⭐</span> Completed
                </div>
              </>
            ) : (
              <>
                {(!currentStep.quiz || currentStep.quiz.length === 0 || quizPassed) ? (
                  <>
                    <h3 className="text-emerald-800 font-bold mb-2">Ready to move on?</h3>
                    <p className="text-emerald-600 text-sm mb-6 text-center">Mark this step as complete to unlock the next part of your journey.</p>
                    <button
                      onClick={handleCompleteAndContinue}
                      disabled={completing}
                      className="bg-primary text-white px-10 py-4 rounded-full font-black text-lg shadow-xl hover:brightness-95 hover:scale-105 transition-all active:scale-95 disabled:opacity-70"
                    >
                      {completing ? "SAVING..." : "MARK COMPLETE & CONTINUE"}
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-emerald-800 font-bold mb-2">Quiz Required</h3>
                    <p className="text-emerald-600 text-sm text-center opacity-70">Pass the quiz above to unlock the completion button.</p>
                    <button disabled className="mt-4 bg-slate-300 text-slate-500 px-10 py-4 rounded-full font-black text-lg cursor-not-allowed">
                      LOCKED
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default StudentStepDetail;

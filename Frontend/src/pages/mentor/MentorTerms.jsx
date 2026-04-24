import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "../../context/AppProvider.jsx";

export default function MentorTerms() {
  const navigate = useNavigate();
  const { updateUserProfile } = useApp();
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!accepted) return;
    setIsSubmitting(true);
    
    try {
      // 🟢 4. Update the database flag!
      await updateUserProfile({ isMentor: true }); 
      navigate("/mentor"); // Go to mentor dashboard
    } catch (err) {
      alert("Failed to register as mentor. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-400 text-white shadow-lg shadow-teal-100 mb-4">
            <ShieldCheckIcon />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Mentor Terms & Conditions
          </h1>
          <p className="mt-3 text-lg text-slate-500">
            Please review and accept our guidelines to begin your mentoring journey.
          </p>
        </div>

        {/* Terms Container */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="max-h-[500px] overflow-y-auto p-8 sm:p-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-teal-600 text-xs font-bold">1</span>
                  Professional Conduct
                </h3>
                <p>
                  As a mentor on Edupath, you represent our community of educators. You agree to maintain the highest standards of professional conduct, ethics, and respect in all interactions with students. Harassment, discrimination, or inappropriate behavior of any kind will result in immediate termination of your mentor status.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-teal-600 text-xs font-bold">2</span>
                  Commitment & Availability
                </h3>
                <p>
                  Mentoring requires dedication. By accepting these terms, you commit to providing timely responses (ideally within 24-48 hours) to session requests and messages. You agree to keep your availability calendar up to date to provide an accurate experience for students seeking guidance.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-teal-600 text-xs font-bold">3</span>
                  Intellectual Property
                </h3>
                <p>
                  Any resources, guides, or materials you share on the platform remain your intellectual property. However, by sharing them, you grant Edupath a non-exclusive license to host and distribute these materials to students enrolled in your mentorship program.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-teal-600 text-xs font-bold">4</span>
                  Privacy & Confidentiality
                </h3>
                <p>
                  You agree to protect the privacy of your students. Do not share student data, contact information, or personal discussions outside of the Edupath platform unless explicitly permitted by the student and in accordance with local privacy laws.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-teal-600 text-xs font-bold">5</span>
                  Quality Assurance
                </h3>
                <p>
                  Edupath reserves the right to review mentor performance based on student feedback and platform engagement metrics. We strive for excellence, and consistent low ratings or inactivity may lead to a review of your mentor status.
                </p>
              </section>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50/50 border-t border-slate-100 p-8 sm:p-10">
            <div className="flex items-start gap-3 mb-8">
              <div className="flex h-6 items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-teal-500 focus:ring-teal-400 transition-all cursor-pointer"
                />
              </div>
              <label htmlFor="terms" className="text-sm font-medium text-slate-600 cursor-pointer select-none">
                I have read, understood, and agree to the Mentor Terms and Conditions. I understand that my role as a mentor is subject to these guidelines.
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={!accepted || isSubmitting}
                onClick={handleAccept}
                className={`flex-1 rounded-2xl px-6 py-4 text-sm font-extrabold text-white transition-all shadow-lg ${
                  accepted 
                    ? "bg-teal-400 hover:bg-teal-500 shadow-teal-100 active:scale-[0.98]" 
                    : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                Accept & Become a Mentor
              </button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Last updated: April 20, 2026. If you have any questions, please contact support@edupath.com.
        </p>
      </motion.div>
    </div>
  );
}

function ShieldCheckIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

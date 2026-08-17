import React from "react";

export default function LandingFooter({ onNav }) {
  const go = (id) => (e) => {
    e.preventDefault();
    onNav?.(id);
  };

  return (
    <footer className="px-4 pb-10 pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[28px] border border-black/5 bg-emerald-50/60 shadow-[0_18px_60px_rgba(0,0,0,0.05)] backdrop-blur">
          <div className="grid gap-8 px-6 py-8 sm:px-10 md:grid-cols-3">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700">
                  🎓
                </div>
                <div className="leading-tight">
                  <p className="text-base font-semibold text-slate-900">EduPath</p>
                  <p className="text-sm text-slate-500">
                    AI Paths • Verified Learning • Career Growth
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-600">
                Learn smarter with pathways, verified courses, quizzes, and mentor guidance.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-sm font-semibold text-slate-900">Navigate</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><a href="#home" onClick={go("home")} className="hover:text-emerald-700">Home</a></li>
                <li><a href="#pathways" onClick={go("pathways")} className="hover:text-emerald-700">Pathways</a></li>
                <li><a href="#courses" onClick={go("courses")} className="hover:text-emerald-700">Courses</a></li>
                <li><a href="#why" onClick={go("why")} className="hover:text-emerald-700">Why EduPath</a></li>
                <li><a href="#contact" onClick={go("contact")} className="hover:text-emerald-700">Contact</a></li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <p className="text-sm font-semibold text-slate-900">Help</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><a href="#contact" onClick={go("contact")} className="hover:text-emerald-700">Support</a></li>
                <li><a href="#contact" onClick={go("contact")} className="hover:text-emerald-700">FAQs</a></li>
                <li><a href="#contact" onClick={go("contact")} className="hover:text-emerald-700">Contact us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-black/5 px-6 py-4 sm:px-10">
            <p className="text-center text-sm text-slate-500">
              © 2026 EduPath. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

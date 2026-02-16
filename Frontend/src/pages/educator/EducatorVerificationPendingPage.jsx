// src/pages/VerificationPending.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";

export default function EducatorVerificationPendingPage() {
  const navigate = useNavigate();

  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh)] items-center justify-center bg-gradient-to-b from-emerald-200 via-teal-200 to-cyan-200 px-4 py-10">
        <div className="w-full max-w-xl rounded-[32px] bg-white/85 p-8 shadow-2xl shadow-emerald-300/50 backdrop-blur">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-200 to-teal-200 shadow-md">
            <span className="text-2xl">⏳</span>
          </div>

          {/* Title */}
          <div className="mt-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Verification Pending
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Your educator application has been received. Our team is reviewing
              your credentials and documents.
            </p>
          </div>

          {/* Status box */}
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-emerald-200" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  Status: Under Review
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  This usually takes 1–3 business days. You’ll get an email once
                  your educator account is approved.
                </p>
              </div>
            </div>
          </div>

          {/* Mini progress */}
          <div className="mt-6 flex items-center justify-center">
            <div className="h-2 w-40 rounded-full bg-emerald-100">
              <div className="h-2 w-10 rounded-full bg-emerald-400" />
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => navigate("/login")}
            className="mt-8 w-full rounded-full bg-emerald-300 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-300/40 transition hover:bg-emerald-400 active:scale-[0.99]"
          >
            Back to Login
          </button>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Need help?{" "}
            <Link
              to="/support"
              className="font-semibold text-emerald-600 hover:underline"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

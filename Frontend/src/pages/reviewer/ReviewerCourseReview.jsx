import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const DECISIONS = [
  {
    value: "approved",
    label: "Approve",
    description: "Course meets all quality standards.",
    color: "border-primary/40 bg-primary/5 text-primary",
    active: "border-primary bg-primary/10 text-primary ring-2 ring-primary/20",
  },
  {
    value: "minor_changes",
    label: "Minor Changes",
    description: "Small fixes needed before publishing.",
    color: "border-amber-200 bg-amber-50/50 text-amber-700",
    active: "border-amber-400 bg-amber-50 text-amber-700 ring-2 ring-amber-200",
  },
  {
    value: "major_changes",
    label: "Major Changes",
    description: "Significant revisions required.",
    color: "border-orange-200 bg-orange-50/50 text-orange-700",
    active: "border-orange-400 bg-orange-50 text-orange-700 ring-2 ring-orange-200",
  },
  {
    value: "rejected",
    label: "Reject",
    description: "Course does not meet requirements.",
    color: "border-rose-200 bg-rose-50/50 text-rose-600",
    active: "border-rose-400 bg-rose-50 text-rose-600 ring-2 ring-rose-200",
  },
];

const StarRating = ({ rating, onChange }) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: 5 }).map((_, i) => {
      const val = i + 1;
      const filled = val <= rating;
      return (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val)}
          className={`text-2xl transition-transform hover:scale-110 ${
            filled ? "text-amber-400" : "text-slate-200 hover:text-amber-200"
          }`}
          aria-label={`Rate ${val} star${val !== 1 ? "s" : ""}`}
        >
          ★
        </button>
      );
    })}
    {rating > 0 && (
      <span className="ml-2 text-xs font-semibold text-muted">{rating} / 5</span>
    )}
  </div>
);

const ReviewerCourseReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { courses, submitReviewDecision } = useApp();

  const typeFromQuery = searchParams.get("type") || "course";
  const stateItem = location.state?.reviewItem;
  const course = courses.find((c) => c.id === id);

  const reviewItem = useMemo(() => {
    if (typeFromQuery === "course") {
      if (!course) return null;
      return {
        id: course.id,
        type: "course",
        title: course.title,
        subjectDomain: course.subject || course.category || "General",
        description: course.description || "",
      };
    }
    if (stateItem && String(stateItem.id) === String(id)) return stateItem;
    return null;
  }, [course, id, stateItem, typeFromQuery]);

  const [decision, setDecision] = useState("approved");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!reviewItem) {
    return (
      <PageShell>
        <div className="glass-card p-10 text-center">
          <p className="text-sm font-medium text-muted">Review item not found.</p>
          <button
            type="button"
            onClick={() => navigate("/reviewer")}
            className="btn-soft mt-4 px-5 py-2 text-xs"
          >
            ← Back to Dashboard
          </button>
        </div>
      </PageShell>
    );
  }

  const onCancel = () => navigate("/reviewer", { replace: true });

  const onSubmit = async () => {
    if (!notes.trim()) { setError("Review notes are required before submitting."); return; }
    if (rating < 1 || rating > 5) { setError("Please select a star rating (1–5)."); return; }
    setError("");
    setSubmitting(true);
    const result = await submitReviewDecision({ itemId: reviewItem.id, decision, rating, notes: notes.trim() });
    setSubmitting(false);
    if (!result.success) { setError(result.message || "Failed to submit review. Please try again."); return; }
    navigate("/reviewer", { replace: true });
  };

  const selectedDecision = DECISIONS.find((d) => d.value === decision);
  const contentLinkTo = `/reviewer/queue/${reviewItem.id}/content`;

  return (
    <PageShell>
      <div className="space-y-6">

        {/* Back + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-text-dark transition"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Queue
          </button>
          <span className="text-muted text-xs">/</span>
          <span className="text-xs text-text-dark font-medium truncate max-w-xs">{reviewItem.title}</span>
        </div>

        {/* Course summary */}
        <div className="glass-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[11px] font-semibold text-primary">
                {reviewItem.subjectDomain}
              </span>
              <h1 className="mt-2 text-xl font-semibold text-text-dark">{reviewItem.title}</h1>
            </div>
            <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[11px] font-semibold text-amber-700">
              Pending Review
            </span>
          </div>

          {/* Description */}
          <div className="mt-5 rounded-2xl border border-black/8 bg-white/60 p-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Description</p>
            <p className="text-sm text-text-dark leading-relaxed">
              {reviewItem.description?.trim() || "No description provided for this course."}
            </p>
          </div>

          {/* Content link */}
          <div className="mt-4 rounded-2xl border border-black/8 bg-white/60 p-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Course Content</p>
            <Link
              to={contentLinkTo}
              state={{ reviewItem }}
              className="btn-primary px-6 py-2 text-xs"
            >
              Open Course Content →
            </Link>
          </div>
        </div>

        {/* Decision */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-text-dark mb-1">Your Decision</h2>
          <p className="text-xs text-muted mb-5">Select an outcome for this course review.</p>

          <div className="grid gap-3 sm:grid-cols-2">
            {DECISIONS.map((d) => {
              const isSelected = decision === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDecision(d.value)}
                  className={`rounded-2xl border-2 px-4 py-3 text-left transition ${
                    isSelected ? d.active : `border-black/10 bg-white/60 text-text-dark hover:border-black/20`
                  }`}
                >
                  <p className="text-sm font-semibold">{d.label}</p>
                  <p className={`mt-0.5 text-[11px] ${isSelected ? "" : "text-muted"}`}>{d.description}</p>
                </button>
              );
            })}
          </div>

          {selectedDecision && (
            <p className="mt-3 text-xs text-muted">
              Selected: <span className="font-semibold text-text-dark">{selectedDecision.label}</span> — {selectedDecision.description}
            </p>
          )}
        </div>

        {/* Rating & Notes */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="font-semibold text-text-dark">Rating & Feedback</h2>

          {/* Star rating */}
          <div>
            <label className="field-label">Quality Rating</label>
            <div className="mt-2">
              <StarRating rating={rating} onChange={setRating} />
            </div>
            {rating === 0 && (
              <p className="mt-1 text-[11px] text-muted">Click a star to rate this course.</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="field-label">
              Review Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="field-input mt-1 resize-none"
              placeholder="Provide detailed feedback for the educator — what's great, what needs improvement, and why you made this decision..."
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-[11px] text-muted">This feedback will be sent to the educator.</p>
              <p className="text-[11px] text-muted">{notes.length} chars</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="btn-outline px-6 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="btn-primary px-7 py-2 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default ReviewerCourseReview;

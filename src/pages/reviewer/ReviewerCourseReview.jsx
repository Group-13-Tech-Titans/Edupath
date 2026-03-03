import React, { useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const DECISIONS = [
  { value: "approved", label: "Approve" },
  { value: "minor_changes", label: "Minor Changes" },
  { value: "major_changes", label: "Major Changes" },
  { value: "rejected", label: "Reject" },
];

const Star = ({ filled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="text-2xl text-slate-600 hover:brightness-110"
  >
    {filled ? "★" : "☆"}
  </button>
);

const ReviewerCourseReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { courses, currentUser, submitReviewDecision } = useApp();

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

  if (!reviewItem) {
    return (
      <PageShell>
        <p className="text-sm text-muted">Review item not found.</p>
      </PageShell>
    );
  }

  // Cancel → Dashboard
  const onCancel = () => {
    navigate("/reviewer", { replace: true });
  };

  // Submit → Update + Dashboard
  const onSubmit = () => {
    if (!notes.trim()) {
      setError("Review notes are mandatory.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a rating (1–5).");
      return;
    }

    setError("");

    submitReviewDecision({
      itemId: reviewItem.id,
      itemType: reviewItem.type,
      decision,
      rating,
      notes: notes.trim(),
      reviewer: currentUser,
    });

    navigate("/reviewer", { replace: true });
  };


  const contentLinkTo = `/reviewer/queue/${reviewItem.id}?type=${reviewItem.type}&view=content`;

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6">
        {/* Review Summary */}
        <div className="mt-6 rounded-2xl bg-white px-6 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.15)]">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">
            Review Summary
          </h2>

          {/* Description Container */}
          <div className="rounded-2xl border border-slate-200 p-5 mb-5">
            <div className="text-sm font-bold text-slate-800 mb-2">
              Description
            </div>
            <p className="text-sm text-slate-600">
              {reviewItem.description?.trim()
                ? reviewItem.description
                : "(Placeholder) Description will appear here once wired to backend."}
            </p>
          </div>

          {/* Content Container */}
          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="text-sm font-bold text-slate-800 mb-3">
              Content
            </div>

            <Link
              to={contentLinkTo}
              state={{ reviewItem }}
              className="inline-flex items-center justify-center rounded-full border-2 border-emerald-300 bg-white px-6 py-2 text-sm font-extrabold text-emerald-700 shadow-[0_8px_14px_rgba(0,0,0,0.08)] active:scale-[0.98]"
            >
              Open Content
            </Link>
          </div>
        </div>

        {/* Reviewer Decision */}
        <div className="mt-6 rounded-2xl bg-white px-6 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.15)]">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">
            Reviewer Decision & Rating
          </h2>

          <select
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-lg font-semibold text-slate-700 outline-none"
          >
            {DECISIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          {/* Rating */}
          <div className="mt-5">
            <div className="text-sm font-bold text-slate-900">
              Reviewer Rating (1–5)
            </div>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const val = i + 1;
                return (
                  <Star
                    key={val}
                    filled={val <= rating}
                    onClick={() => setRating(val)}
                  />
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-5">
            <div className="text-sm font-bold text-slate-900">
              Review Notes (Mandatory)
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-300"
              placeholder="Write detailed review notes..."
            />
            {error && (
              <div className="mt-2 text-sm font-semibold text-rose-600">
                {error}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-slate-300 bg-white px-8 py-2.5 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSubmit}
              className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-8 py-2.5 text-sm font-extrabold text-white shadow-md active:scale-[0.98]"
            >
              Submit
            </button>
          </div>
        </div>

      </div>
    </PageShell>
  );
};

export default ReviewerCourseReview;

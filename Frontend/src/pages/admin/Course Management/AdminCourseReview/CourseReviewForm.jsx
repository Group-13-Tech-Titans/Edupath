import React from "react";
import { Star } from "lucide-react";

export default function CourseReviewForm({ 
  review, 
  handleInputChange, 
  handleStarClick, 
  submitReview, 
  isSubmitting 
}) {
  return (
    <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/30 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.04)] h-fit">
      <h2 className="text-lg font-bold text-emerald-900 mb-4">Admin Evaluation</h2>
      
      <div className="space-y-4">
        
        {/* Admin Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Admin Name</label>
            <input 
              type="text" 
              name="reviewerName" 
              value={review.reviewerName} 
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-100 text-slate-500 px-4 py-2.5 text-sm shadow-sm cursor-not-allowed focus:outline-none"
              title="Auto-filled from your logged-in account"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Admin Email</label>
            <input 
              type="email" 
              name="reviewerEmail" 
              value={review.reviewerEmail} 
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-100 text-slate-500 px-4 py-2.5 text-sm shadow-sm cursor-not-allowed focus:outline-none"
              title="Auto-filled from your logged-in account"
            />
          </div>
        </div>

        {/* Star Rating */}
        <div className="pt-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Assign Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                type="button" 
                onClick={() => handleStarClick(star)}
                className={`transition-transform hover:scale-110 ${review.rating >= star ? 'text-amber-400' : 'text-slate-300'}`}
              >
                <Star 
                  className="w-8 h-8" 
                  fill={review.rating >= star ? "currentColor" : "none"} 
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="pt-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Review Notes / Feedback</label>
          <textarea 
            name="notes" 
            value={review.notes} 
            onChange={handleInputChange}
            rows="4" 
            placeholder="Enter specific feedback, issues, or praise for the educator..."
            className="w-full rounded-2xl border border-white bg-white p-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
          ></textarea>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-emerald-200/50">
          <button
            onClick={() => submitReview("rejected")}
            disabled={isSubmitting}
            className="flex-1 rounded-2xl bg-red-100 py-3.5 font-bold text-red-600 hover:bg-red-200 transition disabled:opacity-50"
          >
            Reject Course
          </button>
          <button
            onClick={() => submitReview("approved")}
            disabled={isSubmitting}
            className="flex-1 rounded-2xl bg-emerald-500 py-3.5 font-bold text-white shadow-md hover:bg-emerald-600 transition disabled:opacity-50"
          >
            Approve Course
          </button>
        </div>

      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import PageShell from "../../../components/PageShell.jsx";
import AdminFooter from "../General Pages/AdminFooter.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminCourseReview() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // Review Form State (Name and Email will be auto-filled)
  const [review, setReview] = useState({
    reviewerName: "Loading...", 
    reviewerEmail: "Loading...", 
    rating: 0,
    notes: ""
  });

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  // 🟢 FIXED: Fetch both Course Details AND Current Admin Details
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Course Details
        const resCourse = await axios.get(`${API_URL}/api/auth/admin/courses/${id}`, getAuthHeader());
        setCourse(resCourse.data.course);

        // 2. Fetch Logged-in Admin Details
        const resUser = await axios.get(`${API_URL}/api/auth/me`, getAuthHeader());
        const adminUser = resUser.data.user;

        // Auto-fill the review state with actual admin details
        if (adminUser) {
          setReview(prev => ({
            ...prev,
            reviewerName: adminUser.name || "Admin",
            reviewerEmail: adminUser.email || "admin@edupath.com"
          }));
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load course details. It may have been deleted.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    setReview(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStarClick = (rateValue) => {
    setReview(prev => ({ ...prev, rating: rateValue }));
  };

  const submitReview = async (decision) => {
    if (decision === "approved" && review.rating === 0) {
      showToast("error", "Please provide a star rating before approving.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...review, decision };
      await axios.patch(`${API_URL}/api/auth/admin/courses/${id}/review`, payload, getAuthHeader());
      
      showToast("success", `Course successfully ${decision}!`);
      setTimeout(() => {
        navigate(-1); 
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Failed to submit review.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex h-64 items-center justify-center text-emerald-600 animate-pulse font-semibold">
          Loading course details...
        </div>
      </PageShell>
    );
  }

  if (error || !course) {
    return (
      <PageShell>
        <div className="p-10 text-center">
          <p className="text-red-500 font-semibold">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 rounded-full bg-slate-200 text-slate-700 font-bold hover:bg-slate-300">Go Back</button>
        </div>
      </PageShell>
    );
  }

  const renderContent = (content) => {
    if (!content || (typeof content === 'object' && Object.keys(content).length === 0)) {
      return <p className="text-sm text-slate-500">No content or files uploaded.</p>;
    }

    if (typeof content === 'string') {
      if (content.startsWith('http')) {
        return (
          <a href={content} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">
            View External Link ↗
          </a>
        );
      }
      return <p className="text-sm text-slate-600">{content}</p>;
    }

    if (typeof content === 'object' && content.items && Array.isArray(content.items)) {
      if (content.items.length === 0) {
        return <p className="text-sm text-slate-500">No files found in the content list.</p>;
      }

      return (
        <ul className="space-y-3">
          {content.items.map((item, index) => (
            <li key={item.id || index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate" title={item.name}>
                    {item.name || "Unnamed Document"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                      {item.format || item.type || "FILE"}
                    </span>
                    {item.bytes && (
                      <span className="text-[10px] text-slate-400">
                        {(item.bytes / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {item.url && (
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="shrink-0 px-4 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                >
                  Open ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <pre className="text-xs font-mono text-slate-700 bg-slate-100 p-2 rounded max-h-64 overflow-y-auto">
        {JSON.stringify(content, null, 2)}
      </pre>
    );
  };

  return (
    <PageShell>
      {toast && (
        <div className="fixed right-4 top-20 z-50">
          <div className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur bg-white/90 ${
            toast.type === "success" ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-600"
          }`}>
            {toast.text}
          </div>
        </div>
      )}

      <div className="space-y-6">
        
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white hover:bg-slate-100 shadow-sm transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-600"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Admin Course Review</h1>
            <p className="text-xs text-slate-500 mt-0.5">Evaluate the course content and provide your decision.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* LEFT SIDE: Course Details */}
          <div className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-sm space-y-5 h-fit">
            
            <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group cursor-pointer">
              <a href={course.thumbnailUrl || course.content} target="_blank" rel="noreferrer" title="Click to view full image">
                <img 
                  src={course.thumbnailUrl || "https://images.unsplash.com/photo-1515879218367-8466d910aaa4"} 
                  alt="Thumbnail" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                    View Full Image ↗
                  </span>
                </div>
              </a>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">{course.title}</h2>
              <p className="text-sm font-medium text-emerald-600 mt-1 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" /></svg>
                Educator: {course.educatorName || "Unknown"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Email: {course.createdByEducatorEmail}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <Pill label={course.category || "General"} />
              <Pill label={course.level || "Beginner"} />
              <Pill label={course.specializationTag || "No Specialization"} />
              <Pill label={`${course.duration || 0} Hours`} bg="bg-blue-50" text="text-blue-600" />
              <Pill label={`$${course.price || "Free"}`} bg="bg-amber-50" text="text-amber-600" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1.5">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {course.description || "No description provided."}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1.5">Course Content / Resources</h3>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 overflow-x-auto">
                <div className="text-sm text-slate-600 break-all">
                  {renderContent(course.content)}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Admin Review Form */}
          <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/30 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.04)] h-fit">
            <h2 className="text-lg font-bold text-emerald-900 mb-4">Admin Evaluation</h2>
            
            <div className="space-y-4">
              
              {/* 🟢 FIXED: Admin Details are now Read-Only and Auto-Filled */}
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
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Review Notes / Feedback</label>
                <textarea 
                  name="notes" value={review.notes} onChange={handleInputChange}
                  rows="4" placeholder="Enter specific feedback, issues, or praise for the educator..."
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
        </div>
      </div>
      <br/>
      <AdminFooter />
    </PageShell>
  );
}

function Pill({ label, bg = "bg-slate-100", text = "text-slate-600" }) {
  if (!label) return null;
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-black/5 shadow-sm ${bg} ${text}`}>
      {label}
    </span>
  );
}
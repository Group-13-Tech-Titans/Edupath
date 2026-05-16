import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import PageShell from "../../../../components/PageShell.jsx";
import AdminFooter from "../../../../components/layouts/admin-layouts/AdminFooter.jsx";

// Import Sub-components
import CourseReviewHeader from "./CourseReviewHeader";
import CourseDetailsPanel from "./CourseDetailsPanel";
import CourseReviewForm from "./CourseReviewForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Main page where an Admin reviews a specific course
export default function AdminCourseReview() {
  const { id } = useParams(); 
  const navigate = useNavigate();


  const [course, setCourse] = useState(null); // Store course data
  const [isLoading, setIsLoading] = useState(true); //show loading animation while fetching data
  const [isSubmitting, setIsSubmitting] = useState(false); //disable buttons while submitting review
  const [error, setError] = useState(""); // Store any error messages
  const [toast, setToast] = useState(null); // Used for small popup messages (success/error)

  // Stores the data for the review form (Name, Email, Stars, Notes)
  const [review, setReview] = useState({
    reviewerName: "Loading...", 
    reviewerEmail: "Loading...", 
    rating: 0,
    notes: ""
  });

  // Helper function to get the token form user browser storage 
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  //fetch data when page loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course details using the course ID 
        const resCourse = await axios.get(`${API_URL}/api/admin/courses/${id}`, getAuthHeader());
        setCourse(resCourse.data.course);

        //fetch currunt logged in admin detailes for auto filling the reviewer name and email
        const resUser = await axios.get(`${API_URL}/api/auth/me`, getAuthHeader());
        const adminUser = resUser.data.user;

        //auto fill the form with admin name and email
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
        setIsLoading(false); //stop loading animation
      }
    };
    
    fetchData();
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e) => setReview(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleStarClick = (rateValue) => setReview(prev => ({ ...prev, rating: rateValue }));

  // Prevent approving a course without giving a star rating
  const submitReview = async (decision) => {
    if (decision === "approved" && review.rating === 0) {
      showToast("error", "Please provide a star rating before approving.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Send the review decision and details to the backend
      const payload = { ...review, decision };
      await axios.patch(`${API_URL}/api/admin/courses/${id}/review`, payload, getAuthHeader());
      
      // Show success message 
      showToast("success", `Course successfully ${decision}!`);
      setTimeout(() => navigate(-1), 1500); // Navigate back after a 1.5 second delay
    } catch (err) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Failed to submit review.");
      setIsSubmitting(false); // Re-enable buttons if submission fails
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <PageShell>
        <div className="flex h-64 items-center justify-center text-emerald-600 animate-pulse font-semibold">
          Loading course details...
        </div>
      </PageShell>
    );
  }

  // 2. Error State
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

  // 3. Main Render
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
        
        {/* Header Component with Back Button */}
        <CourseReviewHeader onBack={() => navigate(-1)} />

        <div className="grid gap-6 lg:grid-cols-2">
          
          {/*Course Details */}
          <CourseDetailsPanel course={course} />

          {/*Review Form */}
          <CourseReviewForm 
            review={review}
            handleInputChange={handleInputChange}
            handleStarClick={handleStarClick}
            submitReview={submitReview}
            isSubmitting={isSubmitting}
          />

        </div>
      </div>
      <br/>
      {/* Admin Footer */}
      <AdminFooter />
    </PageShell>
  );
}
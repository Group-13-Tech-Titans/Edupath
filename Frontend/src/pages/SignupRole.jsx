/**
 * SIGNUP ROLE COMPONENT
 * The second step in the onboarding funnel. Allows a "pending" user
 * to select their role (Student or Educator) and re-issues their JWT.
 * Design Patterns: Progressive Profiling, State Synchronization.
 */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useApp } from "../context/AppProvider.jsx";

export default function SignupRole() {
  const navigate = useNavigate();
  const { setSession } = useApp(); // Grab setSession from Context
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // UI Error state

  // Fallback to localhost if environment variable is missing
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const chooseRole = async (role) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("edupath_token");
      if (!token) {
        return navigate("/login", { replace: true });
      }

      // Send the selection to the backend
      const res = await axios.post(
        `${API_URL}/api/auth/select-role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // The backend returns a new token and the updated user object. Use setSession to instantly update both LocalStorage AND React Context!
      if (res.data.token && res.data.user) {
        setSession(res.data.token, res.data.user);
      }

      // Go to the specific registration form based on their choice
      if (role === "student") navigate("/signup/student", { replace: true });
      if (role === "educator") navigate("/signup/educator", { replace: true });

    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Role selection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh)] items-center justify-center bg-gradient-to-b from-emerald-100 to-teal-200 px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] bg-white px-8 py-9 shadow-xl shadow-emerald-200/70 text-center">
        <h2 className="text-2xl font-semibold text-text-dark">Select your role</h2>
        <p className="mt-1 text-xs text-muted">Choose how you want to join EduPath.</p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-2 text-xs text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            disabled={loading}
            onClick={() => chooseRole("student")}
            className="w-full rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 shadow-lg shadow-emerald-200 disabled:opacity-60 transition-all"
          >
            {loading ? "Please wait..." : "Continue as Student"}
          </button>

          <button
            disabled={loading}
            onClick={() => chooseRole("educator")}
            className="w-full rounded-full bg-white border-2 border-emerald-500 text-emerald-600 font-bold py-3 hover:bg-emerald-50 disabled:opacity-60 transition-all"
          >
            {loading ? "Please wait..." : "Continue as Educator"}
          </button>
        </div>

        <p className="mt-6 text-xs text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-600 font-semibold underline-offset-2 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
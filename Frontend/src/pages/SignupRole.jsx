import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import axios from "axios";
import { setToken } from "../api/client.js"; // IMPORTANT (same token system)

const API = import.meta.env.VITE_API_URL;

export default function SignupRole() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const chooseRole = async (role) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("edupath_token"); // your real token key
      if (!token) return navigate("/login");

      const res = await axios.post(
        `${API}/api/auth/select-role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // if backend returns new token (recommended)
      if (res.data.token) setToken(res.data.token);

      // Update local user role (optional)
      const oldUser = JSON.parse(localStorage.getItem("edupath_user") || "{}");
      localStorage.setItem("edupath_user", JSON.stringify({ ...oldUser, role }));

      // go to registration form
      if (role === "student") navigate("/signup/student", { replace: true });
      if (role === "educator") navigate("/signup/educator", { replace: true });

    } catch (err) {
      alert(err?.response?.data?.message || "Role selection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
        <div className="glass-card w-full max-w-md p-6 text-center">
          <h2 className="text-2xl font-semibold text-text-dark">Select your role</h2>
          <p className="mt-1 text-xs text-muted">Choose how you want to join EduPath.</p>

          <div className="mt-6 space-y-3">
            <button
              disabled={loading}
              onClick={() => chooseRole("student")}
              className="btn-primary w-full disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Continue as Student"}
            </button>

            <button
              disabled={loading}
              onClick={() => chooseRole("educator")}
              className="btn-outline w-full disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Continue as Educator"}
            </button>
          </div>

          <p className="mt-4 text-xs text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-primary underline-offset-2 hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}

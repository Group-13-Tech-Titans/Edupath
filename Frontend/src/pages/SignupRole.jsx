import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import axios from "axios";
import { getToken, setToken } from "../api/client.js"; // ✅ use same token helpers

const API = import.meta.env.VITE_API_URL;

const SignupRole = () => {
  const navigate = useNavigate();

  const chooseRole = async (role) => {
    try {
      const token = getToken(); // ✅ reads edupath_token
      if (!token) return navigate("/login");

      const res = await axios.post(
        `${API}/api/auth/select-role`, // ✅ correct route
        { role },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // ✅ if backend returns a refreshed token, save it (recommended)
      if (res.data.token) setToken(res.data.token);

      // ✅ then go to correct registration form
      if (role === "student") navigate("/signup/student");
      else navigate("/signup/educator");
    } catch (err) {
      alert(err?.response?.data?.message || "Role selection failed");
    }
  };

  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
        <div className="glass-card w-full max-w-md p-6 text-center">
          <h2 className="text-2xl font-semibold text-text-dark">
            Select your role
          </h2>
          <p className="mt-1 text-xs text-muted">
            Choose how you want to join EduPath.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => chooseRole("student")}
              className="btn-primary w-full"
            >
              Continue as Student
            </button>

            <button
              onClick={() => chooseRole("educator")}
              className="btn-outline w-full"
            >
              Continue as Educator
            </button>
          </div>

          <p className="mt-4 text-xs text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary underline-offset-2 hover:underline"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
};

export default SignupRole;

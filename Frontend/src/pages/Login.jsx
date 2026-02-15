import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "../context/AppProvider.jsx";
import PageShell from "../components/PageShell.jsx";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";

const roleHomePath = {
  student: "/student",
  educator: "/educator",
  admin: "/admin",
  reviewer: "/reviewer",
};

const handleGoogleSuccess = async (credentialResponse) => {
  try {
    // Google returns an ID token in credentialResponse.credential
    const res = await axios.post("http://localhost:5000/api/auth/google", {
      credential: credentialResponse.credential,
    });

    // backend returns your JWT + user
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    // redirect based on role
    const role = res.data.user.role;
    if (role === "admin") window.location.href = "/admin";
    else if (role === "educator") window.location.href = "/educator";
    else window.location.href = "/student";
  } catch (err) {
    console.log(err);
    alert(err?.response?.data?.message || "Google sign-in failed");
  }
};

const handleGoogleError = () => {
  alert("Google sign-in failed");
};

const Login = () => {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(email.trim(), password);
    if (!res.success) {
      setError(res.message || "Unable to login");
      return;
    }
    const user = res.user;
    const fromState = location.state && location.state.from?.pathname;
    let target = fromState;
    if (!target) {
      if (roleHomePath[user.role]) {
        target = roleHomePath[user.role];
      } else {
        // Newly created accounts without an assigned role go to role selection
        target = "/signup/role";
      }
    }
    navigate(target, { replace: true });
  };

  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-b from-emerald-200 via-teal-200 to-cyan-200 px-4 py-10">
        <motion.div
          className="w-full max-w-md rounded-[32px] bg-white px-8 py-9 shadow-xl shadow-emerald-200/70"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-lg font-semibold text-white shadow-md">
                🎓
              </div>
              <span className="text-xl font-semibold text-emerald-700">
                Edupath
              </span>
            </div>
            <div className="mt-1 text-center">
              <h2 className="text-2xl font-semibold text-text-dark">
                Welcome Back
              </h2>
              <p className="mt-1 text-xs text-muted">
                Sign in to continue your learning journey
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="mt-6">
              <GoogleAuthButton />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 text-[11px] text-muted">
            <div className="h-px flex-1 bg-emerald-100" />
            <span>Or login with email</span>
            <div className="h-px flex-1 bg-emerald-100" />
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-text-dark">
                Email Address
              </label>
              <input
                type="email"
                className="mt-1 w-full rounded-full border border-emerald-100 bg-white/80 px-4 py-2.5 text-sm outline-none ring-primary/40 placeholder:text-gray-400 focus:border-emerald-300 focus:ring"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-text-dark">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  <Link to="/forgot-password">Forgot Password ?</Link>
                </button>
              </div>
              <input
                type="password"
                className="w-full rounded-full border border-emerald-100 bg-white/80 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:border-emerald-300 focus:ring"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-emerald-300 text-emerald-500 focus:ring-emerald-400"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>
            {error && (
              <p className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="btn-primary mt-1 w-full rounded-full py-2.5 text-sm"
            >
              Sign in
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-primary underline-offset-2 hover:underline"
            >
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </PageShell>
  );
};

export default Login;

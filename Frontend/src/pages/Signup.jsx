import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "../context/AppProvider.jsx";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";

const Signup = () => {
  const { signupAccount } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    const res = await signupAccount({ email: email.trim(), password });
    if (!res.success) {
      setError(res.message || "Unable to create account");
      return;
    }
    navigate("/signup/role");
  };

  return (
    
      <div className="flex min-h-[calc(100vh)] items-center justify-center bg-gradient-to-b from-emerald-200 via-teal-200 to-cyan-200 px-4 py-10">
        <motion.div
          className="w-full max-w-md rounded-[32px] bg-white px-8 py-9 shadow-xl shadow-emerald-200/70"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-text-dark">Sign Up</h2>
            <p className="mt-1 text-xs text-muted">
              Create your EduPath student account
            </p>
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
              <label className="text-xs font-medium text-text-dark">
                Password
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-full border border-emerald-100 bg-white/80 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:border-emerald-300 focus:ring"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-dark">
                Confirm Password
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-full border border-emerald-100 bg-white/80 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:border-emerald-300 focus:ring"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
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
              Create Account
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary underline-offset-2 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    
  );
};

export default Signup;

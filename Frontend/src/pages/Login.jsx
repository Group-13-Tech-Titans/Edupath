/**
 * LOGIN COMPONENT
 * Handles user authentication via Email/Password and Google OAuth.
 * Design Patterns: Controlled Components, Context API Integration, Declarative Routing.
 */

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "../context/AppProvider.jsx";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";
import { emailRegex } from "../utils/validation"; // Removed passwordRegex from login!

// Dictionary mapping for role-based redirects
const roleHomePath = {
  student: "/student",
  educator: "/educator",
  admin: "/admin",
  reviewer: "/reviewer",
};

const Login = () => {
  const { login, setSession } = useApp(); // Accessing global auth state
  const navigate = useNavigate();

  // Component State (Controlled Inputs)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Added loading state for better UX

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/google", {
        credential: credentialResponse.credential,
      });

      // Use setSession! This saves the token to local storage
      // AND instantly updates the global React state so the ProtectedRoute won't bounce!
      setSession(res.data.token, res.data.user);

      const user = res.data.user;
      let target;

      if (user.role === "pending") {
        target = "/signup/role";
      } else if (user.status === "onboarding") {
        target = `/signup/${user.role}`; // Forces user to the form!
      } else {
        target = roleHomePath[user.role] || "/";
      }
      
      navigate(target, { replace: true });
    } catch (err) {
      console.log(err);
      setError("Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    // Input Validation
    if (!email) {
      newErrors.email = "Please enter email";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    // Only check if password is provided. Never check complexity regex on Login.
    if (!password) {
      newErrors.authInput = "Please enter password";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Execute Login via Context
    setIsLoading(true);
    const res = await login(email.trim(), password);
    setIsLoading(false);

    // Handle Error or Success Redirect
    if (!res.success) {
      setError(res.message || "Unable to login");
      return;
    }

    const user = res.user;
    let target;

    if (user.role === "pending") {
      target = "/signup/role";
    } else if (user.status === "onboarding") {
      target = `/signup/${user.role}`; // Forces user to the form!
    } else {
      target = roleHomePath[user.role] || "/";
    }

    navigate(target, { replace: true });
  };

  return (
    <div className="flex min-h-[calc(100vh)] items-center justify-center bg-gradient-to-b from-emerald-200 via-teal-200 to-cyan-200 px-4 py-10">
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

        <div className="flex justify-center mt-6">
          {/* Ensure your GoogleAuthButton accepts onSuccess/onError props! */}
          <GoogleAuthButton
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google sign-in failed")}
          />
        </div>

        <div className="mt-5 flex items-center gap-3 text-[11px] text-muted">
          <div className="h-px flex-1 bg-emerald-100" />
          <span>Or login with email</span>
          <div className="h-px flex-1 bg-emerald-100" />
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="text-xs font-medium text-text-dark"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full rounded-full border border-emerald-100 bg-white/80 px-4 py-2.5 text-sm outline-none ring-primary/40 placeholder:text-gray-400 focus:border-emerald-300 focus:ring"
              placeholder="youremail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-medium text-text-dark"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Forgot Password ?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              className="w-full rounded-full border border-emerald-100 bg-white/80 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:border-emerald-300 focus:ring"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            {errors.authInput && (
              <p className="text-red-500 text-xs mt-1">{errors.authInput}</p>
            )}
          </div>

          {error && (
            <p className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary mt-1 w-full rounded-full py-2.5 text-sm disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary underline-offset-2 hover:underline"
          >
            Sign up free
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-muted">
          <Link
            to="/"
            className="text-primary underline-offset-2 hover:underline"
          >
            Back to Home
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

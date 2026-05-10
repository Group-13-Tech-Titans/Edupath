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
import { emailRegex } from "../utils/validation"; 

// Dictionary mapping for role-based redirects
const roleHomePath = {
  student: "/student",
  educator: "/educator",
  admin: "/admin",
  reviewer: "/reviewer",
};

const Login = () => {
  const { login, setSession } = useApp(); 
  const navigate = useNavigate();

  // Component State (Controlled Inputs)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); 
  
  // 🟢 NEW: State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/google", {
        credential: credentialResponse.credential,
      });

      setSession(res.data.token, res.data.user);

      const user = res.data.user;
      let target;

      if (user.role === "pending") {
        target = "/signup/role";
      } else if (user.status === "onboarding") {
        target = `/signup/${user.role}`; 
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

    if (!email) {
      newErrors.email = "Please enter email";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.authInput = "Please enter password";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    const res = await login(email.trim(), password);
    setIsLoading(false);

    if (!res.success) {
      setError(res.message || "Unable to login");
      return;
    }

    const user = res.user;
    let target;

    if (user.role === "pending") {
      target = "/signup/role";
    } else if (user.status === "onboarding") {
      target = `/signup/${user.role}`; 
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
            
            {/* 🟢 FIXED: Wrapped input in relative div and added absolute toggle button */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full rounded-full border border-emerald-100 bg-white/80 pl-4 pr-12 py-2.5 text-sm outline-none ring-primary/40 focus:border-emerald-300 focus:ring"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors focus:outline-none"
                tabIndex="-1" // Keeps it out of normal tab flow
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
            
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
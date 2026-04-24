/**
 * SIGNUP COMPONENT
 * Handles new user registration via Email/Password or Google OAuth.
 * Design Patterns: Controlled Components, Client-Side Validation, 
 * Multi-Step Onboarding Routing.
 */


import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useApp } from "../context/AppProvider.jsx";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";
import { emailRegex, passwordRegex } from "../utils/validation";

const Signup = () => {
  // Pulling signupAccount and setSession from our global state manager
  const { signupAccount, setSession } = useApp();
  const navigate = useNavigate();

  // Component State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Loading state for UX

  // Handle Google Auth explicitly
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/google", {
        credential: credentialResponse.credential,
        isSignup: true, // Tell the backend this is a strict signup attempt!
      });

      // Update Global State and Local Storage
      setSession(res.data.token, res.data.user);

      const user = res.data.user;
      let target;

      if (user.role === "pending") {
        target = "/signup/role";
      } else if (user.status === "onboarding") {
        target = `/signup/${user.role}`; // Forces user to the form!
      } else {
        target = "/"; // Fallback
      }

      navigate(target, { replace: true });
    } catch (err) {
      console.error(err);
      const errorMessage = err?.response?.data?.message || "Google sign-up failed.";
      
      // Show the exact error message from the backend
      setError(errorMessage);

      // If the backend says the account exists, trigger the redirect
      if (errorMessage === "Account already exists. Please log in.") {
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2500); // Wait 2.5 seconds so the user can actually read the red warning text!
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    // 1. Strict Client-Side Validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    // 🟢 NOTE: Unlike Login, we strictly enforce password complexity here!
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number and special character";
    }

    if (!confirm) {
      newErrors.confirm = "Confirm password required";
    } else if (password !== confirm) {
      newErrors.confirm = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // 2. Execute Backend Signup via Context
    setIsLoading(true);
    const res = await signupAccount({
      email: email.trim(),
      password,
    });
    setIsLoading(false);

    if (!res.success) {
      setError(res.message || "Unable to create account");
      return;
    }

    // 3. Success! Route to the next step of the onboarding funnel
    navigate("/signup/role", { replace: true });
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
          <p className="mt-1 text-xs text-muted">Create your EduPath student account</p>
        </div>

        <div className="flex justify-center">
          <div className="mt-6">
            {/* 🟢 FIXED: Passing our handlers to the dumb component */}
            <GoogleAuthButton 
              onSuccess={handleGoogleSuccess} 
              onError={() => setError("Google widget failed to load")}
              text="signup_with"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 text-[11px] text-muted">
          <div className="h-px flex-1 bg-emerald-100" />
          <span>Or login with email</span>
          <div className="h-px flex-1 bg-emerald-100" />
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="email" className="text-xs font-medium text-text-dark">Email Address</label>
            <input
              id="email"
              type="email"
              disabled={isLoading}
              className="mt-1 w-full rounded-full border border-emerald-100 bg-white/80 px-4 py-2.5 text-sm outline-none ring-primary/40 placeholder:text-gray-400 focus:border-emerald-300 focus:ring disabled:opacity-60"
              placeholder="youremail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-medium text-text-dark">Password</label>
            <input
              id="password"
              type="password"
              disabled={isLoading}
              className="mt-1 w-full rounded-full border border-emerald-100 bg-white/80 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:border-emerald-300 focus:ring disabled:opacity-60"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="confirm" className="text-xs font-medium text-text-dark">Confirm Password</label>
            <input
              id="confirm"
              type="password"
              disabled={isLoading}
              className="mt-1 w-full rounded-full border border-emerald-100 bg-white/80 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:border-emerald-300 focus:ring disabled:opacity-60"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
          </div>
          
          {error && <p className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600 text-center">{error}</p>}
          
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary mt-1 w-full rounded-full py-2.5 text-sm disabled:opacity-50"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-primary underline-offset-2 hover:underline">Sign In</Link>
        </p>
        <p className="mt-4 text-center text-xs text-muted">
          <Link to="/" className="text-primary underline-offset-2 hover:underline">Back to Home</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
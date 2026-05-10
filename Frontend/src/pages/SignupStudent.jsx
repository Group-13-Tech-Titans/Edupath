/**
 * SIGNUP STUDENT COMPONENT
 * Final step in the student onboarding funnel. Collects detailed profile 
 * metadata and officially converts their role from "pending" to "student".
 * Design Patterns: Controlled Form Object, Auto-filling Context Data.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppProvider.jsx";
import { emailRegex, passwordRegex, contactRegex } from "../utils/validation";

const SignupStudent = () => {
  // Grabbed currentUser from context to auto-fill the form
  const { signupStudent, currentUser } = useApp();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    educationLevel: "",
    email: currentUser?.email || "", // Autofill registered email!
    password: "",
    confirm: "",
    contact: "",
  });
  
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 🟢 NEW: States to toggle visibility for both password fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // If the context loads slightly after the component, update the email
  useEffect(() => {
    if (currentUser?.email) {
      setForm((prev) => ({ ...prev, email: currentUser.email }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!form.firstName) newErrors.firstName = "First name required";
    if (!form.lastName) newErrors.lastName = "Last name required";
    if (!form.dob) newErrors.dob = "Date of birth required";
    if (!form.educationLevel) newErrors.educationLevel = "Education level required";

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Invalid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, number and special character";
    }

    if (!form.confirm) {
      newErrors.confirm = "Confirm password required";
    } else if (form.password !== form.confirm) {
      newErrors.confirm = "Passwords do not match";
    }

    if (!form.contact) {
      newErrors.contact = "Contact required";
    } else if (!contactRegex.test(form.contact)) {
      newErrors.contact = "Contact must be 10 digits and start with 0";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    const res = await signupStudent(form);
    setIsLoading(false);

    if (!res.success) {
      setError(res.message);
      return;
    }

    navigate("/student", { replace: true });
  };

  return (
    <div className="flex min-h-[calc(100vh)] items-center justify-center px-4 py-10 bg-gradient-to-b from-emerald-100 to-teal-200">
      <div className="w-full max-w-lg p-8 rounded-[32px] bg-white shadow-xl shadow-emerald-200/70">
        <h2 className="text-center text-2xl font-semibold text-text-dark">
          Student Registration
        </h2>
        <p className="mt-1 text-center text-xs text-muted mb-6">
          Almost done! Complete your EduPath student profile.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="text-xs font-medium text-gray-700">First Name</label>
            <input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1 w-full rounded-full border border-emerald-100 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2 focus:ring-emerald-300 disabled:opacity-60"
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="text-xs font-medium text-gray-700">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1 w-full rounded-full border border-emerald-100 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2 focus:ring-emerald-300 disabled:opacity-60"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <label htmlFor="dob" className="text-xs font-medium text-gray-700">Date of birth</label>
            <input
              id="dob"
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1 w-full rounded-full border border-emerald-100 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2 focus:ring-emerald-300 disabled:opacity-60"
            />
            {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
          </div>

          <div>
            <label htmlFor="educationLevel" className="text-xs font-medium text-gray-700">Education level</label>
            <select
              id="educationLevel"
              name="educationLevel"
              value={form.educationLevel}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1 w-full rounded-full border border-emerald-100 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2 focus:ring-emerald-300 disabled:opacity-60"
            >
              <option value="">Select level</option>
              <option>High School</option>
              <option>Undergraduate</option>
              <option>Postgraduate</option>
              <option>Professional</option>
            </select>
            {errors.educationLevel && <p className="text-red-500 text-xs mt-1">{errors.educationLevel}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="email" className="text-xs font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              readOnly 
              className="mt-1 w-full rounded-full border border-emerald-100 bg-gray-100 px-4 py-2.5 text-sm outline-none text-gray-500 cursor-not-allowed"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="text-xs font-medium text-gray-700">Password</label>
            {/* 🟢 FIXED: Wrapped in relative div with toggle button */}
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full rounded-full border border-emerald-100 bg-slate-50 pl-4 pr-12 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2 focus:ring-emerald-300 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors focus:outline-none"
                tabIndex="-1"
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
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirm" className="text-xs font-medium text-gray-700">Confirm password</label>
            {/* 🟢 FIXED: Wrapped in relative div with toggle button */}
            <div className="relative mt-1">
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full rounded-full border border-emerald-100 bg-slate-50 pl-4 pr-12 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2 focus:ring-emerald-300 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors focus:outline-none"
                tabIndex="-1"
              >
                {showConfirm ? (
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
            {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="contact" className="text-xs font-medium text-gray-700">Contact number</label>
            <input
              id="contact"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1 w-full rounded-full border border-emerald-100 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2 focus:ring-emerald-300 disabled:opacity-60"
            />
            {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
          </div>

          {error && (
            <div className="md:col-span-2">
              <p className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600 text-center">
                {error}
              </p>
            </div>
          )}

          <div className="md:col-span-2 mt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary w-full rounded-full py-3 shadow-lg shadow-emerald-200 disabled:opacity-70"
            >
              {isLoading ? "Saving Profile..." : "Complete Registration"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Need to start over?{" "}
          <Link to="/login" className="text-emerald-600 font-semibold underline-offset-2 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupStudent;
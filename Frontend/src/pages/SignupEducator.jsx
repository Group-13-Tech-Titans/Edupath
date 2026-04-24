/**
 * SIGNUP EDUCATOR COMPONENT
 * Final step in the educator onboarding funnel. Collects professional
 * credentials and upgrades their role, setting status to PENDING_VERIFICATION.
 * Design Patterns: Controlled Form Object, Auto-filling Context Data.
 */
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppProvider.jsx";
import { emailRegex, passwordRegex, contactRegex, urlRegex } from "../utils/validation";
import { getSpecializations } from "../api/specializationApi.js";

const SignupEducator = () => {
  // Grabbed currentUser from context to auto-fill the form
  const { signupEducator, currentUser } = useApp();
  const navigate = useNavigate();

  const [specializationList, setSpecializationList] = useState([]);
  
  const [form, setForm] = useState({
    fullName: "",
    email: currentUser?.email || "",
    password: "",
    confirm: "",
    contact: "",
    specializationTag: "",
    credentialsLink: "",
  });
  
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  // If the context loads slightly after the component, update the email
  useEffect(() => {
    if (currentUser?.email) {
      setForm((prev) => ({ ...prev, email: currentUser.email }));
    }
  }, [currentUser]);

  // useEffect to fetch the Specialization List
  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        const specs = await getSpecializations();
        setSpecializationList(specs || []);
      } catch (err) {
        console.error("Failed to load specializations", err);
      }
    };
    fetchSpecs();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!form.fullName) newErrors.fullName = "Full name required";

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

    if (form.password !== form.confirm) {
      newErrors.confirm = "Passwords do not match";
    }

    if (!form.contact) {
      newErrors.contact = "Contact is required";
    } else if (!contactRegex.test(form.contact)) {
      newErrors.contact = "Contact must be 10 digits starting with 0";
    }

    if (!form.specializationTag) {
      newErrors.specializationTag = "Specialization required";
    }

    if (!form.credentialsLink) {
      newErrors.credentialsLink = "Credentials link required";
    } else if (!urlRegex.test(form.credentialsLink)) {
      newErrors.credentialsLink = "Please enter a valid URL (e.g., https://linkedin.com/in/...)";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    const res = await signupEducator(form);
    setIsLoading(false);

    if (!res.success) {
      setError(res.message);
      return;
    }

    // Replace the history stack so they can't hit "Back" to resubmit
    navigate("/verification-pending", { replace: true });
  };

  return (
    <div className="flex min-h-[calc(100vh)] items-center justify-center px-4 py-10 bg-gradient-to-b from-emerald-100 to-teal-200">
      <div className="w-full max-w-lg p-8 rounded-[32px] bg-white shadow-xl shadow-emerald-200/70">
        <h2 className="text-center text-2xl font-semibold text-text-dark">
          Educator Registration
        </h2>
        <p className="mt-1 text-center text-xs text-muted mb-6">
          Apply as an educator to publish courses on EduPath.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="text-xs font-medium text-gray-700">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1 w-full rounded-full border border-emerald-100 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2 focus:ring-emerald-300 disabled:opacity-60"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          <div>
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

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="password" className="text-xs font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                disabled={isLoading}
                className="mt-1 w-full rounded-full border border-emerald-100 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2 focus:ring-emerald-300 disabled:opacity-60"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirm" className="text-xs font-medium text-gray-700">Confirm password</label>
              <input
                id="confirm"
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                disabled={isLoading}
                className="mt-1 w-full rounded-full border border-emerald-100 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2 focus:ring-emerald-300 disabled:opacity-60"
              />
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
            </div>
          </div>

          <div>
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

          <div>
            <label htmlFor="specializationTag" className="text-xs font-medium text-gray-700">
              Expertise / specialization tag
            </label>
            <select
              id="specializationTag"
              name="specializationTag"
              value={form.specializationTag}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1 w-full rounded-full border border-emerald-100 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2 focus:ring-emerald-300 disabled:opacity-60"
            >
              <option value="">Select a specialization...</option>
              {specializationList.map((spec) => (
                <option key={spec._id} value={spec.slug}>
                  {spec.name}
                </option>
              ))}
            </select>
            {errors.specializationTag && <p className="text-red-500 text-xs mt-1">{errors.specializationTag}</p>}
          </div>

          <div>
            <label htmlFor="credentialsLink" className="text-xs font-medium text-gray-700">
              Portfolio / credentials link
            </label>
            <input
              id="credentialsLink"
              name="credentialsLink"
              value={form.credentialsLink}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Link to CV, portfolio, or LinkedIn"
              className="mt-1 w-full rounded-full border border-emerald-100 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2 focus:ring-emerald-300 disabled:opacity-60"
            />
            {errors.credentialsLink && <p className="text-red-500 text-xs mt-1">{errors.credentialsLink}</p>}
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600 text-center">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isLoading} 
              className="btn-primary w-full rounded-full py-3 shadow-lg shadow-emerald-200 disabled:opacity-70"
            >
              {isLoading ? "Submitting..." : "Submit for verification"}
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

export default SignupEducator;
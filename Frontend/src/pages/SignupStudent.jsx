import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import { useApp } from "../context/AppProvider.jsx";

const SignupStudent = () => {
  const { signupStudent } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    educationLevel: "",
    email: "",
    password: "",
    confirm: "",
    contact: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    const res = signupStudent(form);
    if (!res.success) {
      setError(res.message || "Unable to sign up");
      return;
    }
    navigate("/login");
  };

  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
        <div className="glass-card w-full max-w-lg p-6">
          <h2 className="text-center text-2xl font-semibold text-text-dark">
            Student Registration
          </h2>
          <p className="mt-1 text-center text-xs text-muted">
            Create your EduPath student account.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium">First Name</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Last Name</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Date of birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Education level</label>
              <select
                name="educationLevel"
                value={form.educationLevel}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring"
              >
                <option value="">Select level</option>
                <option>High School</option>
                <option>Undergraduate</option>
                <option>Postgraduate</option>
                <option>Professional</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Confirm password</label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium">Contact number</label>
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring"
              />
            </div>
            {error && (
              <div className="md:col-span-2">
                <p className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600">
                  {error}
                </p>
              </div>
            )}
            <div className="md:col-span-2">
              <button type="submit" className="btn-primary w-full">
                Create account
              </button>
            </div>
          </form>
          <p className="mt-4 text-center text-xs text-muted">
            Already registered?{" "}
            <Link to="/login" className="text-primary underline-offset-2 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
};

export default SignupStudent;


import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import { useApp } from "../context/AppProvider.jsx";

const SignupEducator = () => {
  const { signupEducator } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
    contact: "",
    specializationTag: "",
    credentialsLink: ""
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
    const res = signupEducator(form);
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
            Educator Registration
          </h2>
          <p className="mt-1 text-center text-xs text-muted">
            Apply as an educator to publish courses on EduPath.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium">Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring"
              />
            </div>
            <div>
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
            <div className="grid gap-4 md:grid-cols-2">
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
            </div>
            <div>
              <label className="text-xs font-medium">Contact number</label>
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Expertise / specialization tag</label>
              <input
                name="specializationTag"
                value={form.specializationTag}
                onChange={handleChange}
                placeholder="e.g. web-dev, data-science"
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium">
                Portfolio / credentials link (optional)
              </label>
              <input
                name="credentialsLink"
                value={form.credentialsLink}
                onChange={handleChange}
                placeholder="Link to CV, portfolio, or LinkedIn"
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring"
              />
            </div>
            {error && (
              <p className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            )}
            <button type="submit" className="btn-primary w-full">
              Submit for verification
            </button>
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

export default SignupEducator;


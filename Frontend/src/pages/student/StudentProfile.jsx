/**
 * STUDENT PROFILE COMPONENT
 * Manages the student's personal details, education level, and security settings.
 * Design Patterns: Controlled Components, Optimistic UI Updates, Accessibility (a11y) Compliance.
 */

import React, { useEffect, useMemo, useState } from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import * as authApi from "../../api/authApi.js";

// --- STYLING CONSTANTS ---
const input = "mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:ring focus:border-emerald-300";
const label = "text-xs font-semibold text-text-dark";
const helper = "mt-1 text-[11px] text-muted";

// --- STATE INITIALIZATION HELPER ---
function getInitial(currentUser) {
  const p = currentUser?.profile || {};
  const name = currentUser?.name || "";
  const email = currentUser?.email || "";

  const parts = name.trim().split(" ");
  const firstFromName = parts[0] || "";
  const lastFromName = parts.slice(1).join(" ") || "";

  return {
    firstName: p.firstName ?? firstFromName,
    lastName: p.lastName ?? lastFromName,
    dob: p.dob ?? "",
    educationLevel: p.educationLevel ?? "",
    contact: p.contact ?? "",
    email,
    newPassword: "",
    confirmPassword: ""
  };
}

export default function StudentProfile() {
  const { currentUser } = useApp();

  const initial = useMemo(() => getInitial(currentUser), [currentUser]);
  const [form, setForm] = useState(initial);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const onChange = (e) => {
    setMsg({ type: "", text: "" });
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return "First name and last name are required.";
    }
    if (!form.educationLevel) {
      return "Please select your education level.";
    }
    if (form.newPassword || form.confirmPassword) {
      if (form.newPassword.length < 6) return "Password must be at least 6 characters.";
      if (form.newPassword !== form.confirmPassword) return "Passwords do not match.";
    }
    return "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const validationError = validate();
    if (validationError) return setMsg({ type: "error", text: validationError });

    try {
      setSaving(true);

      // Resolves S7744: Safely spread the profile without a useless empty object fallback
      const profile = {
        ...(currentUser?.profile), 
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dob: form.dob,
        educationLevel: form.educationLevel,
        contact: form.contact
      };

      const body = {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        role: "student",
        profile
      };

      if (form.newPassword) body.password = form.newPassword;

      await authApi.updateProfile(body);

      setMsg({ type: "success", text: "Profile updated successfully ✅" });
      setForm((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));

      await authApi.getMe().catch(() => {});
      
      // Resolves S7764: Prefer globalThis over window
      globalThis.location.reload();
      
    // Resolves S7718: Used standard naming convention for caught error
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Update failed." });
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <p className="text-sm text-muted">No user loaded.</p>
          </div>
        </div>
      </PageShell>
    );
  }

  // Resolves S1481 & S1854 & S125: Actually utilize the initials variable to render an avatar
  const initials = (currentUser?.name || "S")
      .split(" ")
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join("") || "S";

  return (
    <PageShell>
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-emerald-100 via-teal-100 to-cyan-100 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          {/* Top header */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-dark">Student Profile</h1>
              <p className="mt-1 text-xs text-muted">
                Manage your personal details and security settings.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-3xl bg-white/70 px-4 py-3 shadow backdrop-blur">
              <div className="h-11 w-11 overflow-hidden rounded-full bg-emerald-500 text-white grid place-items-center shadow-inner border-2 border-white">
                <span className="text-sm font-black tracking-widest">{initials}</span>
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-text-dark">{currentUser?.name}</p>
                <p className="text-[11px] text-muted">{currentUser?.email}</p>
              </div>
            </div>
          </div>

          {/* Main card */}
          <div className="rounded-[28px] bg-white/80 p-6 shadow-xl shadow-emerald-200/60 backdrop-blur">
            {msg.text && (
              <div className={`mb-5 rounded-2xl px-4 py-3 text-sm font-bold ${msg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-7">
              {/* Section: Personal */}
              <section className="rounded-3xl border border-black/5 bg-white/60 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-text-dark">Personal Information</h2>
                    <p className={helper}>These details are used for your learning profile.</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                    Student
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    {/* Resolves S6853: Added htmlFor and matching ID to inputs */}
                    <label htmlFor="firstName" className={label}>First Name</label>
                    <input
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={onChange}
                      className={input}
                      placeholder="First name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className={label}>Last Name</label>
                    <input
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={onChange}
                      className={input}
                      placeholder="Last name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="dob" className={label}>Date of Birth</label>
                    <input
                      id="dob"
                      type="date"
                      name="dob"
                      value={form.dob}
                      onChange={onChange}
                      className={input}
                    />
                  </div>

                  <div>
                    <label htmlFor="educationLevel" className={label}>Education Level</label>
                    <select
                      id="educationLevel"
                      name="educationLevel"
                      value={form.educationLevel}
                      onChange={onChange}
                      className={input}
                      required
                    >
                      <option value="">Select level</option>
                      <option value="High School">High School</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                      <option value="Professional">Professional</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="contact" className={label}>Contact Number</label>
                    <input
                      id="contact"
                      name="contact"
                      value={form.contact}
                      onChange={onChange}
                      className={input}
                      placeholder="e.g. +94 7X XXX XXXX"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="email" className={label}>Email (cannot be changed)</label>
                    <input
                      id="email"
                      value={form.email}
                      disabled
                      className={`${input} cursor-not-allowed bg-gray-100/80 text-gray-500`}
                    />
                    <p className={helper}>Email is fixed after registration.</p>
                  </div>
                </div>
              </section>

              {/* Section: Security */}
              <section className="rounded-3xl border border-black/5 bg-white/60 p-5">
                <h2 className="text-sm font-bold text-text-dark">Security</h2>
                <p className={helper}>
                  Change your password. Leave blank if you don’t want to update it.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="newPassword" className={label}>New Password</label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showPw ? "text" : "password"}
                        name="newPassword"
                        value={form.newPassword}
                        onChange={onChange}
                        className={`${input} pr-16`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        {showPw ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className={label}>Confirm New Password</label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showPw2 ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={onChange}
                        className={`${input} pr-16`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw2((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        {showPw2 ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-white rounded-full px-10 py-3.5 text-sm font-black tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none"
                >
                  {saving ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-xs font-bold text-emerald-800/40">EduPath • Student Profile</p>
        </div>
      </div>
    </PageShell>
  );
}
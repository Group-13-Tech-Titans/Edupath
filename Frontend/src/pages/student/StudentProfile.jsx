import React, { useEffect, useMemo, useState } from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import * as authApi from "../../api/authApi.js";

const input =
  "mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-primary/40 focus:ring focus:border-emerald-300";
const label = "text-xs font-semibold text-text-dark";
const helper = "mt-1 text-[11px] text-muted";

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
    // read-only
    email,
    // optional password change
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
    // password validation if any typed
    if (form.newPassword || form.confirmPassword) {
      if (form.newPassword.length < 6) return "Password must be at least 6 characters.";
      if (form.newPassword !== form.confirmPassword) return "Passwords do not match.";
    }
    return "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const err = validate();
    if (err) return setMsg({ type: "error", text: err });

    try {
      setSaving(true);

      // ✅ Keep existing profile fields but update the known ones
      const profile = {
        ...(currentUser?.profile || {}),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dob: form.dob,
        educationLevel: form.educationLevel,
        contact: form.contact
      };

      // ✅ IMPORTANT: do NOT send email (student can’t change it)
      const body = {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        role: "student",
        profile
      };

      // ✅ Send password only if typed
      if (form.newPassword) body.password = form.newPassword;

      await authApi.updateProfile(body);

      setMsg({ type: "success", text: "Profile updated successfully ✅" });

      // Clear password fields
      setForm((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));

      // ✅ Safest way to sync UI with AppProvider without changing auth logic:
      // AppProvider loads currentUser from /me only on mount → do a soft reload.
      // (Does NOT break auth because token stays in localStorage under edupath_token)
      await authApi.getMe().catch(() => {});
      window.location.reload();
    } catch (e2) {
      setMsg({ type: "error", text: e2.message || "Update failed." });
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

  const avatarUrl = currentUser?.avatar || "";
  const initials =
    (currentUser?.name || "S")
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
              <div className="h-11 w-11 overflow-hidden rounded-full bg-emerald-500 text-white grid place-items-center">
                {/* {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold">{initials}</span>
                )} */}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-text-dark">{currentUser?.name}</p>
                <p className="text-[11px] text-muted">{currentUser?.email}</p>
              </div>
            </div>
          </div>

          {/* Main card */}
          <div className="rounded-[28px] bg-white/80 p-6 shadow-xl shadow-emerald-200/60 backdrop-blur">
            {msg.text ? (
              <div
                className={`mb-5 rounded-2xl px-4 py-3 text-sm ${
                  msg.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {msg.text}
              </div>
            ) : null}

            <form onSubmit={handleSave} className="space-y-7">
              {/* Section: Personal */}
              <section className="rounded-3xl border border-black/5 bg-white/60 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-text-dark">Personal Information</h2>
                    <p className={helper}>These details are used for your learning profile.</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                    Student
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={label}>First Name</label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={onChange}
                      className={input}
                      placeholder="First name"
                      required
                    />
                  </div>

                  <div>
                    <label className={label}>Last Name</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={onChange}
                      className={input}
                      placeholder="Last name"
                      required
                    />
                  </div>

                  <div>
                    <label className={label}>Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={form.dob}
                      onChange={onChange}
                      className={input}
                    />
                  </div>

                  <div>
                    <label className={label}>Education Level</label>
                    <select
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
                    <label className={label}>Contact Number</label>
                    <input
                      name="contact"
                      value={form.contact}
                      onChange={onChange}
                      className={input}
                      placeholder="e.g. +94 7X XXX XXXX"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={label}>Email (cannot be changed)</label>
                    <input
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
                    <label className={label}>New Password</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        name="newPassword"
                        value={form.newPassword}
                        onChange={onChange}
                        className={`${input} pr-12`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        {showPw ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={label}>Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPw2 ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={onChange}
                        className={`${input} pr-12`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw2((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        {showPw2 ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary rounded-full px-7 py-2.5 text-sm disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-4 text-center text-[11px] text-muted">EduPath • Student Profile</p>
        </div>
      </div>
    </PageShell>
  );
}

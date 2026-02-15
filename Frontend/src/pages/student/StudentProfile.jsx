import React, { useEffect, useMemo, useState } from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import * as authApi from "../../api/authApi.js";

const inputBase =
  "mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring";

const labelBase = "text-xs font-medium text-text-dark";

export default function StudentProfile() {
  const { currentUser } = useApp();

  // Try to read profile from currentUser.profile (your schema uses profile: Mixed)
  const initial = useMemo(() => {
    const p = currentUser?.profile || {};
    const name = currentUser?.name || "";
    const email = currentUser?.email || "";

    // If you stored firstName/lastName in profile, use it; otherwise split name
    const [firstFromName = "", lastFromName = ""] = name.split(" ");

    return {
      firstName: p.firstName ?? firstFromName,
      lastName: p.lastName ?? lastFromName,
      dob: p.dob ?? "",
      educationLevel: p.educationLevel ?? "",
      contact: p.contact ?? "",

      // email is read-only
      email,

      // password change fields (optional)
      newPassword: "",
      confirmPassword: "",
    };
  }, [currentUser]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const setField = (e) => {
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
      if (form.newPassword.length < 6)
        return "Password must be at least 6 characters.";
      if (form.newPassword !== form.confirmPassword)
        return "Passwords do not match.";
    }
    return "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const err = validate();
    if (err) {
      setMsg({ type: "error", text: err });
      return;
    }

    try {
      setSaving(true);

      // Build update payload for your backend PATCH /api/auth/profile
      const profile = {
        ...(currentUser?.profile || {}),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dob: form.dob,
        educationLevel: form.educationLevel,
        contact: form.contact,
        email: currentUser?.email, // keep for reference, but backend should not change it
      };

      const body = {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        role: "student", // keep student
        profile,
      };

      // Only send password if user typed it
      if (form.newPassword) {
        body.password = form.newPassword;
      }

      // Update in DB
      await authApi.updateProfile(body);

      setMsg({ type: "success", text: "Profile updated successfully ✅" });

      // Clear password fields after save
      setForm((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
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

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setMsg("Passwords do not match");
      return;
    }

    try {
      const res = await authApi.changePassword(currentPassword, newPassword);
      setMsg(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMsg(err.message || "Password update failed");
    }
  };

  return (
    <PageShell>
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-emerald-100 via-teal-100 to-cyan-100 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-text-dark">
                My Profile
              </h1>
              <p className="mt-1 text-xs text-muted">
                Update your personal information and password.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-3xl bg-white/70 px-4 py-2 shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                🎓
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-text-dark">
                  {currentUser?.name}
                </p>
                <p className="text-[11px] text-muted">Student</p>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-[28px] bg-white/80 p-6 shadow-xl shadow-emerald-200/60 backdrop-blur">
            {msg.text ? (
              <div
                className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
                  msg.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {msg.text}
              </div>
            ) : null}

            <form onSubmit={handleSave} className="space-y-6">
              {/* Personal Info */}
              <section>
                <h2 className="text-sm font-semibold text-text-dark">
                  Personal Information
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelBase}>First Name</label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={setField}
                      className={inputBase}
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelBase}>Last Name</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={setField}
                      className={inputBase}
                      placeholder="Last name"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelBase}>Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={form.dob}
                      onChange={setField}
                      className={inputBase}
                    />
                  </div>

                  <div>
                    <label className={labelBase}>Education Level</label>
                    <select
                      name="educationLevel"
                      value={form.educationLevel}
                      onChange={setField}
                      className={inputBase}
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
                    <label className={labelBase}>Contact Number</label>
                    <input
                      name="contact"
                      value={form.contact}
                      onChange={setField}
                      className={inputBase}
                      placeholder="e.g. +94 7X XXX XXXX"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelBase}>
                      Email (cannot be changed)
                    </label>
                    <input
                      name="email"
                      value={form.email}
                      disabled
                      className={`${inputBase} cursor-not-allowed bg-gray-100/80 text-gray-500`}
                    />
                    <p className="mt-1 text-[11px] text-muted">
                      If you need to change email, contact admin support.
                    </p>
                  </div>
                </div>
              </section>

              {/* Password */}
              <section>
                <h2 className="text-sm font-semibold text-text-dark">
                  Change Password
                </h2>
                <p className="mt-1 text-[11px] text-muted">
                  Leave blank if you don’t want to change your password.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelBase}>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={setField}
                      className={inputBase}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className={labelBase}>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={setField}
                      className={inputBase}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-[11px] text-muted">
                  Tip: Keep your profile updated for better recommendations.
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary rounded-full px-6 py-2.5 text-sm disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Footer note */}
          <p className="mt-4 text-center text-[11px] text-muted">
            EduPath • Student Profile
          </p>
        </div>
      </div>
    </PageShell>
  );
}

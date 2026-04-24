import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import AdminFooter from "./AdminFooter.jsx";

const LS_KEY = "edupath_admin_profile_v1";

// API endpoint for creating a new admin user
const CREATE_ADMIN_API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/admin/create-user`;

export default function AdminProfile() {
  const { currentUser } = useApp();

  const defaultProfile = useMemo(
    () => ({
      id: currentUser?.id || "admin-1",
      email: currentUser?.email || "admin@edupath.com",
      fullName: currentUser?.fullName || "EduPath Admin",
      phone: "",
      bio: "Manage platform users, approvals, payments, and system settings.",
      avatar: "", 
      role: "admin",
      createdAt: new Date().toISOString(),
    }),
    [currentUser]
  );

  const [profile, setProfile] = useState(defaultProfile);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState(defaultProfile);
  const [toast, setToast] = useState(null);

  // Password state
  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdMsg, setPwdMsg] = useState(null);

  // State for creating a new admin
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    fullName: "",
    email: "",
    password: "", 
  });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Load profile from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      setProfile((p) => ({ ...p, ...saved, email: defaultProfile.email }));
      setForm((f) => ({ ...f, ...saved, email: defaultProfile.email }));
    } catch {
      // Ignore parse errors
    }
  }, [defaultProfile.email]);

  const saveProfile = (next) => {
    setProfile(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2500);
  };

  const onPickAvatar = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const startEdit = () => {
    setForm(profile);
    setEditing(true);
  };

  const cancelEdit = () => {
    setForm(profile);
    setEditing(false);
  };

  const updateField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const submitProfile = (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      showToast("error", "Full name is required.");
      return;
    }
    const next = {
      ...profile,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      bio: form.bio.trim(),
      avatar: form.avatar,
      updatedAt: new Date().toISOString(),
    };
    saveProfile(next);
    setEditing(false);
    showToast("success", "Profile updated successfully.");
  };

  const deleteProfile = () => {
    localStorage.removeItem(LS_KEY);
    setProfile(defaultProfile);
    setForm(defaultProfile);
    setEditing(false);
    showToast("success", "Profile reset to default.");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPwdMsg(null);
    const pwdKey = "edupath_admin_pwd_v1";
    const saved = localStorage.getItem(pwdKey) || "admin123";

    if (!pwd.currentPassword) {
      setPwdMsg({ type: "error", text: "Enter current password." });
      return;
    }
    if (pwd.currentPassword !== saved) {
      setPwdMsg({ type: "error", text: "Current password is incorrect." });
      return;
    }
    if (pwd.newPassword.length < 6) {
      setPwdMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (pwd.newPassword !== pwd.confirmPassword) {
      setPwdMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    localStorage.setItem(pwdKey, pwd.newPassword);
    setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPwdMsg({ type: "success", text: "Password updated successfully." });
  };

  // Helper to get Auth Headers 
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  // Submit Handler for New Admin Creation
  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setIsCreatingAdmin(true);

    try {
      const payload = {
        name: newAdminForm.fullName,
        email: newAdminForm.email,
        password: newAdminForm.password,
        role: "admin" // Explicitly assign the admin role
      };

      await axios.post(CREATE_ADMIN_API, payload, getAuthHeader());
      
      showToast("success", "New Admin created successfully!");
      setShowCreateAdmin(false);
      setNewAdminForm({ fullName: "", email: "", password: "" });

    } catch (err) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Failed to create Admin.");
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <PageShell>
      {toast && (
        <div className="fixed right-4 top-20 z-50">
          <div
            className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur bg-white/80 ${
              toast.type === "success"
                ? "border-emerald-200 text-emerald-700"
                : "border-red-200 text-red-600"
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header Card */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-text-dark">Admin Profile</h1>
              <p className="mt-1 text-xs text-muted">
                Update admin details and manage account security.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              
              <button
                onClick={() => setShowCreateAdmin(true)}
                className="rounded-full bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-700 transition"
              >
                + Add New Admin
              </button>

              {!editing ? (
                <button
                  onClick={startEdit}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow hover:brightness-95"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={cancelEdit}
                    className="rounded-full bg-black/5 px-5 py-2.5 text-sm font-semibold text-text-dark hover:bg-black/10"
                  >
                    Cancel
                  </button>
                  <button
                    form="profileForm"
                    type="submit"
                    className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow hover:brightness-95"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Profile Summary */}
          <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
            <div className="flex items-center gap-4">
              <AvatarCircle avatar={profile.avatar} name={profile.fullName} />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-text-dark">{profile.fullName}</p>
                <p className="truncate text-xs text-muted">{profile.email}</p>
                <span className="mt-2 inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                  {profile.role.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <InfoRow label="Phone" value={profile.phone || "Not set"} />
              <InfoRow label="Bio" value={profile.bio || "Not set"} multiline />
              <InfoRow
                label="Last updated"
                value={profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "—"}
              />
            </div>

            <div className="mt-5">
              <button
                onClick={deleteProfile}
                className="w-full rounded-full border border-red-200 bg-white/70 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50"
              >
                Reset Profile
              </button>
              <p className="mt-2 text-[11px] text-muted">
                Resets profile data saved in localStorage (demo only).
              </p>
            </div>
          </div>

          {/* Middle: Profile CRUD Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-text-dark">Profile Details</h2>
                <span className="text-xs font-semibold text-muted">
                  {editing ? "Editing" : "View Only"}
                </span>
              </div>

              <form id="profileForm" onSubmit={submitProfile} className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name">
                    <input
                      disabled={!editing}
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      className={inputClass(!editing)}
                      placeholder="Admin name"
                    />
                  </Field>

                  <Field label="Email (read-only)">
                    <input
                      disabled
                      value={form.email}
                      className={inputClass(true)}
                      placeholder="admin@edupath.com"
                    />
                  </Field>

                  <Field label="Phone">
                    <input
                      disabled={!editing}
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className={inputClass(!editing)}
                      placeholder="+94 ..."
                    />
                  </Field>

                  <Field label="Avatar">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
                        <AvatarMini avatar={form.avatar} name={form.fullName} />
                      </div>
                      <input
                        disabled={!editing}
                        type="file"
                        accept="image/*"
                        onChange={(e) => onPickAvatar(e.target.files?.[0])}
                        className={`block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-primary/15 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20 ${
                          !editing ? "opacity-60 pointer-events-none" : ""
                        }`}
                      />
                    </div>
                  </Field>
                </div>

                <Field label="Bio">
                  <textarea
                    disabled={!editing}
                    value={form.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    className={`${inputClass(!editing)} min-h-[110px] resize-none`}
                    placeholder="Short admin bio..."
                  />
                </Field>

                {!editing && (
                  <div className="rounded-2xl border border-black/5 bg-white/60 p-4 text-xs text-muted">
                    Click <span className="font-semibold text-text-dark">Edit Profile</span> to update details.
                  </div>
                )}
              </form>
            </div>

            {/* Change Password */}
            <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
              <h2 className="text-base font-semibold text-text-dark">Change Password</h2>

              {pwdMsg && (
                <div
                  className={`mt-4 rounded-2xl border px-4 py-3 text-sm bg-white/70 ${
                    pwdMsg.type === "success"
                      ? "border-emerald-200 text-emerald-700"
                      : "border-red-200 text-red-600"
                  }`}
                >
                  {pwdMsg.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="mt-4 grid gap-4 sm:grid-cols-3">
                <Field label="Current Password">
                  <input
                    type="password"
                    value={pwd.currentPassword}
                    onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))}
                    className={inputClass(false)}
                    placeholder="••••••"
                  />
                </Field>

                <Field label="New Password">
                  <input
                    type="password"
                    value={pwd.newPassword}
                    onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
                    className={inputClass(false)}
                    placeholder="min 6 chars"
                  />
                </Field>

                <Field label="Confirm Password">
                  <input
                    type="password"
                    value={pwd.confirmPassword}
                    onChange={(e) => setPwd((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className={inputClass(false)}
                    placeholder="re-type"
                  />
                </Field>

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-95"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div>
        <br/>
         <AdminFooter />
      </div>

      {/* CREATE ADMIN MODAL POPUP */}
      {showCreateAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[26px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Create New Admin</h3>
            <p className="text-sm text-slate-500 mb-6">
              Fill the details and set a temporary password for the new admin.
            </p>
            
            <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAdminForm.fullName}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, fullName: e.target.value })}
                  placeholder="Eg: Kasun Perera"
                  className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  placeholder="newadmin@edupath.com"
                  className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Temporary Password</label>
                <input
                  type="text"
                  required
                  value={newAdminForm.password}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                  placeholder="Set a temp password..."
                  className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateAdmin(false)}
                  className="flex-1 rounded-full bg-slate-100 py-3 font-semibold text-slate-600 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAdmin}
                  className="flex-1 rounded-full bg-slate-800 py-3 font-semibold text-white shadow-md hover:bg-slate-700 transition disabled:opacity-70"
                >
                  {isCreatingAdmin ? "Creating..." : "Confirm & Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </PageShell>
  );
}

// Sub-components
const Field = ({ label, children }) => (
  <label className="block">
    <span className="text-xs font-semibold text-text-dark">{label}</span>
    <div className="mt-2">{children}</div>
  </label>
);

const inputClass = (disabled) =>
  `w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-text-dark placeholder:text-muted/70 shadow-sm outline-none transition
   focus:border-primary/40 focus:ring-2 focus:ring-primary/20
   ${disabled ? "opacity-70" : "hover:bg-white/80"}`;

const InfoRow = ({ label, value, multiline }) => (
  <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
    <p className="text-[11px] font-semibold text-muted">{label}</p>
    <p className={`mt-1 text-sm text-text-dark ${multiline ? "leading-relaxed" : ""}`}>
      {value}
    </p>
  </div>
);

const AvatarCircle = ({ avatar, name }) => (
  <div className="h-16 w-16 overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-sm">
    {avatar ? (
      <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
    ) : (
      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-primary">
        {getInitials(name)}
      </div>
    )}
  </div>
);

const AvatarMini = ({ avatar, name }) => (
  <div className="h-11 w-11 overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-sm">
    {avatar ? (
      <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
    ) : (
      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
        {getInitials(name)}
      </div>
    )}
  </div>
);

function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "A";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}
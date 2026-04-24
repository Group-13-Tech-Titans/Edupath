import React, { useEffect, useState } from "react";
import axios from "axios";
import PageShell from "../../components/PageShell.jsx";
import AdminFooter from "./AdminFooter.jsx";

const LS_KEY = "edupath_admin_profile_v1";

// API Endpoints
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const GET_ME_API = `${API_URL}/api/auth/me`;
const UPDATE_PROFILE_API = `${API_URL}/api/auth/profile`;
const CREATE_ADMIN_API = `${API_URL}/api/auth/admin/create-user`;
// Added endpoint for password change
const CHANGE_PASSWORD_API = `${API_URL}/api/auth/change-password`; 

export default function AdminProfile() {
  const defaultProfile = {
    id: "",
    email: "",
    fullName: "",
    phone: "",
    bio: "",
    avatar: "", 
    role: "admin",
    updatedAt: null,
  };

  // Main states
  const [profile, setProfile] = useState(defaultProfile);
  const [form, setForm] = useState(defaultProfile);
  const [editing, setEditing] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [toast, setToast] = useState(null);

  // States for creating a new admin
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({ fullName: "", email: "", password: "" });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Password state
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Helper to get Auth Headers 
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2500);
  };

  // Fetch real profile data from backend on mount
  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const res = await axios.get(GET_ME_API, getAuthHeader());
        const userData = res.data.user || res.data;
        
        // Map backend data to frontend state
        const mappedProfile = {
          id: userData._id || userData.id,
          email: userData.email,
          fullName: userData.name || userData.fullName || "EduPath Admin",
          phone: userData.phone || "",
          bio: userData.bio || "",
          avatar: userData.avatar || "",
          role: userData.role || "admin",
          updatedAt: userData.updatedAt,
        };

        setProfile(mappedProfile);
        setForm(mappedProfile);
        localStorage.setItem(LS_KEY, JSON.stringify(mappedProfile));
      } catch (err) {
        console.error("Failed to fetch profile", err);
        // Fallback to local storage if API fails
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          setProfile((p) => ({ ...p, ...saved }));
          setForm((f) => ({ ...f, ...saved }));
        }
      }
    };

    fetchMyProfile();
  }, []);

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

  // Save profile changes to the backend database
  const submitProfile = async (e) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      showToast("error", "Full name is required.");
      return;
    }

    setIsUpdatingProfile(true);

    try {
      // Prepare payload
      const payload = {
        name: form.fullName.trim(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        avatar: form.avatar,
      };

      // Call the backend patch route
      await axios.patch(UPDATE_PROFILE_API, payload, getAuthHeader());

      // Update local state on success
      const nextProfile = {
        ...profile,
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      
      setProfile(nextProfile);
      localStorage.setItem(LS_KEY, JSON.stringify(nextProfile));
      
      setEditing(false);
      showToast("success", "Profile updated successfully in database! ✅");
    } catch (err) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Submit Handler for New Admin Creation
  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setIsCreatingAdmin(true);

    try {
      const payload = {
        name: newAdminForm.fullName,
        email: newAdminForm.email,
        password: newAdminForm.password,
        role: "admin" 
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

  // Real backend password change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdMsg(null);

    // Basic frontend validations
    if (!pwd.currentPassword) {
      setPwdMsg({ type: "error", text: "Enter current password." });
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

    setIsUpdatingPassword(true);

    try {
      const payload = {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword
      };

      // Send request to actual backend route
      await axios.patch(CHANGE_PASSWORD_API, payload, getAuthHeader());

      // On success, clear the form and show success message
      setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwdMsg({ type: "success", text: "Password updated successfully!" });
      
    } catch (err) {
      console.error(err);
      // Display the error message coming directly from your backend controller
      setPwdMsg({ 
        type: "error", 
        text: err.response?.data?.message || "Failed to update password." 
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <PageShell>
      {/* Toast Notification */}
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
                    disabled={isUpdatingProfile}
                    className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow hover:brightness-95 disabled:opacity-70"
                  >
                    {isUpdatingProfile ? "Saving..." : "Save Changes"}
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

            {/* Change Password connected to real API */}
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
                    disabled={isUpdatingPassword}
                    className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-95 disabled:opacity-70"
                  >
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
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
  if (!name) return "A";
  const parts = name.trim().split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "A";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}
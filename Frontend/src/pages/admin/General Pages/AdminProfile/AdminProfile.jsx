import React, { useEffect, useState } from "react";
import axios from "axios";
import PageShell from "../../../../components/PageShell.jsx";
import AdminFooter from "../../../../components/layouts/admin-layouts/AdminFooter.jsx";

// Import all sub-components
import ProfileHeader from "./ProfileHeader";
import ProfileSummary from "./ProfileSummary";
import ProfileEditForm from "./ProfileEditForm";
import PasswordChange from "./PasswordChange";
import CreateAdminModal from "./CreateAdminModal";

const LS_KEY = "edupath_admin_profile_v1";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const GET_ME_API = `${API_URL}/api/auth/me`;
const UPDATE_PROFILE_API = `${API_URL}/api/auth/profile`;
const CREATE_ADMIN_API = `${API_URL}/api/admin/create-user`;
const CHANGE_PASSWORD_API = `${API_URL}/api/auth/change-password`;

export default function AdminProfile() {
  const defaultProfile = { id: "", email: "", fullName: "", phone: "", bio: "", avatar: "", role: "admin", updatedAt: null };

  // State Management
  const [profile, setProfile] = useState(defaultProfile);
  const [form, setForm] = useState(defaultProfile);
  const [editing, setEditing] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` } });

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2500);
  };

  // Fetch Profile Data
  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const res = await axios.get(GET_ME_API, getAuthHeader());
        const userData = res.data.user || res.data;
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
        const saved = JSON.parse(localStorage.getItem(LS_KEY));
        if (saved) {
          setProfile((p) => ({ ...p, ...saved }));
          setForm((f) => ({ ...f, ...saved }));
        }
      }
    };
    fetchMyProfile();
  }, []);

  // Form Handlers
  const onPickAvatar = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const updateField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const submitProfile = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) return showToast("error", "Full name is required.");
    setIsUpdatingProfile(true);

    try {
      const payload = { name: form.fullName.trim(), fullName: form.fullName.trim(), phone: form.phone.trim(), bio: form.bio.trim(), avatar: form.avatar };
      await axios.patch(UPDATE_PROFILE_API, payload, getAuthHeader());

      const nextProfile = { ...profile, ...payload, updatedAt: new Date().toISOString() };
      setProfile(nextProfile);
      localStorage.setItem(LS_KEY, JSON.stringify(nextProfile));
      setEditing(false);
      showToast("success", "Profile updated successfully!");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <PageShell>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed right-4 top-20 z-50">
          <div className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur bg-white/80 ${toast.type === "success" ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-600"}`}>
            {toast.text}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* 1. Extracted Header Component */}
        <ProfileHeader 
          editing={editing} 
          isUpdatingProfile={isUpdatingProfile} 
          onAddAdminClick={() => setShowCreateAdmin(true)} 
          onEditClick={() => { setForm(profile); setEditing(true); }} 
          onCancelClick={() => { setForm(profile); setEditing(false); }} 
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 2. Extracted Left Summary Component */}
          <ProfileSummary profile={profile} />

          <div className="lg:col-span-2 space-y-6">
            {/* 3. Extracted Middle Form Component */}
            <ProfileEditForm 
              form={form} 
              editing={editing} 
              updateField={updateField} 
              onPickAvatar={onPickAvatar} 
              submitProfile={submitProfile} 
            />

            {/* 4. Extracted Password Component */}
            <PasswordChange 
              changePasswordApi={CHANGE_PASSWORD_API} 
              getAuthHeader={getAuthHeader} 
            />
          </div>
        </div>
      </div>
      
      <div><br/><AdminFooter /></div>

      {/* 5. Extracted Modal Component */}
      {showCreateAdmin && (
        <CreateAdminModal 
          onClose={() => setShowCreateAdmin(false)} 
          createAdminApi={CREATE_ADMIN_API} 
          getAuthHeader={getAuthHeader} 
          showToast={showToast} 
        />
      )}
    </PageShell>
  );
}
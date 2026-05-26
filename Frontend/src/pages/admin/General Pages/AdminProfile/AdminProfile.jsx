import React, { useEffect, useState } from "react";
import axios from "axios";
import PageShell from "../../../../components/PageShell.jsx";
import AdminFooter from "../../../../components/layouts/admin-layouts/AdminFooter.jsx";

//import sub components
import ProfileHeader from "./ProfileHeader";
import ProfileSummary from "./ProfileSummary";
import ProfileEditForm from "./ProfileEditForm";
import PasswordChange from "./PasswordChange";
import CreateAdminModal from "./CreateAdminModal";

//import endpoints and constants
const LS_KEY = "edupath_admin_profile_v1";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; 
const GET_ME_API = `${API_URL}/api/auth/me`;
const UPDATE_PROFILE_API = `${API_URL}/api/auth/profile`; 
const CREATE_ADMIN_API = `${API_URL}/api/admin/create-user`; 
const CHANGE_PASSWORD_API = `${API_URL}/api/auth/change-password`;  

export default function AdminProfile() {
  // Structure for an empty or default profile state
  const defaultProfile = {
    id: "",
    email: "",
    fullName: "",
    phone: "",
    bio: "",
    role: "admin",
    updatedAt: null,
  };
  // State management for profile data, UI controls, and feedback
  const [profile, setProfile] = useState(defaultProfile); 
  const [form, setForm] = useState(defaultProfile);
  const [editing, setEditing] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);

  //helper function to JWT auth header for API requests
  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("edupath_token")}`,
    },
  });

  // Helper function to show toast notifications
  const showToast = (type, text) => {
    toast({ type, text });
    setTimeout(() => setToast(null), 2500); // Auto-dismiss after 2.5 seconds
  };

  // Fetch the admin's profile data 
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


  const updateField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const submitProfile = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim())
      return showToast("error", "Full name is required.");
    setIsUpdatingProfile(true); 

    
    try {
      //build payload with trimmed values  with trim
      const payload = {
        name: form.fullName.trim(), 
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
      };
      
      await axios.patch(UPDATE_PROFILE_API, payload, getAuthHeader());

      const nextProfile = {
        ...profile,
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      setProfile(nextProfile);
      localStorage.setItem(LS_KEY, JSON.stringify(nextProfile));
      setEditing(false);
      showToast("success", "Profile updated successfully!");
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || "Failed to update profile.",
      );
    } finally {
      setIsUpdatingProfile(false); 
    }
  };

  return (
    <PageShell>
      {/* Shows success or error popups dynamically */}
      {toast && (
        <div className="fixed right-4 top-20 z-50">
          <div className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur bg-white/80 ${toast.type === "success" ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-600"}`}>
            {toast.text}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header with profile title and action buttons */}
        <ProfileHeader
          editing={editing}
          isUpdatingProfile={isUpdatingProfile}
          onAddAdminClick={() => setShowCreateAdmin(true)}
          onEditClick={() => {
            setForm(profile);
            setEditing(true);
          }}
          onCancelClick={() => {
            setForm(profile);
            setEditing(false);
          }}
        />
      {/* profile summary */}
        <div className="grid gap-6 lg:grid-cols-3">
          <ProfileSummary profile={profile} />

          <div className="lg:col-span-2 space-y-6">
            {/* profile edit form */}
            <ProfileEditForm
              form={form}
              editing={editing}
              updateField={updateField}
              submitProfile={submitProfile} 
              // FIXED: Removed onPickAvatar prop
            />

          {/* password change form */}
            <PasswordChange
              changePasswordApi={CHANGE_PASSWORD_API}
              getAuthHeader={getAuthHeader}
            />
          </div>
        </div>
      </div>

          {/* Create Admin Modal for adding new admin users */}
      {showCreateAdmin && (
        <CreateAdminModal
          onClose={() => setShowCreateAdmin(false)}
          createAdminApi={CREATE_ADMIN_API}
          getAuthHeader={getAuthHeader}
          showToast={showToast}
        />
      )}
      <br/>
      {/* Admin footer  */}
      <AdminFooter />
    </PageShell>
  );
}
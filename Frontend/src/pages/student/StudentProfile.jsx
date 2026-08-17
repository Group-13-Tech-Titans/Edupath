/**
 * STUDENT PROFILE COMPONENT
 * Premium redesign with glassmorphism, rich typography, and dynamic animations.
 */

import React, { useEffect, useMemo, useState, useRef } from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import { uploadAvatarFile } from "../../api/uploadApi.js";
import { Camera, User, Mail, Phone, Calendar, GraduationCap, Lock, Save, ShieldCheck, UserCircle, Key } from "lucide-react";

// --- STATE INITIALIZATION HELPER ---
function getInitial(currentUser) {
  const p = currentUser?.profile || {};
  const name = currentUser?.name || "";
  const email = currentUser?.email || "";
  const avatar = currentUser?.avatar || "";

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
    avatar,
    newPassword: "",
    confirmPassword: ""
  };
}

export default function StudentProfile() {
  const { currentUser, updateUserProfile } = useApp();

  const initial = useMemo(() => getInitial(currentUser), [currentUser]);
  const [form, setForm] = useState(initial);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [form.avatar]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      setMsg({ type: "", text: "" });
      const res = await uploadAvatarFile(file);
      if (res.success && res.url) {
        setForm(prev => ({ ...prev, avatar: res.url }));
        setMsg({ type: "success", text: "Profile image uploaded! Click Save Changes to apply." });
      }
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Failed to upload image." });
    } finally {
      setUploadingAvatar(false);
      e.target.value = null; // reset input
    }
  };

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
        avatar: form.avatar,
        profile
      };

      if (form.newPassword) body.password = form.newPassword;

      const result = await updateUserProfile(body);
      
      if (result.success) {
        setMsg({ type: "success", text: "Profile updated successfully ✅" });
        setForm((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
      } else {
        setMsg({ type: "error", text: result.message || "Update failed." });
      }
      
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Update failed." });
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <PageShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      </PageShell>
    );
  }

  const initials = (currentUser?.name || "S")
      .split(" ")
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join("") || "S";

  // --- STYLING CONSTANTS ---
  const inputWrapper = "relative flex items-center";
  const iconClass = "absolute left-4 text-emerald-600/60 pointer-events-none";
  const inputClass = "w-full rounded-2xl border border-white/40 bg-white/60 pl-[3.25rem] pr-4 py-3.5 text-[15px] font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-400 hover:border-emerald-300 shadow-sm shadow-emerald-900/5 backdrop-blur-sm";
  const labelClass = "mb-2 block text-xs font-extrabold uppercase tracking-widest text-emerald-900/70 ml-1";

  return (
    <PageShell>
      <div className="min-h-[calc(100vh-80px)] bg-[#f4fbfa] px-4 py-12 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-100/50 to-transparent pointer-events-none" />
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] rounded-full bg-teal-200/20 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-5xl relative z-10">
          
          {/* Header Section */}
          <div className="mb-10 text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100/50 rounded-2xl mb-4 text-emerald-600 border border-emerald-200/50">
              <UserCircle size={32} strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Student Profile</h1>
            <p className="mt-3 text-sm font-medium text-slate-500 max-w-md">
              Manage your personal information, contact details, and account security in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Avatar & Summary Card */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="rounded-[2.5rem] bg-white/80 p-8 shadow-xl shadow-emerald-900/5 border border-white backdrop-blur-md flex flex-col items-center text-center relative overflow-hidden transition-all hover:shadow-emerald-900/10">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-400 to-teal-500" />
                
                <div 
                  className="relative h-32 w-32 mt-12 mb-6 rounded-[2rem] bg-white p-2 shadow-2xl shadow-emerald-900/20 group cursor-pointer transition-transform hover:scale-105"
                  onClick={handleAvatarClick}
                >
                  <div className="h-full w-full overflow-hidden rounded-[1.5rem] bg-emerald-100 flex items-center justify-center relative">
                    {form.avatar && !imgError ? (
                      <img 
                        src={form.avatar} 
                        alt="Profile" 
                        className="h-full w-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <span className="text-4xl font-black text-emerald-600 tracking-widest">{initials}</span>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-sm">
                      <Camera size={28} className="text-white mb-1 drop-shadow-md" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider drop-shadow-md">Change</span>
                    </div>

                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <div className="h-6 w-6 rounded-full border-3 border-emerald-200 border-t-emerald-600 animate-spin mb-2" />
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest animate-pulse">Uploading</span>
                      </div>
                    )}
                  </div>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/*" 
                  className="hidden" 
                />

                <h2 className="text-2xl font-black text-slate-800">{currentUser?.name}</h2>
                <p className="text-sm font-semibold text-emerald-600 mt-1">{currentUser?.email}</p>
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                  <ShieldCheck size={14} />
                  <span>Verified Student</span>
                </div>
              </div>
            </div>

            {/* Right Column: Form Fields */}
            <div className="lg:col-span-8">
              <div className="rounded-[2.5rem] bg-white/70 p-8 shadow-xl shadow-emerald-900/5 border border-white backdrop-blur-md">
                
                {msg.text && (
                  <div className={`mb-8 flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm ${msg.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60" : "bg-red-50 text-red-800 border border-red-200/60"}`}>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${msg.type === "success" ? "bg-emerald-200/50 text-emerald-600" : "bg-red-200/50 text-red-600"}`}>
                      {msg.type === "success" ? <ShieldCheck size={16} /> : "!"}
                    </div>
                    {msg.text}
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-10">
                  
                  {/* Personal Info Section */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-8 w-1.5 bg-emerald-500 rounded-full" />
                      <h3 className="text-lg font-black text-slate-800">Personal Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                      <div>
                        <label htmlFor="firstName" className={labelClass}>First Name</label>
                        <div className={inputWrapper}>
                          <User size={18} className={iconClass} />
                          <input
                            id="firstName"
                            name="firstName"
                            value={form.firstName}
                            onChange={onChange}
                            className={inputClass}
                            placeholder="Enter your first name"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="lastName" className={labelClass}>Last Name</label>
                        <div className={inputWrapper}>
                          <User size={18} className={iconClass} />
                          <input
                            id="lastName"
                            name="lastName"
                            value={form.lastName}
                            onChange={onChange}
                            className={inputClass}
                            placeholder="Enter your last name"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="dob" className={labelClass}>Date of Birth</label>
                        <div className={inputWrapper}>
                          <Calendar size={18} className={iconClass} />
                          <input
                            id="dob"
                            type="date"
                            name="dob"
                            value={form.dob}
                            onChange={onChange}
                            className={`${inputClass} !pr-4`} // Override default date picker padding somewhat if needed
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="educationLevel" className={labelClass}>Education Level</label>
                        <div className={inputWrapper}>
                          <GraduationCap size={18} className={iconClass} />
                          <select
                            id="educationLevel"
                            name="educationLevel"
                            value={form.educationLevel}
                            onChange={onChange}
                            className={`${inputClass} appearance-none`}
                            required
                          >
                            <option value="">Select level</option>
                            <option value="High School">High School</option>
                            <option value="Undergraduate">Undergraduate</option>
                            <option value="Postgraduate">Postgraduate</option>
                            <option value="Professional">Professional</option>
                          </select>
                          {/* Custom dropdown arrow */}
                          <div className="absolute right-4 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="contact" className={labelClass}>Contact Number</label>
                        <div className={inputWrapper}>
                          <Phone size={18} className={iconClass} />
                          <input
                            id="contact"
                            name="contact"
                            value={form.contact}
                            onChange={onChange}
                            className={inputClass}
                            placeholder="e.g. +94 7X XXX XXXX"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="email" className={labelClass}>Email Address</label>
                        <div className={inputWrapper}>
                          <Mail size={18} className={iconClass} />
                          <input
                            id="email"
                            value={form.email}
                            disabled
                            className={`${inputClass} !bg-slate-100/50 !text-slate-400 !border-slate-200 cursor-not-allowed`}
                          />
                          <div className="absolute right-4 px-2 py-1 bg-slate-200/50 text-[10px] font-bold text-slate-500 rounded uppercase tracking-wider">
                            Fixed
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent my-8" />

                  {/* Security Section */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-8 w-1.5 bg-teal-500 rounded-full" />
                      <h3 className="text-lg font-black text-slate-800">Security Settings</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                      <div>
                        <label htmlFor="newPassword" className={labelClass}>New Password</label>
                        <div className={inputWrapper}>
                          <Key size={18} className={iconClass} />
                          <input
                            id="newPassword"
                            type={showPw ? "text" : "password"}
                            name="newPassword"
                            value={form.newPassword}
                            onChange={onChange}
                            className={`${inputClass} pr-20`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw((s) => !s)}
                            className="absolute right-2 px-3 py-1.5 bg-white shadow-sm border border-slate-100 rounded-xl text-[10px] font-bold tracking-widest text-slate-500 hover:text-emerald-600 transition-colors"
                          >
                            {showPw ? "HIDE" : "SHOW"}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
                        <div className={inputWrapper}>
                          <Lock size={18} className={iconClass} />
                          <input
                            id="confirmPassword"
                            type={showPw2 ? "text" : "password"}
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={onChange}
                            className={`${inputClass} pr-20`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw2((s) => !s)}
                            className="absolute right-2 px-3 py-1.5 bg-white shadow-sm border border-slate-100 rounded-xl text-[10px] font-bold tracking-widest text-slate-500 hover:text-emerald-600 transition-colors"
                          >
                            {showPw2 ? "HIDE" : "SHOW"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Action Bar */}
                  <div className="pt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="group flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[1.25rem] px-8 py-4 text-sm font-black tracking-widest shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none disabled:transform-none"
                    >
                      {saving ? (
                        <>
                          <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          <span>SAVING...</span>
                        </>
                      ) : (
                        <>
                          <Save size={18} className="transition-transform group-hover:scale-110" />
                          <span>SAVE CHANGES</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            </div>
            
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">EduPath • Student Dashboard</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import { passwordRegex } from "../../utils/validation.js";
import axios from "axios";
import { DollarSign, TrendingUp, ArrowDownToLine, CreditCard, Building, CheckCircle2, Receipt } from "lucide-react";

const LKR_RATE = 310.0;
const formatDual = (usdVal) => {
  const usd = Number(usdVal || 0);
  const lkr = usd * LKR_RATE;
  return {
    usdStr: `$${usd.toFixed(2)} USD`,
    lkrStr: `Rs. ${lkr.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LKR`,
    combinedStr: `$${usd.toFixed(2)} USD (Rs. ${lkr.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LKR)`
  };
};

// Builds the educator account settings page
const EducatorProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, updateUserProfile, logoutAllDevices, refreshCurrentUser } = useApp();


  const profileRef = useRef(null);
  const securityRef = useRef(null);
  const payoutRef = useRef(null);
  const notificationsRef = useRef(null);
  const deactivateRef = useRef(null);
  const contactRef = useRef(null);
  const contactAdminRef = useRef(null);

  const [activeSection, setActiveSection] = useState("profile");
  // Scrolls to a selected settings section
  const scrollToSection = (key, ref) => {
    setActiveSection(key);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Scrolls to payout details from the payouts page
  useEffect(() => {
    if (location.hash === "#payout-details") {
      setTimeout(() => {
        scrollToSection("payout", payoutRef);
      }, 0);
    }
  }, [location.hash]);

  // Builds the default profile avatar
  const defaultAvatar = useMemo(() => {
    const svg = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="420" height="420">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#7ff0de"/>
            <stop offset="1" stop-color="#1ebea5"/>
          </linearGradient>
          <radialGradient id="glow" cx="40%" cy="30%" r="70%">
            <stop offset="0" stop-color="rgba(255,255,255,0.85)"/>
            <stop offset="1" stop-color="rgba(255,255,255,0)"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" rx="80" fill="url(#bg)"/>
        <circle cx="160" cy="140" r="150" fill="url(#glow)"/>
        <circle cx="210" cy="175" r="70" fill="rgba(255,255,255,0.9)"/>
        <path d="M120 330c18-52 60-78 90-78s72 26 90 78" fill="rgba(255,255,255,0.9)" />
        <circle cx="235" cy="158" r="8" fill="rgba(0,0,0,0.18)"/>
        <circle cx="190" cy="158" r="8" fill="rgba(0,0,0,0.18)"/>
        <path d="M190 195c18 16 38 16 55 0" stroke="rgba(0,0,0,0.18)" stroke-width="8" fill="none" stroke-linecap="round"/>
      </svg>
    `);
    return `data:image/svg+xml;charset=utf-8,${svg}`;
  }, []);

  const [profileImage, setProfileImage] = useState(defaultAvatar);

  // Updates the profile photo preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setProfileMsg({ type: "error", text: "Profile photo must be 2MB or smaller." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
      setProfileMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // Splits a full name into first and last name
  const splitName = (fullName) => {
    if (!fullName) return { firstName: "", lastName: "" };
    const parts = fullName.trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    return { firstName, lastName };
  };

  const getSavedSpecialization = (profile = {}) =>
    profile.specialization || profile["expert" + "iseArea"] || "";

  // ----- Profile form (populated from currentUser) -----
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    specialization: "",
    yearsExperience: "",
    bio: ""
  });

  // Stores payout form fields
  const [payoutForm, setPayoutForm] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    branch: "",
    billingAddress: ""
  });
  const [earningsData, setEarningsData] = useState(null);

  // Fetch earnings and payout history for profile
  useEffect(() => {
    const loadEarnings = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api"}/educator/earnings`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setEarningsData(res.data);
        }
      } catch (err) {
        console.error("Failed to load earnings in profile:", err);
      }
    };
    loadEarnings();
    if (refreshCurrentUser) refreshCurrentUser();
  }, [refreshCurrentUser]);


  // ----- Security form -----
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // ----- Specialization Request -----
  const [specializationsList, setSpecializationsList] = useState([]);
  const [specializationForm, setSpecializationForm] = useState({ requestedSpecialization: "", reason: "" });
  const [pendingRequest, setPendingRequest] = useState(null);
  const [specMsg, setSpecMsg] = useState(null);
  const [submittingSpec, setSubmittingSpec] = useState(false);

  // ----- Contact Admin -----
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [contactMsg, setContactMsg] = useState(null);
  const [submittingContact, setSubmittingContact] = useState(false);

  const handleContactSubmit = async () => {
    setContactMsg(null);
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      setContactMsg({ type: "error", text: "Please fill out both Subject and Message." });
      return;
    }

    setSubmittingContact(true);
    try {
      const token = localStorage.getItem("edupath_token");
      const res = await fetch("http://localhost:5000/api/specializations/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subject: contactForm.subject,
          message: contactForm.message
        })
      });
      
      let data = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else if (!res.ok) {
        throw new Error("Server returned an invalid response (not JSON). Did you restart the backend server?");
      }

      if (res.ok) {
        setContactMsg({ type: "success", text: "Message sent to admin successfully." });
        setContactForm({ subject: "", message: "" });
      } else {
        setContactMsg({ type: "error", text: data.message || "Failed to send message." });
      }
    } catch (err) {
      console.error("Contact Submit Error:", err);
      setContactMsg({ type: "error", text: err.message === "Failed to fetch" ? "Network error. Is the server running?" : (err.message || "An error occurred while sending.") });
    } finally {
      setSubmittingContact(false);
    }
  };

  // Fetch specializations and current pending request
  useEffect(() => {
    const fetchSpecData = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        const headers = { Authorization: `Bearer ${token}` };
        
        const [specRes, reqRes] = await Promise.all([
          fetch("http://localhost:5000/api/specializations", { headers }),
          fetch("http://localhost:5000/api/specializations/requests/my", { headers })
        ]);

        if (specRes.ok) {
          const specData = await specRes.json();
          setSpecializationsList(specData.specializations || []);
        }
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          setPendingRequest(reqData.request || null);
        }
      } catch (err) {
        console.error("Failed to fetch specialization data", err);
      }
    };
    if (currentUser) fetchSpecData();
  }, [currentUser]);

  const handleSpecializationSubmit = async () => {
    setSpecMsg(null);
    if (!profileForm.contact || !specializationForm.requestedSpecialization || !specializationForm.reason.trim()) {
      setSpecMsg({ type: "error", text: "Please fill out all fields (contact, specialization, reason)." });
      return;
    }

    setSubmittingSpec(true);
    try {
      const token = localStorage.getItem("edupath_token");
      const res = await fetch("http://localhost:5000/api/specializations/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
          email: profileForm.email,
          contactNumber: profileForm.contact,
          requestedSpecialization: specializationForm.requestedSpecialization,
          reason: specializationForm.reason
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSpecMsg({ type: "success", text: "Request submitted successfully." });
        setPendingRequest(data.request);
        setSpecializationForm({ requestedSpecialization: "", reason: "" });
      } else {
        setSpecMsg({ type: "error", text: data.message || "Failed to submit request." });
      }
    } catch (err) {
      setSpecMsg({ type: "error", text: "An error occurred while submitting." });
    } finally {
      setSubmittingSpec(false);
    }
  };

  // ----- Notifications -----
  const [notifications, setNotifications] = useState({
    mentorshipRequests: true,
    reviewsRatings: true,
    payoutUpdates: true,
    softwareUpdates: true
  });

  // Turns a notification setting on or off
  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ----- Feedback states -----
  const [profileMsg, setProfileMsg] = useState(null);   
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [payoutMsg, setPayoutMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPayout, setSavingPayout] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const isContactInvalid = profileForm.contact !== "" && !/^0\d{9}$/.test(profileForm.contact);
  const bioWordLimit = 30;
  const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;
  const limitBioWords = (text) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length > bioWordLimit ? words.slice(0, bioWordLimit).join(" ") : text;
  };
  const bioWordsLeft = bioWordLimit - countWords(profileForm.bio);

  // Fills forms from the current user
  useEffect(() => {
    if (!currentUser) return;
    const { firstName, lastName } = splitName(currentUser.name);
    const p = currentUser.profile || {};
    setProfileForm({
      firstName,
      lastName,
      email: currentUser.email || "",
      contact: p.contact || "",
      specialization: getSavedSpecialization(p) || currentUser.specializationTag || "",
      yearsExperience: p.yearsExperience || "",
      bio: p.bio || ""
    });
    const payout = p.payout || {};
    setPayoutForm({
      bankName: payout.bankName || "",
      accountNumber: payout.accountNumber || "",
      accountHolder: payout.accountHolder || (currentUser.name || ""),
      branch: payout.branch || "",
      billingAddress: payout.billingAddress || ""
    });
    if (p.notifications) {
      setNotifications(p.notifications);
    }
    setProfileImage(p.profileImage || defaultAvatar);
  }, [currentUser]);

  // Saves profile details
  const handleSaveProfile = async () => {
    if (isContactInvalid) {
      setProfileMsg(null);
      return;
    }
    setSavingProfile(true);
    setProfileMsg(null);
    const fullName = `${profileForm.firstName.trim()} ${profileForm.lastName.trim()}`.trim();
    const result = await updateUserProfile({
      name: fullName,
      profile: {
        ...(currentUser?.profile || {}),
        contact: profileForm.contact,
        specialization: getSavedSpecialization(currentUser?.profile) || currentUser?.specializationTag || profileForm.specialization,
        yearsExperience: profileForm.yearsExperience,
        bio: profileForm.bio,
        profileImage: profileImage === defaultAvatar
          ? currentUser?.profile?.profileImage
          : profileImage
      }
    });
    setSavingProfile(false);
    if (result.success) {
      setProfileMsg({ type: "success", text: "Profile saved successfully." });
    } else {
      setProfileMsg({ type: "error", text: result.message || "Failed to save profile." });
    }
  };

  // Resets profile details from the current user
  const handleResetProfile = () => {
    if (!currentUser) return;
    const { firstName, lastName } = splitName(currentUser.name);
    const p = currentUser.profile || {};
    setProfileForm({
      firstName,
      lastName,
      email: currentUser.email || "",
      contact: p.contact || "",
      specialization: getSavedSpecialization(p) || currentUser.specializationTag || "",
      yearsExperience: p.yearsExperience || "",
      bio: p.bio || ""
    });
    setProfileImage(p.profileImage || defaultAvatar);
    setProfileMsg(null);
  };

  // Updates the educator password
  const handleUpdatePassword = async () => {
    setPasswordMsg(null);
    const isChangingPassword =
      securityForm.currentPassword ||
      securityForm.newPassword ||
      securityForm.confirmPassword;

    if (isChangingPassword) {
      if (!securityForm.currentPassword) {
        setPasswordMsg({ type: "error", text: "Please enter your current password." });
        return;
      }
      if (!securityForm.newPassword) {
        setPasswordMsg({ type: "error", text: "Please enter a new password." });
        return;
      }
      if (!passwordRegex.test(securityForm.newPassword)) {
        setPasswordMsg({
          type: "error",
          text: "Password must be 8+ characters with uppercase, lowercase, number and special character.",
        });
        return;
      }
      if (securityForm.newPassword !== securityForm.confirmPassword) {
        setPasswordMsg({ type: "error", text: "New passwords do not match." });
        return;
      }
      if (securityForm.currentPassword === securityForm.newPassword) {
        setPasswordMsg({ type: "error", text: "New password must be different from the current password." });
        return;
      }
    }
    setSavingPassword(true);
    const result = await updateUserProfile({
      ...(isChangingPassword
        ? {
            password: securityForm.newPassword,
            currentPassword: securityForm.currentPassword
          }
        : {})
    });
    setSavingPassword(false);
    if (result.success) {
      setPasswordMsg({ type: "success", text: "Password updated successfully." });
      setSecurityForm((s) => ({ ...s, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } else {
      setPasswordMsg({ type: "error", text: result.message || "Failed to update password." });
    }
  };

  // Saves payout details
  const handleSavePayout = async () => {
    setSavingPayout(true);
    setPayoutMsg(null);
    const result = await updateUserProfile({
      profile: {
        ...(currentUser?.profile || {}),
        payout: { ...payoutForm }
      }
    });
    setSavingPayout(false);
    if (result.success) {
      if (refreshCurrentUser) await refreshCurrentUser();
      setPayoutMsg({ type: "success", text: "Payout details saved successfully." });
    } else {
      setPayoutMsg({ type: "error", text: result.message || "Failed to save payout details." });
    }
  };

  // Resets payout details from the current user
  const handleResetPayout = () => {
    const payout = currentUser?.profile?.payout || {};
    setPayoutForm({
      bankName: payout.bankName || "",
      accountNumber: payout.accountNumber || "",
      accountHolder: payout.accountHolder || (currentUser?.name || ""),
      branch: payout.branch || "",
      billingAddress: payout.billingAddress || ""
    });
    setPayoutMsg(null);
  };

  // ----- Components -----
  // Shows an on off toggle
  const Toggle = ({ enabled, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={enabled}
      className={`relative h-6 w-12 rounded-full transition ${
        enabled ? "bg-primary" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );

  // Shows one sidebar navigation item
  const SideItem = ({ title, subtitle, active, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-6 py-4 text-left transition ${
        active
          ? "bg-primary/15 border-primary/30 shadow-sm"
          : "bg-white/70 border-black/20 hover:bg-white/85"
      }`}
    >
      <div className="text-sm font-semibold text-text-dark">{title}</div>
      <div className="mt-0.5 text-xs text-muted">{subtitle}</div>
    </button>
  );

  // Shows a success or error message
  const FeedbackBanner = ({ msg }) => {
    if (!msg) return null;
    return (
      <div className={`rounded-xl px-4 py-2 text-sm font-medium ${
        msg.type === "success"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}>
        {msg.text}
      </div>
    );
  };

  const labelCls = "block text-xs font-medium text-text-dark mb-1";
  const inputCls =
    "w-full rounded-xl border border-primary/30 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/25";

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Shows the settings page heading */}
          <div>
            <h1 className="text-lg font-semibold text-text-dark">Account Settings</h1>
            <p className="mt-1 text-xs text-muted">
              Update your educator profile
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/mentor")}
            className="btn-primary px-6 py-2 text-sm self-start sm:self-auto"
          >
            Switch to Mentor Portal
          </button>
        </div>

        {/* Splits sidebar navigation and settings forms */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="glass-card p-5 space-y-4 self-start">
            <SideItem
              title="Profile"
              subtitle="Name, bio, specialization"
              active={activeSection === "profile"}
              onClick={() => scrollToSection("profile", profileRef)}
            />
            <SideItem
              title="Security"
              subtitle="Password & Login"
              active={activeSection === "security"}
              onClick={() => scrollToSection("security", securityRef)}
            />
            <SideItem
              title="Payout Details"
              subtitle="Bank Account Info"
              active={activeSection === "payout"}
              onClick={() => scrollToSection("payout", payoutRef)}
            />
            <SideItem
              title="Notifications"
              subtitle="Email Alerts"
              active={activeSection === "notifications"}
              onClick={() => scrollToSection("notifications", notificationsRef)}
            />
            <SideItem
              title="Specialization Change"
              subtitle="Request New Specialization"
              active={activeSection === "contact"}
              onClick={() => scrollToSection("contact", contactRef)}
            />
            <SideItem
              title="Contact Admin"
              subtitle="Send a Message"
              active={activeSection === "contactAdmin"}
              onClick={() => scrollToSection("contactAdmin", contactAdminRef)}
            />
          </div>

          {/* Right handed section */}
          <div className="lg:col-span-3 space-y-6">

            {/* Profile Details */}
            <section ref={profileRef} className="glass-card p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-text-dark">Profile</h2>
                <p className="text-xs text-muted mt-1">
                  Update your personal details visible to others
                </p>
              </div>

              {/* Profile photo */}
              <div className="flex flex-col items-center gap-3">
                <div className="h-28 w-28 overflow-hidden rounded-full border border-primary/30 shadow">
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                </div>
                <label className="text-xs font-medium text-primary cursor-pointer hover:opacity-90">
                  Change Photo
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>First Name</label>
                  <input
                    className={inputCls}
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Last Name</label>
                  <input
                    className={inputCls}
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
                  />
                </div>

                <div>
                  <label className={labelCls}>Email</label>
                  <input className={`${inputCls} opacity-80`} value={profileForm.email} readOnly />
                  <p className="mt-1 text-[11px] text-muted">
                    Please contact admin to amend if this email is no longer accessible
                  </p>
                </div>
                <div>
                  <label className={labelCls}>Contact Number</label>
                  <input
                    className={inputCls}
                    inputMode="numeric"
                    pattern="0[0-9]{9}"
                    value={profileForm.contact}
                    onChange={(e) => setProfileForm((p) => ({ ...p, contact: e.target.value }))}
                  />
                  {isContactInvalid && (
                    <p className="mt-1 text-[11px] font-medium text-red-600">
                      Invalid format. Please enter a contact number of 10 digits.
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Specialization</label>
                  <input
                    className={`${inputCls} cursor-not-allowed bg-gray-50 opacity-80`}
                    value={profileForm.specialization}
                    readOnly
                  />
                  <p className="mt-1 text-[11px] text-muted">
                    Please contact the admin to amend specialization
                  </p>
                </div>
              </div>

              {/* Lets the educator edit their bio */}
              <div>
                <label className={labelCls}>Bio</label>
                <div className="relative">
                  <p className="absolute left-4 top-2 text-[11px] font-medium text-muted">
                    {bioWordsLeft} words left
                  </p>
                  <textarea
                    className={`${inputCls} pt-8`}
                    rows={4}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm((p) => ({ ...p, bio: limitBioWords(e.target.value) }))}
                  />
                </div>
              </div>

              <FeedbackBanner msg={profileMsg} />

              {/* Profile reset and save buttons */}
              <div className="flex justify-end gap-3">
                <button type="button" className="btn-soft px-6 py-2 text-sm" onClick={handleResetProfile}>
                  Reset
                </button>
                <button
                  type="button"
                  className="btn-primary px-6 py-2 text-sm"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </section>

            {/* Security*/}
            <section ref={securityRef} className="glass-card p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-text-dark">Security</h2>
                <p className="text-xs text-muted mt-1">Update your password to keep your account secure.</p>
              </div>

              {/* Holds password fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Current Password</label>
                  <input
                    className={inputCls}
                    type="password"
                    value={securityForm.currentPassword}
                    placeholder="Enter current password"
                    onChange={(e) => setSecurityForm((s) => ({ ...s, currentPassword: e.target.value }))}
                  />
                </div>

                <div>
                  <label className={labelCls}>New Password</label>
                  <input
                    className={inputCls}
                    type="password"
                    value={securityForm.newPassword}
                    placeholder="8+ chars with uppercase, lowercase, number and symbol"
                    onChange={(e) => setSecurityForm((s) => ({ ...s, newPassword: e.target.value }))}
                  />
                </div>

                <div>
                  <label className={labelCls}>Confirm New Password</label>
                  <input
                    className={inputCls}
                    type="password"
                    value={securityForm.confirmPassword}
                    placeholder="Confirm new password"
                    onChange={(e) => setSecurityForm((s) => ({ ...s, confirmPassword: e.target.value }))}
                  />
                </div>

              </div>

              <FeedbackBanner msg={passwordMsg} />

              {/* Holds password reset and update buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="btn-soft px-6 py-2 text-sm"
                  onClick={() => {
                    setSecurityForm((s) => ({ ...s, currentPassword: "", newPassword: "", confirmPassword: "" }));
                    setPasswordMsg(null);
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="btn-primary px-6 py-2 text-sm"
                  onClick={handleUpdatePassword}
                  disabled={savingPassword}
                >
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </section>

            {/* Payout Details & Earnings Summary */}
            <section id="payout-details" ref={payoutRef} className="glass-card p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="font-semibold text-text-dark text-lg">Payout &amp; Earnings Overview</h2>
                    <p className="text-xs text-muted mt-0.5">
                      Your current earnings, payout balance, and configured disbursement methods.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/educator/payouts")}
                    className="btn-soft px-4 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage Payouts</span> &rarr;
                  </button>
                </div>
              </div>

              {/* Earnings Stat Cards (USD & LKR) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl p-4 bg-emerald-50/60 border border-emerald-200">
                  <p className="text-xs font-medium text-emerald-800">Available Balance</p>
                  <p className="text-xl font-black text-emerald-700 mt-1">
                    {formatDual(earningsData?.stats?.currentBalanceUSD ?? currentUser?.educatorEarnings?.currentBalanceUSD).usdStr}
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                    {formatDual(earningsData?.stats?.currentBalanceUSD ?? currentUser?.educatorEarnings?.currentBalanceUSD).lkrStr}
                  </p>
                </div>

                <div className="rounded-2xl p-4 bg-slate-50 border border-black/5">
                  <p className="text-xs font-medium text-slate-500">Total Lifetime Earned</p>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {formatDual(earningsData?.stats?.totalEarnedUSD ?? currentUser?.educatorEarnings?.totalEarnedUSD).usdStr}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    {formatDual(earningsData?.stats?.totalEarnedUSD ?? currentUser?.educatorEarnings?.totalEarnedUSD).lkrStr}
                  </p>
                </div>

                <div className="rounded-2xl p-4 bg-slate-50 border border-black/5">
                  <p className="text-xs font-medium text-slate-500">Total Withdrawn</p>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {formatDual(earningsData?.stats?.withdrawnUSD ?? currentUser?.educatorEarnings?.withdrawnUSD).usdStr}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    {formatDual(earningsData?.stats?.withdrawnUSD ?? currentUser?.educatorEarnings?.withdrawnUSD).lkrStr}
                  </p>
                </div>
              </div>

              {/* Bank Payout Method Form */}
              <div className="pt-2">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  Bank Account Payout Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Bank Name</label>
                    <input
                      className={inputCls}
                      placeholder="e.g. Commercial Bank of Ceylon"
                      value={payoutForm.bankName}
                      onChange={(e) => setPayoutForm((p) => ({ ...p, bankName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Account Number</label>
                    <input
                      className={inputCls}
                      placeholder="e.g. 8001234567"
                      value={payoutForm.accountNumber}
                      onChange={(e) => setPayoutForm((p) => ({ ...p, accountNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Account Holder Name</label>
                    <input
                      className={inputCls}
                      placeholder="Name on bank account"
                      value={payoutForm.accountHolder}
                      onChange={(e) => setPayoutForm((p) => ({ ...p, accountHolder: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Branch</label>
                    <input
                      className={inputCls}
                      placeholder="e.g. Colombo Main"
                      value={payoutForm.branch}
                      onChange={(e) => setPayoutForm((p) => ({ ...p, branch: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className={labelCls}>Billing Address (Optional)</label>
                  <textarea
                    className={inputCls}
                    rows={2}
                    placeholder="Your official address for tax & payout billing"
                    value={payoutForm.billingAddress}
                    onChange={(e) => setPayoutForm((p) => ({ ...p, billingAddress: e.target.value }))}
                  />
                </div>

                <FeedbackBanner msg={payoutMsg} />

                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" className="btn-soft px-6 py-2 text-sm" onClick={handleResetPayout}>
                    Reset
                  </button>
                  <button
                    type="button"
                    className="btn-primary px-6 py-2 text-sm"
                    onClick={handleSavePayout}
                    disabled={savingPayout}
                  >
                    {savingPayout ? "Saving..." : "Save Bank Details"}
                  </button>
                </div>
              </div>

              {/* Card Payout Info (If configured) */}
              {currentUser?.profile?.cardPayout?.cardNumber && (
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-purple-900">Direct Card Payout Configured</h4>
                      <p className="text-[11px] text-purple-700 font-mono">
                        Card ending in ****{currentUser.profile.cardPayout.cardNumber.slice(-4)} ({currentUser.profile.cardPayout.cardHolder || "Direct Card"})
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-purple-200 text-purple-900 px-2.5 py-1 rounded-full">
                    Active
                  </span>
                </div>
              )}

              {/* Recent Withdrawal & Payout History */}
              <div className="pt-2">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  Recent Payout History
                </h3>

                {(() => {
                  const historyList = earningsData?.withdrawals || currentUser?.educatorEarnings?.withdrawals || [];
                  if (historyList.length === 0) {
                    return (
                      <div className="rounded-xl border border-dashed border-black/10 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                        No recent payouts recorded. Payouts disburse during the 3rd week of every month (15th to 21st).
                      </div>
                    );
                  }
                  return (
                    <div className="overflow-x-auto rounded-2xl border border-black/5">
                      <table className="min-w-full text-left text-xs">
                        <thead className="border-b border-black/5 bg-slate-50">
                          <tr>
                            <th className="px-4 py-2.5 font-semibold text-slate-600">Date</th>
                            <th className="px-4 py-2.5 font-semibold text-slate-600">Payout Ref</th>
                            <th className="px-4 py-2.5 font-semibold text-slate-600">Destination</th>
                            <th className="px-4 py-2.5 font-semibold text-slate-600">Amount (USD &amp; LKR)</th>
                            <th className="px-4 py-2.5 font-semibold text-slate-600">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 bg-white">
                          {historyList.slice(0, 5).map((w) => {
                            const wDual = formatDual(w.amountUSD);
                            return (
                              <tr key={w.payoutId || w.reference || w._id} className="hover:bg-slate-50">
                                <td className="px-4 py-2.5 text-slate-600">
                                  {new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </td>
                                <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                                  {w.payoutId || w.reference}
                                </td>
                                <td className="px-4 py-2.5 text-slate-700">
                                  {w.destination || (w.method === "card" ? "Card Transfer" : "Bank Transfer")}
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className="font-bold text-emerald-700">{wDual.usdStr}</span>
                                  <span className="text-[10px] text-slate-500 ml-1">({wDual.lkrStr})</span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>{w.status || "Completed"}</span>
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </section>

            {/* Notifications */}
            <section ref={notificationsRef} className="glass-card p-6 space-y-3">
              <div>
                <h2 className="font-semibold text-text-dark">Notifications</h2>
                <p className="text-xs text-muted mt-1">Choose which alerts you want to receive.</p>
              </div>

              {/* Holds notification toggles */}
              <div className="rounded-2xl border border-primary/25 bg-white/70 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-4 border-b border-black/10">
                  <div>
                    <p className="text-sm font-semibold text-text-dark">Mentorship Requests</p>
                    <p className="text-xs text-muted">Get notified when a new mentorship request arrives.</p>
                  </div>
                  <Toggle enabled={notifications.mentorshipRequests} onClick={() => toggleNotification("mentorshipRequests")} />
                </div>

                <div className="flex items-center justify-between px-4 py-4 border-b border-black/10">
                  <div>
                    <p className="text-sm font-semibold text-text-dark">Course Reviews & Ratings</p>
                    <p className="text-xs text-muted">Receive alerts when students leave new feedback.</p>
                  </div>
                  <Toggle enabled={notifications.reviewsRatings} onClick={() => toggleNotification("reviewsRatings")} />
                </div>

                <div className="flex items-center justify-between px-4 py-4 border-b border-black/10">
                  <div>
                    <p className="text-sm font-semibold text-text-dark">Payout Updates</p>
                    <p className="text-xs text-muted">Get notified about payout approvals and failures.</p>
                  </div>
                  <Toggle enabled={notifications.payoutUpdates} onClick={() => toggleNotification("payoutUpdates")} />
                </div>

                <div className="flex items-center justify-between px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-text-dark">Software Updates</p>
                    <p className="text-xs text-muted">New features and platform improvements.</p>
                  </div>
                  <Toggle enabled={notifications.softwareUpdates} onClick={() => toggleNotification("softwareUpdates")} />
                </div>
              </div>
            </section>
            
            {/* Specialization Change */}
            <section ref={contactRef} className="glass-card p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-text-dark">Specialization Change</h2>
                <p className="text-xs text-muted mt-1">
                  Request a change to your primary specialization.
                </p>
              </div>

              {pendingRequest ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-700">
                    You currently have a pending request for specialization change (Requested: {pendingRequest.requestedSpecialization}).
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Please wait for an admin to approve or reject your previous request before submitting another.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Name</label>
                      <input className={`${inputCls} bg-gray-50 opacity-80 cursor-not-allowed`} value={`${profileForm.firstName} ${profileForm.lastName}`.trim()} readOnly />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input className={`${inputCls} bg-gray-50 opacity-80 cursor-not-allowed`} value={profileForm.email} readOnly />
                    </div>
                    <div>
                      <label className={labelCls}>Contact Number</label>
                      <input
                        className={inputCls}
                        value={profileForm.contact}
                        onChange={(e) => setProfileForm((p) => ({ ...p, contact: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>New Specialization</label>
                      <select
                        className={inputCls}
                        value={specializationForm.requestedSpecialization}
                        onChange={(e) => setSpecializationForm((s) => ({ ...s, requestedSpecialization: e.target.value }))}
                      >
                        <option value="">Select Specialization</option>
                        {specializationsList.map((spec) => (
                          <option key={spec._id} value={spec.name}>
                            {spec.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Reason for Change</label>
                    <textarea
                      className={inputCls}
                      rows={3}
                      value={specializationForm.reason}
                      onChange={(e) => setSpecializationForm((s) => ({ ...s, reason: e.target.value }))}
                    />
                  </div>

                  <FeedbackBanner msg={specMsg} />

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      className="btn-primary px-6 py-2 text-sm"
                      onClick={handleSpecializationSubmit}
                      disabled={submittingSpec}
                    >
                      {submittingSpec ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Contact Admin */}
            <section ref={contactAdminRef} className="glass-card p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-text-dark">Contact Admin</h2>
                <p className="text-xs text-muted mt-1">
                  Send a message directly to the admin team.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Subject</label>
                  <input
                    className={inputCls}
                    placeholder="Enter subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm((c) => ({ ...c, subject: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Message</label>
                  <textarea
                    className={inputCls}
                    rows={4}
                    placeholder="Describe your concern or request..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm((c) => ({ ...c, message: e.target.value }))}
                  />
                </div>

                <FeedbackBanner msg={contactMsg} />

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="btn-primary px-6 py-2 text-sm"
                    onClick={handleContactSubmit}
                    disabled={submittingContact}
                  >
                    {submittingContact ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default EducatorProfile;

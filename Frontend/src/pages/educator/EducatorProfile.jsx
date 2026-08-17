import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import { passwordRegex } from "../../utils/validation.js";

// Builds the educator account settings page
const EducatorProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, updateUserProfile, logoutAllDevices } = useApp();

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
    billingAddress: "",
    cardNumber: "",
    cardHolder: "",
    cardExpiry: ""
  });

  const [earningsStats, setEarningsStats] = useState(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        const res = await fetch("http://localhost:5000/api/educator/earnings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setEarningsStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load earnings stats:", err);
      }
    };
    fetchEarnings();
  }, []);

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
    const cardPayout = p.cardPayout || {};
    setPayoutForm({
      bankName: payout.bankName || "",
      accountNumber: payout.accountNumber || "",
      accountHolder: payout.accountHolder || (currentUser.name || ""),
      branch: payout.branch || "",
      billingAddress: payout.billingAddress || "",
      cardNumber: cardPayout.cardNumber || "",
      cardHolder: cardPayout.cardHolder || (currentUser.name || ""),
      cardExpiry: cardPayout.cardExpiry || ""
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
    const { cardNumber, cardHolder, cardExpiry, ...bankData } = payoutForm;
    const result = await updateUserProfile({
      profile: {
        ...(currentUser?.profile || {}),
        payout: bankData,
        cardPayout: { cardNumber, cardHolder, cardExpiry }
      }
    });
    setSavingPayout(false);
    if (result.success) {
      setPayoutMsg({ type: "success", text: "Payout preferences saved successfully." });
    } else {
      setPayoutMsg({ type: "error", text: result.message || "Failed to save payout details." });
    }
  };

  // Resets payout details from the current user
  const handleResetPayout = () => {
    const payout = currentUser?.profile?.payout || {};
    const cardPayout = currentUser?.profile?.cardPayout || {};
    setPayoutForm({
      bankName: payout.bankName || "",
      accountNumber: payout.accountNumber || "",
      accountHolder: payout.accountHolder || (currentUser?.name || ""),
      branch: payout.branch || "",
      billingAddress: payout.billingAddress || "",
      cardNumber: cardPayout.cardNumber || "",
      cardHolder: cardPayout.cardHolder || (currentUser?.name || ""),
      cardExpiry: cardPayout.cardExpiry || ""
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
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold text-text-dark">Account Settings</h1>
              {earningsStats && (
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                  👥 {earningsStats.totalStudentsEnrolled} Students Enrolled • 💰 ${(earningsStats.totalEarnedUSD || 0).toFixed(2)} USD Earned ($1/student)
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">
              Update your educator profile, withdrawal preferences (Bank or Card), and credentials.
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

            {/* Payout Details */}
            <section id="payout-details" ref={payoutRef} className="glass-card p-6 space-y-6">
              <div>
                <h2 className="font-semibold text-text-dark text-base">Monthly Payout Preferences</h2>
                <p className="text-xs text-muted mt-1">
                  Configure your Bank Account or Card where your $1/student monthly earnings will be disbursed during the first week of every month (Days 1–7).
                </p>
              </div>

              {/* Option 1: Bank Transfer Details */}
              <div className="space-y-3 pt-2 border-t border-black/5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏛️ Bank Account Transfer</span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Bank Name</label>
                    <input
                      className={inputCls}
                      placeholder="e.g. Commercial Bank"
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
                      placeholder="Name as on account"
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
              </div>

              {/* Option 2: Card Payout Details */}
              <div className="space-y-3 pt-4 border-t border-black/5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>💳 Direct Card Payout (Visa / Mastercard)</span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Card Number</label>
                    <input
                      className={inputCls}
                      placeholder="4532 •••• •••• 1234"
                      value={payoutForm.cardNumber}
                      onChange={(e) => setPayoutForm((p) => ({ ...p, cardNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Cardholder Name</label>
                    <input
                      className={inputCls}
                      placeholder="Name on card"
                      value={payoutForm.cardHolder}
                      onChange={(e) => setPayoutForm((p) => ({ ...p, cardHolder: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Billing Address (Optional)</label>
                <textarea
                  className={inputCls}
                  rows={2}
                  value={payoutForm.billingAddress}
                  onChange={(e) => setPayoutForm((p) => ({ ...p, billingAddress: e.target.value }))}
                />
              </div>

              <FeedbackBanner msg={payoutMsg} />

              {/* Holds payout reset and save buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-soft px-6 py-2 text-sm" onClick={handleResetPayout}>
                  Reset
                </button>
                <button
                  type="button"
                  className="btn-primary px-6 py-2 text-sm"
                  onClick={handleSavePayout}
                  disabled={savingPayout}
                >
                  {savingPayout ? "Saving..." : "Save Payout Preferences"}
                </button>
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

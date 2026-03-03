import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";

/**
 * Changes made:
 * - Replaced native <select> with custom themed dropdown (every dropdown).
 * - Sidebar stops after notifications (self-start so it doesn't stretch).
 * - Default profile picture included + editable upload.
 */

const EducatorProfile = () => {
  const location = useLocation();

  // ----- Section refs for smooth scroll -----
  const profileRef = useRef(null);
  const securityRef = useRef(null);
  const payoutRef = useRef(null);
  const notificationsRef = useRef(null);
  const deactivateRef = useRef(null);

  // ----- Active sidebar highlight -----
  const [activeSection, setActiveSection] = useState("profile");
  const scrollToSection = (key, ref) => {
    setActiveSection(key);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ✅ Auto-scroll when arriving with /educator/profile#payout-details
  useEffect(() => {
    if (location.hash === "#payout-details") {
      // allow layout to paint first
      setTimeout(() => {
        scrollToSection("payout", payoutRef);
      }, 0);
    }
  }, [location.hash]);

  // ----- Better default profile image (inline SVG avatar) -----
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImage(URL.createObjectURL(file));
  };

  // ----- Mock user data (pre-filled) -----
  const [profileForm, setProfileForm] = useState({
    firstName: "Haseetha",
    lastName: "Perera",
    email: "haseetha@gmail.com",
    contact: "077 123 4567",
    expertiseArea: "Web Development",
    yearsExperience: "3",
    bio: "I help students learn practical skills with real-world examples...."
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "************",
    newPassword: "",
    confirmPassword: "",
    twoFA: "Disabled"
  });

  const [payoutForm, setPayoutForm] = useState({
    bankName: "Sampath Bank",
    accountNumber: "**** **** 4481",
    accountHolder: "Haseetha Perera",
    branch: "Moratuwa",
    billingAddress: "Address for records...."
  });

  // ----- Notifications (toggle flips true/false) -----
  const [notifications, setNotifications] = useState({
    mentorshipRequests: true,
    reviewsRatings: true,
    payoutUpdates: true,
    softwareUpdates: true
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ----- Components -----
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

  // Sidebar item (matches screenshot style)
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

  /**
   * Custom themed dropdown (replaces <select>)
   * - Smooth, matches mint theme
   * - Click outside to close
   */
  const CustomSelect = ({ value, options, onChange, placeholder = "Select..." }) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
      const onDoc = (e) => {
        if (!rootRef.current) return;
        if (!rootRef.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    return (
      <div ref={rootRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          className="w-full rounded-xl border border-primary/30 bg-white px-4 py-2 text-left text-sm shadow-sm hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/25"
        >
          <span className={value ? "text-text-dark" : "text-muted"}>
            {value || placeholder}
          </span>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            ▾
          </span>
        </button>

        {open && (
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-primary/25 bg-white/95 shadow-lg backdrop-blur">
            <div className="max-h-56 overflow-auto py-1">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition ${
                    opt === value
                      ? "bg-primary/15 text-text-dark font-semibold"
                      : "hover:bg-primary/10 text-text-dark"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Field styles (kept consistent)
  const labelCls = "block text-xs font-medium text-text-dark mb-1";
  const inputCls =
    "w-full rounded-xl border border-primary/30 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/25";

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card p-6 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-text-dark">
              Account Settings
            </h1>
            <p className="text-xs text-muted mt-1">
              Update your educator profile, payout details, password, and notification preferences.
            </p>
          </div>
          <button className="btn-primary px-6 py-2 text-sm">
            Apply for Mentorship
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT SIDEBAR (self-start prevents stretching) */}
          <div className="glass-card p-5 space-y-4 self-start">
            <SideItem
              title="Profile"
              subtitle="Name, bio, expertise"
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
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-3 space-y-6">
            {/* PROFILE */}
            <section ref={profileRef} className="glass-card p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-text-dark">Profile</h2>
                <p className="text-xs text-muted mt-1">
                  These details will be visible to students on your educator profile.
                </p>
              </div>

              {/* Profile photo centered */}
              <div className="flex flex-col items-center gap-3">
                <div className="h-28 w-28 overflow-hidden rounded-full border border-primary/30 shadow">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <label className="text-xs font-medium text-primary cursor-pointer hover:opacity-90">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>First Name</label>
                  <input
                    className={inputCls}
                    value={profileForm.firstName}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, firstName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Last Name</label>
                  <input
                    className={inputCls}
                    value={profileForm.lastName}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, lastName: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    className={`${inputCls} opacity-80`}
                    value={profileForm.email}
                    readOnly
                  />
                  <p className="mt-1 text-[11px] text-muted">
                    Use a verified email to receive payout updates.
                  </p>
                </div>
                <div>
                  <label className={labelCls}>Contact Number</label>
                  <input
                    className={inputCls}
                    value={profileForm.contact}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, contact: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className={labelCls}>Expertise Area</label>
                  <CustomSelect
                    value={profileForm.expertiseArea}
                    options={[
                      "Web Development",
                      "Cyber Security",
                      "Data Science",
                      "Cloud Computing"
                    ]}
                    onChange={(v) =>
                      setProfileForm((p) => ({ ...p, expertiseArea: v }))
                    }
                  />
                </div>

                <div>
                  <label className={labelCls}>Years of Experience</label>
                  <input
                    className={inputCls}
                    value={profileForm.yearsExperience}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        yearsExperience: e.target.value
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Bio</label>
                <textarea
                  className={inputCls}
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, bio: e.target.value }))
                  }
                />
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" className="btn-soft px-6 py-2 text-sm">
                  Reset
                </button>
                <button type="button" className="btn-primary px-6 py-2 text-sm">
                  Save Profile
                </button>
              </div>
            </section>

            {/* SECURITY */}
            <section ref={securityRef} className="glass-card p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-text-dark">Security</h2>
                <p className="text-xs text-muted mt-1">
                  Update your password to keep your account secure
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Current Password</label>
                  <input
                    className={inputCls}
                    type="password"
                    value={securityForm.currentPassword}
                    onChange={(e) =>
                      setSecurityForm((s) => ({
                        ...s,
                        currentPassword: e.target.value
                      }))
                    }
                  />
                </div>

                <div>
                  <label className={labelCls}>New Password</label>
                  <input
                    className={inputCls}
                    type="password"
                    value={securityForm.newPassword}
                    onChange={(e) =>
                      setSecurityForm((s) => ({ ...s, newPassword: e.target.value }))
                    }
                    placeholder="New Password"
                  />
                </div>

                <div>
                  <label className={labelCls}>Confirm New Password</label>
                  <input
                    className={inputCls}
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(e) =>
                      setSecurityForm((s) => ({
                        ...s,
                        confirmPassword: e.target.value
                      }))
                    }
                    placeholder="New Password"
                  />
                </div>

                <div>
                  <label className={labelCls}>Two-Factor Authentication</label>
                  <CustomSelect
                    value={securityForm.twoFA}
                    options={["Disabled", "Enabled"]}
                    onChange={(v) => setSecurityForm((s) => ({ ...s, twoFA: v }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" className="btn-soft px-6 py-2 text-sm">
                  Reset
                </button>
                <button type="button" className="btn-primary px-6 py-2 text-sm">
                  Update Password
                </button>
              </div>
            </section>

            {/* PAYOUT */}
            <section
              id="payout-details"
              ref={payoutRef}
              className="glass-card p-6 space-y-4"
            >
              <div>
                <h2 className="font-semibold text-text-dark">Payout Details</h2>
                <p className="text-xs text-muted mt-1">
                  Used for educator withdrawals and payouts (bank transfer).
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Bank Name</label>
                  <input
                    className={inputCls}
                    value={payoutForm.bankName}
                    onChange={(e) =>
                      setPayoutForm((p) => ({ ...p, bankName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Account Number</label>
                  <input
                    className={inputCls}
                    value={payoutForm.accountNumber}
                    onChange={(e) =>
                      setPayoutForm((p) => ({
                        ...p,
                        accountNumber: e.target.value
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Account Holder Name</label>
                  <input
                    className={inputCls}
                    value={payoutForm.accountHolder}
                    onChange={(e) =>
                      setPayoutForm((p) => ({
                        ...p,
                        accountHolder: e.target.value
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Branch</label>
                  <input
                    className={inputCls}
                    value={payoutForm.branch}
                    onChange={(e) =>
                      setPayoutForm((p) => ({ ...p, branch: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Billing Address (Optional)</label>
                <textarea
                  className={inputCls}
                  rows={3}
                  value={payoutForm.billingAddress}
                  onChange={(e) =>
                    setPayoutForm((p) => ({
                      ...p,
                      billingAddress: e.target.value
                    }))
                  }
                />
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" className="btn-soft px-6 py-2 text-sm">
                  Reset
                </button>
                <button type="button" className="btn-primary px-6 py-2 text-sm">
                  Update Changes
                </button>
              </div>
            </section>

            {/* NOTIFICATIONS */}
            <section ref={notificationsRef} className="glass-card p-6 space-y-3">
              <div>
                <h2 className="font-semibold text-text-dark">Notifications</h2>
                <p className="text-xs text-muted mt-1">
                  Choose which alerts you want to receive.
                </p>
              </div>

              <div className="rounded-2xl border border-primary/25 bg-white/70 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-4 border-b border-black/10">
                  <div>
                    <p className="text-sm font-semibold text-text-dark">
                      Mentorship Requests
                    </p>
                    <p className="text-xs text-muted">
                      Get notified when a new mentorship request arrives.
                    </p>
                  </div>
                  <Toggle
                    enabled={notifications.mentorshipRequests}
                    onClick={() => toggleNotification("mentorshipRequests")}
                  />
                </div>

                <div className="flex items-center justify-between px-4 py-4 border-b border-black/10">
                  <div>
                    <p className="text-sm font-semibold text-text-dark">
                      Course Reviews & Ratings
                    </p>
                    <p className="text-xs text-muted">
                      Receive alerts when students leave new feedback.
                    </p>
                  </div>
                  <Toggle
                    enabled={notifications.reviewsRatings}
                    onClick={() => toggleNotification("reviewsRatings")}
                  />
                </div>

                <div className="flex items-center justify-between px-4 py-4 border-b border-black/10">
                  <div>
                    <p className="text-sm font-semibold text-text-dark">
                      Payout Updates
                    </p>
                    <p className="text-xs text-muted">
                      Get notified about payout approvals and failures.
                    </p>
                  </div>
                  <Toggle
                    enabled={notifications.payoutUpdates}
                    onClick={() => toggleNotification("payoutUpdates")}
                  />
                </div>

                <div className="flex items-center justify-between px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-text-dark">
                      Software Updates
                    </p>
                    <p className="text-xs text-muted">
                      New features and platform improvements.
                    </p>
                  </div>
                  <Toggle
                    enabled={notifications.softwareUpdates}
                    onClick={() => toggleNotification("softwareUpdates")}
                  />
                </div>
              </div>
            </section>

            {/* ACCOUNT DEACTIVATION */}
            <section ref={deactivateRef} className="glass-card p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-text-dark">Account Deactivation</h2>
                <p className="text-xs text-muted mt-1">
                  Caution. These actions may affect your account access and courses
                </p>
              </div>

              <div className="rounded-2xl border border-primary/25 bg-white/70 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-4 border-b border-black/10">
                  <div>
                    <p className="text-sm font-semibold text-text-dark">
                      Deactivate Account
                    </p>
                    <p className="text-xs text-muted">
                      Disable educator access temporarily. You can re-activate later (admin approval may be needed).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert("Placeholder: Deactivate account flow will be implemented later.");
                    }}
                    className="rounded-full border border-red-400 px-5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Deactivate
                  </button>
                </div>

                <div className="flex items-center justify-between px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-text-dark">
                      Log out from all devices
                    </p>
                    <p className="text-xs text-muted">For security, sign out everywhere.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("Placeholder: Logout from all devices will be implemented later.")}
                    className="btn-soft px-6 py-2 text-xs"
                  >
                    Log Out
                  </button>
                </div>
              </div>

              <div className="pt-2 text-center text-xs text-muted">
                © 2026 EduPath. All rights reserved.
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default EducatorProfile;

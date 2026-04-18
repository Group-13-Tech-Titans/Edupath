import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * MentorSettings_InlineLikeDashboard.jsx
 * - Tailwind-only (utility classes), matching MentorDashboard.jsx style.
 * - Settings UI matches mentor-settings.html: tabs, sticky save bar, toggles, modals, toast.
 */

export default function MentorSettingsInlineLikeDashboard() {
  const navigate = useNavigate();

  // Same logout behavior as dashboard
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const [activeTab, setActiveTab] = useState("account");
  const [isDirty, setIsDirty] = useState(false);

  const [toggles, setToggles] = useState({
    sessionRequests: true,
    messages: true,
    resourceUpdates: false,
    weeklySummary: true,
    twoFA: false,
  });

  const [modal, setModal] = useState(null); // "reset" | "devices" | "deactivate" | "delete" | null
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const [toastState, setToastState] = useState({ open: false, title: "", msg: "" });
  const toastTimer = useRef(null);

  const showToast = (title, msg) => {
    setToastState({ open: true, title, msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastState((t) => ({ ...t, open: false })), 3500);
  };

  const closeToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastState((t) => ({ ...t, open: false }));
  };

  const markDirty = () => setIsDirty(true);

  const toggle = (key) => {
    setToggles((p) => ({ ...p, [key]: !p[key] }));
    markDirty();
  };

  const discardChanges = () => {
    setIsDirty(false);
    showToast("Cancelled", "Changes were discarded (demo).");
  };

  const saveChanges = () => {
    setIsDirty(false);
    showToast("Saved!", "Your settings were saved (demo).");
  };

  const doDelete = () => {
    if ((deleteConfirm || "").trim() !== "DELETE") {
      showToast("Not yet", "Please type DELETE to confirm.");
      return;
    }
    setModal(null);
    setDeleteConfirm("");
    showToast("Deleted", "Account deleted (demo).");
  };

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const status = useMemo(
    () =>
      isDirty
        ? { label: "Unsaved changes", dot: "bg-teal-400", text: "text-teal-700 font-extrabold" }
        : { label: "No unsaved changes", dot: "bg-slate-300", text: "text-slate-500 font-semibold" },
    [isDirty]
  );

  const Pill = ({ children }) => (
    <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-500">
      {children}
    </span>
  );

  const Card = ({ children, className = "" }) => (
    <section className={`rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] ${className}`}>
      {children}
    </section>
  );

  const SectionTitle = ({ icon, title }) => (
    <div className="mb-4 flex items-center gap-2 border-b-2 border-slate-100 pb-4 text-[18px] font-extrabold text-slate-800">
      <span className="text-teal-400">{icon}</span>
      <span>{title}</span>
    </div>
  );

  const Field = ({ label, hint, children }) => (
    <div className="space-y-2">
      <label className="block text-[13px] font-extrabold text-slate-800">{label}</label>
      {children}
      {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
    </div>
  );

  const Input = (props) => (
    <input
      {...props}
      onChange={(e) => {
        props.onChange?.(e);
        markDirty();
      }}
      className={`w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100 ${
        props.className || ""
      }`}
    />
  );

  const Select = (props) => (
    <select
      {...props}
      onChange={(e) => {
        props.onChange?.(e);
        markDirty();
      }}
      className={`w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100 ${
        props.className || ""
      }`}
    />
  );

  const Textarea = (props) => (
    <textarea
      {...props}
      onChange={(e) => {
        props.onChange?.(e);
        markDirty();
      }}
      className={`min-h-[110px] w-full resize-y rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100 ${
        props.className || ""
      }`}
    />
  );

  const SwitchRow = ({ title, desc, checked, onToggle }) => (
    <div className="mb-3 flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
      <div className="space-y-1">
        <div className="text-sm font-extrabold text-slate-800">{title}</div>
        <div className="text-xs leading-5 text-slate-500">{desc}</div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-checked={checked ? "true" : "false"}
        role="switch"
        className={`relative h-[30px] w-[52px] rounded-full transition ${checked ? "bg-teal-400" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-1 h-[22px] w-[22px] rounded-full bg-white shadow-md transition ${
            checked ? "left-[26px]" : "left-1"
          }`}
        />
      </button>
    </div>
  );

  const DangerBox = ({ emoji, children }) => (
    <div className="my-4 flex gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-[13px] leading-6 text-teal-700">
      <div className="text-lg leading-none">{emoji}</div>
      <div>{children}</div>
    </div>
  );

  const ModalShell = ({ open, title, children, onClose }) => (
    <div
      className={`fixed inset-0 z-[1000] ${open ? "flex" : "hidden"} items-center justify-center bg-black/50 p-5`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-hidden={open ? "false" : "true"}
    >
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="mb-4 flex items-center justify-between gap-3 border-b-2 border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-slate-50 text-lg text-slate-500 transition hover:bg-slate-200"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-200 to-teal-300 p-5">
      {/* Header (same as MentorDashboard) */}
      <header className="mb-5 flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <EduPathLogo />
          <span>EduPath</span>
        </div>

        <nav className="relative z-50 hidden flex-1 items-center justify-center gap-8 md:flex">
          <Link to="/MentorDashboard" className="font-medium text-slate-800 transition-colors hover:text-teal-500">
            Dashboard
          </Link>
          <Link to="/MentorStudents" className="font-medium text-slate-800 transition-colors hover:text-teal-500">
            My Students
          </Link>
          <Link to="/MentorSessions" className="font-medium text-slate-800 transition-colors hover:text-teal-500">
            Sessions
          </Link>
          <Link
            to="/MentorProfile"
            className="font-medium text-slate-800 transition-colors hover:text-teal-500"
            style={{ textDecoration: "none" }}
          >
            Profile
          </Link>
          <Link to="/MentorSettings" className="font-medium text-slate-800 transition-colors hover:text-teal-500">
          Resources
          </Link>
          
        </nav>

        <div className="w-[150px] flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </header>

      {/* Page header like mentor-settings.html */}
      <div className="mb-5 flex flex-col gap-4 rounded-2xl bg-white px-7 py-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your account, preferences, notifications, and security.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setModal("reset")}
            className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
          >
            Reset Password
          </button>

          <button
            type="button"
            onClick={() => {
              markDirty();
              showToast("Saved!", "Your settings were saved (demo).");
              setIsDirty(false);
            }}
            className="rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500 hover:shadow-[0_4px_12px_rgba(93,217,193,0.35)]"
          >
            Save Now
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Sidebar */}
        <div className="space-y-5">
          <Card>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="grid h-14 w-14 place-items-center rounded-full border-4 border-teal-400 bg-teal-50">
                <UserIcon />
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-800">Dr. Sarah Johnson</div>
                <div className="text-xs text-slate-500">Verified Mentor • Full‑Stack</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => setActiveTab("account")}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition ${
                  activeTab === "account"
                    ? "bg-teal-50 text-teal-700 ring-2 ring-teal-200"
                    : "bg-slate-50 text-slate-800 hover:bg-teal-50 hover:text-teal-700"
                }`}
              >
                Account <Pill>Profile</Pill>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("availability")}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition ${
                  activeTab === "availability"
                    ? "bg-teal-50 text-teal-700 ring-2 ring-teal-200"
                    : "bg-slate-50 text-slate-800 hover:bg-teal-50 hover:text-teal-700"
                }`}
              >
                Availability <Pill>Preferences</Pill>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("notifications")}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition ${
                  activeTab === "notifications"
                    ? "bg-teal-50 text-teal-700 ring-2 ring-teal-200"
                    : "bg-slate-50 text-slate-800 hover:bg-teal-50 hover:text-teal-700"
                }`}
              >
                Notifications <Pill>Alerts</Pill>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("privacy")}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition ${
                  activeTab === "privacy"
                    ? "bg-teal-50 text-teal-700 ring-2 ring-teal-200"
                    : "bg-slate-50 text-slate-800 hover:bg-teal-50 hover:text-teal-700"
                }`}
              >
                Privacy <Pill>Visibility</Pill>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition ${
                  activeTab === "security"
                    ? "bg-teal-50 text-teal-700 ring-2 ring-teal-200"
                    : "bg-slate-50 text-slate-800 hover:bg-teal-50 hover:text-teal-700"
                }`}
              >
                Security <Pill>2FA</Pill>
              </button>
            </div>
          </Card>

          <Card>
            <SectionTitle icon={<SettingsWarningIcon />} title="Danger Zone" />
            <p className="text-xs leading-5 text-slate-500">Be careful — these actions affect your account.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setModal("deactivate")}
                className="rounded-xl border-2 border-teal-500 bg-white px-5 py-2.5 text-sm font-semibold text-teal-600 transition hover:bg-teal-500 hover:text-white"
              >
                Deactivate
              </button>
              <button
                type="button"
                onClick={() => setModal("delete")}
                className="rounded-xl border-2 border-teal-500 bg-white px-5 py-2.5 text-sm font-semibold text-teal-600 transition hover:bg-teal-500 hover:text-white"
              >
                Delete Account
              </button>
            </div>
          </Card>
        </div>

        {/* Main */}
        <div className="space-y-5">
          {activeTab === "account" ? (
            <Card>
              <SectionTitle icon={<SettingsUserOutlineIcon />} title="Account Information" />

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="First Name">
                  <Input defaultValue="Sarah" />
                </Field>

                <Field label="Last Name">
                  <Input defaultValue="Johnson" />
                </Field>

                <Field label="Email Address" hint="Visible to students (as contact).">
                  <Input type="email" defaultValue="sarah.johnson@email.com" />
                </Field>

                <Field label="Phone (Optional)">
                  <Input type="tel" defaultValue="+1 (555) 123-4567" />
                </Field>

                <Field label="Location">
                  <Input defaultValue="San Francisco, CA" />
                </Field>

                <Field label="Time Zone">
                  <Select defaultValue="IST (UTC+5:30) - Sri Lanka/India">
                    <option>PST (UTC-8) - Pacific Standard Time</option>
                    <option>MST (UTC-7) - Mountain Standard Time</option>
                    <option>CST (UTC-6) - Central Standard Time</option>
                    <option>EST (UTC-5) - Eastern Standard Time</option>
                    <option>IST (UTC+5:30) - Sri Lanka/India</option>
                    <option>GMT (UTC+0) - Greenwich Mean Time</option>
                    <option>CET (UTC+1) - Central European Time</option>
                  </Select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Short Bio" hint="Shown on your public mentor profile.">
                    <Textarea defaultValue="Mentor focused on practical, project-based learning and career guidance for modern web development." />
                  </Field>
                </div>
              </div>
            </Card>
          ) : null}

          {activeTab === "availability" ? (
            <Card>
              <SectionTitle icon={<SettingsCalendarIcon />} title="Availability Preferences" />

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Available Days" hint="Hold Ctrl/Cmd to select multiple days.">
                  <select
                    multiple
                    size={7}
                    defaultValue={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]}
                    onChange={markDirty}
                    className="min-h-[210px] w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                  >
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                    <option>Saturday</option>
                    <option>Sunday</option>
                  </select>
                </Field>

                <div className="space-y-4">
                  <Field label="Preferred Start Time">
                    <Input type="time" defaultValue="09:00" />
                  </Field>

                  <Field label="Preferred End Time">
                    <Input type="time" defaultValue="18:00" />
                  </Field>

                  <Field label="Response Time">
                    <Select defaultValue="Within 2 hours">
                      <option>Within 1 hour</option>
                      <option>Within 2 hours</option>
                      <option>Within 4 hours</option>
                      <option>Within 24 hours</option>
                    </Select>
                  </Field>
                </div>
              </div>

              <DangerBox emoji="🕒">
                Availability is used to show students your likely response and active hours. Mentors do{" "}
                <b>not</b> schedule sessions — students request sessions and you accept/decline.
              </DangerBox>
            </Card>
          ) : null}

          {activeTab === "notifications" ? (
            <Card>
              <SectionTitle icon={<SettingsBellIcon />} title="Notifications" />

              <SwitchRow
                title="Session Requests"
                desc="Notify when a student requests a session."
                checked={toggles.sessionRequests}
                onToggle={() => toggle("sessionRequests")}
              />
              <SwitchRow
                title="Messages"
                desc="Notify when you receive a new message from students."
                checked={toggles.messages}
                onToggle={() => toggle("messages")}
              />
              <SwitchRow
                title="Resource Updates"
                desc="Notify when students view or react to a resource."
                checked={toggles.resourceUpdates}
                onToggle={() => toggle("resourceUpdates")}
              />
              <SwitchRow
                title="Weekly Summary"
                desc="Send a weekly digest of your mentoring activity."
                checked={toggles.weeklySummary}
                onToggle={() => toggle("weeklySummary")}
              />
            </Card>
          ) : null}

          {activeTab === "privacy" ? (
            <Card>
              <SectionTitle icon={<SettingsEyeIcon />} title="Profile Visibility" />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label="Public Profile" hint="If hidden, students cannot find your profile in search.">
                    <Select defaultValue="Visible to students">
                      <option>Visible to students</option>
                      <option>Hidden (not searchable)</option>
                    </Select>
                  </Field>
                </div>

                <Field label="Show Email">
                  <Select defaultValue="Yes">
                    <option>Yes</option>
                    <option>No</option>
                  </Select>
                </Field>

                <Field label="Show Phone">
                  <Select defaultValue="Yes">
                    <option>No</option>
                    <option>Yes</option>
                  </Select>
                </Field>
              </div>

              <DangerBox emoji="🔒">Keep personal contact details limited. Use in-app messaging when possible.</DangerBox>
            </Card>
          ) : null}

          {activeTab === "security" ? (
            <Card>
              <SectionTitle icon={<SettingsLockIcon />} title="Security" />

              <SwitchRow
                title="Two‑Factor Authentication (2FA)"
                desc="Extra protection for your mentor account."
                checked={toggles.twoFA}
                onToggle={() => toggle("twoFA")}
              />

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Login Alerts" hint="Get notified when a new device signs in.">
                  <Select defaultValue="Enabled">
                    <option>Enabled</option>
                    <option>Disabled</option>
                  </Select>
                </Field>

                <Field label="Session Timeout">
                  <Select defaultValue="30 minutes">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>60 minutes</option>
                    <option>Never (not recommended)</option>
                  </Select>
                </Field>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setModal("devices")}
                  className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
                >
                  View Devices
                </button>

                <button
                  type="button"
                  onClick={() => setModal("reset")}
                  className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
                >
                  Change Password
                </button>
              </div>
            </Card>
          ) : null}

          {/* Sticky Save Bar */}
          <div className="sticky bottom-5 z-40 rounded-2xl bg-white px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className={`flex items-center gap-2 text-sm ${status.text}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
                {status.label}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={discardChanges}
                  className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveChanges}
                  className="rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500 hover:shadow-[0_4px_12px_rgba(93,217,193,0.35)]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer (same style as MentorDashboard) */}
      <footer className="mt-5 rounded-2xl bg-white px-7 py-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <div className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
                <EduPathLogo />
                <span>EduPath</span>
              </div>

              <p className="mb-4 text-sm leading-6 text-slate-700">
                Empowering learners worldwide with quality education and personalized learning paths.
              </p>

              <div className="flex gap-3">
                <SocialIcon>
                  <FacebookIcon />
                </SocialIcon>
                <SocialIcon>
                  <TwitterIcon />
                </SocialIcon>
                <SocialIcon>
                  <LinkedInIcon />
                </SocialIcon>
                <SocialIcon>
                  <InstagramIcon />
                </SocialIcon>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="mb-3 text-sm font-extrabold text-slate-800">Platform</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>
                    <Link className="hover:text-teal-500" to="/MentorDashboard">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-teal-500" to="/MentorStudents">
                      My Students
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-teal-500" to="/MentorSessions">
                      Sessions
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-teal-500" to="/MentorSettings">
                      Settings
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="mb-3 text-sm font-extrabold text-slate-800">Support</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>
                    <a className="hover:text-teal-500" href="#help">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-teal-500" href="#terms">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-teal-500" href="#privacy">
                      Privacy
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <p className="mb-3 text-sm font-extrabold text-slate-800">Contact</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>support@edupath.lk</li>
                  <li>+94 11 234 5678</li>
                  <li>Sri Lanka</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} EduPath. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Toast */}
      {toastState.open ? (
        <div className="fixed bottom-5 left-1/2 z-[1100] w-[min(520px,92%)] -translate-x-1/2 rounded-2xl border border-black/5 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-1 text-sm font-extrabold text-slate-800">{toastState.title}</div>
              <div className="text-[13px] leading-5 text-slate-500">{toastState.msg}</div>
            </div>
            <button
              type="button"
              onClick={closeToast}
              className="grid h-9 w-9 place-items-center rounded-full bg-slate-50 text-lg text-slate-500 transition hover:bg-slate-200"
              aria-label="Close toast"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      {/* Modals */}
      <ModalShell open={modal === "reset"} title="Reset Password" onClose={() => setModal(null)}>
        <div className="space-y-4">
          <Field label="Current Password">
            <Input type="password" placeholder="••••••••" />
          </Field>
          <Field label="New Password">
            <Input type="password" placeholder="Create a strong password" />
          </Field>
          <Field label="Confirm New Password">
            <Input type="password" placeholder="Re-type new password" />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setModal(null);
                showToast("Updated", "Password change saved (demo).");
              }}
              className="rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500"
            >
              Update
            </button>
          </div>
        </div>
      </ModalShell>

      <ModalShell open={modal === "devices"} title="Signed-in Devices" onClose={() => setModal(null)}>
        <div className="space-y-3">
          <DangerBox emoji="📱">
            This list is a demo. In your real system, show device name, location, and last active time.
          </DangerBox>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-slate-100 bg-white px-4 py-4">
              <div className="space-y-1">
                <div className="text-sm font-extrabold text-slate-800">Windows PC • Chrome</div>
                <div className="text-xs text-slate-500">Last active: Today</div>
              </div>
              <Pill>Current</Pill>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-slate-100 bg-white px-4 py-4">
              <div className="space-y-1">
                <div className="text-sm font-extrabold text-slate-800">Android • Mobile App</div>
                <div className="text-xs text-slate-500">Last active: Yesterday</div>
              </div>
              <button
                type="button"
                onClick={() => showToast("Signed out", "Device signed out (demo).")}
                className="rounded-xl border-2 border-teal-400 bg-white px-4 py-2 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </ModalShell>

      <ModalShell open={modal === "deactivate"} title="Deactivate Account" onClose={() => setModal(null)}>
        <DangerBox emoji="⏸️">
          Deactivating hides your mentor profile and pauses notifications. You can reactivate by signing in again.
        </DangerBox>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setModal(null)}
            className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setModal(null);
              showToast("Deactivated", "Account deactivated (demo).");
            }}
            className="rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500"
          >
            Deactivate
          </button>
        </div>
      </ModalShell>

      <ModalShell open={modal === "delete"} title="Delete Account" onClose={() => setModal(null)}>
        <DangerBox emoji="⚠️">
          This action is permanent. Your mentor profile, sessions history, and resources will be removed.
        </DangerBox>

        <Field label={<span>Type <b>DELETE</b> to confirm</span>}>
          <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE" />
        </Field>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setModal(null)}
            className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={doDelete}
            className="rounded-xl border-2 border-teal-500 bg-white px-5 py-2.5 text-sm font-semibold text-teal-600 transition hover:bg-teal-500 hover:text-white"
          >
            Delete
          </button>
        </div>
      </ModalShell>
    </div>
  );
}

/* --- Dashboard helper components (copied from MentorDashboard.jsx) --- */
function EduPathLogo() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#5DD9C1" opacity="0.2" />
      <path d="M20 8L12 12L20 16L28 12L20 8Z" fill="#5DD9C1" />
      <path d="M12 20L20 24L28 20" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 26L20 30L28 26" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2" fill="#5DD9C1" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}


function CloseIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}


function DocIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function FacebookIcon() {
  return <span className="text-slate-700">f</span>;
}
function TwitterIcon() {
  return <span className="text-slate-700">t</span>;
}
function LinkedInIcon() {
  return <span className="text-slate-700">in</span>;
}
function InstagramIcon() {
  return <span className="text-slate-700">ig</span>;
}

function SocialIcon({ children }) {
  return (
    <button
      type="button"
      className="grid h-10 w-10 place-items-center rounded-full bg-emerald-200 transition hover:-translate-y-0.5 hover:bg-teal-400"
    >
      {children}
    </button>
  );
}

/* --- Extra icons used by Settings --- */
function UserIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" fill="#5DD9C1" />
      <path d="M4 20a8 8 0 0 1 16 0" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SettingsUserOutlineIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" stroke="#5DD9C1" strokeWidth="2" />
      <path
        d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        stroke="#5DD9C1"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsCalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 7V3m8 4V3m-9 8h10" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        stroke="#5DD9C1"
        strokeWidth="2"
      />
    </svg>
  );
}

function SettingsBellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"
        stroke="#5DD9C1"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M9 17v1a3 3 0 006 0v-1" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SettingsEyeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z"
        stroke="#5DD9C1"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" stroke="#5DD9C1" strokeWidth="2" />
    </svg>
  );
}

function SettingsLockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 11V8a5 5 0 0110 0v3" stroke="#5DD9C1" strokeWidth="2" />
      <path
        d="M17 21H7a2 2 0 01-2-2v-6a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2z"
        stroke="#5DD9C1"
        strokeWidth="2"
      />
    </svg>
  );
}

function SettingsWarningIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 9v2m0 4h.01M5.5 19h13a2.5 2.5 0 002.17-3.75L13.67 4.5a2 2 0 00-3.34 0L3.33 15.25A2.5 2.5 0 005.5 19z"
        stroke="#5DD9C1"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

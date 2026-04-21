import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MentorSettingsInlineLikeDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const [activeTab, setActiveTab] = useState("account");
  const isDirtyRef = useRef(false);           // tracks changes WITHOUT re-rendering
  const [isDirty, setIsDirty] = useState(false); // only for status label display

  // ── Profile photo shared with Profile + Dashboard via localStorage ──
  const [photo, setPhoto] = useState(() => localStorage.getItem("mentorPhoto") || null);
  const fileInputRef      = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPhoto(dataUrl);
      localStorage.setItem("mentorPhoto", dataUrl);
      markDirty();
    };
    reader.readAsDataURL(file);
  };

  // ── Social links, certifications, mentoring focus (saved to localStorage) ──
  const [socialLinks, setSocialLinks] = useState(() =>
    JSON.parse(localStorage.getItem("mentorSocialLinks") || '{"linkedin":"","github":"","twitter":"","website":""}')
  );
  const [certifications, setCertifications] = useState(() =>
    JSON.parse(localStorage.getItem("mentorCertifications") || '[{"name":"AWS Certified Developer","issuer":"Amazon Web Services","year":"2023"},{"name":"Google Cloud Associate","issuer":"Google Cloud Platform","year":"2022"}]')
  );
  const [mentoringFocus, setMentoringFocus] = useState(() =>
    JSON.parse(localStorage.getItem("mentorMentoringFocus") || '["Career Guidance","Portfolio Review","Interview Prep","Resume Feedback","Full-Stack Projects","Coding Best Practices"]')
  );
  const [newFocusItem, setNewFocusItem] = useState("");
  const [expertiseTags, setExpertiseTags] = useState(() =>
    JSON.parse(localStorage.getItem("mentorExpertiseTags") || '["JavaScript","React.js","Node.js","TypeScript","Python","MongoDB","Docker"]')
  );
  const [newExpertiseItem, setNewExpertiseItem] = useState("");

  // ── Refs for account field validation ──────────────────────────
  const firstNameRef = useRef(null);
  const lastNameRef  = useRef(null);
  const emailRef     = useRef(null);
  const locationRef  = useRef(null);
  const titleRef     = useRef(null);
  const subjectRef   = useRef(null);
  const bioRef       = useRef(null);
  const expertiseRef = useRef(null);

  // ── Dynamic experience + education entries ─────────────────────
  const [experiences, setExperiences] = useState([
    { role: "Senior Full-Stack Developer", company: "Tech Innovations Inc.", duration: "Jan 2020 - Present · 4+ years", description: "Leading development of enterprise web applications." },
    { role: "Full-Stack Developer", company: "Digital Solutions Ltd.", duration: "Mar 2017 - Dec 2019", description: "Developed and maintained multiple client applications." },
  ]);
  const [educations, setEducations] = useState([
    { degree: "Ph.D. in Computer Science", institution: "Stanford University", year: "2010 - 2014" },
    { degree: "B.S. in Computer Science", institution: "University of California, Berkeley", year: "2004 - 2008" },
  ]);

  const [toggles, setToggles] = useState({
    sessionRequests: true, messages: true, resourceUpdates: false, weeklySummary: true, twoFA: false,
  });
  const [modal, setModal]               = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [toastState, setToastState]     = useState({ open: false, title: "", msg: "" });
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
  const dirtyTimer = useRef(null);
  const markDirty = () => {
    isDirtyRef.current = true;            // instant, no re-render
    if (!isDirty) {                       // only trigger re-render if status label needs to change
      clearTimeout(dirtyTimer.current);
      dirtyTimer.current = setTimeout(() => setIsDirty(true), 300);
    }
  };
  const toggle = (key) => { setToggles((p) => ({ ...p, [key]: !p[key] })); markDirty(); };
  const discardChanges = () => { isDirtyRef.current = false; setIsDirty(false); showToast("Cancelled", "Changes were discarded."); };

  // ── Validation on Save ──────────────────────────────────────────
  const saveChanges = () => {
    if (activeTab === "account") {
      const checks = [
        { ref: firstNameRef, label: "First Name" },
        { ref: lastNameRef,  label: "Last Name" },
        { ref: emailRef,     label: "Email Address" },
        { ref: locationRef,  label: "Location" },
        { ref: titleRef,     label: "Professional Title" },
        { ref: subjectRef,   label: "Subject / Field" },
        { ref: bioRef,       label: "Short Bio" },
        { ref: expertiseRef, label: "Skills / Expertise", customCheck: () => expertiseTags.length === 0 },
      ];
      for (const { ref, label, customCheck } of checks) {
        const isEmpty = customCheck ? customCheck() : (ref.current && !ref.current.value.trim());
        if (isEmpty) {
          if (ref.current) {
            ref.current.focus({ preventScroll: true });
            ref.current.style.borderColor = "#f87171";
          }
          showToast("Field required", `"${label}" cannot be empty. Please fill it in.`);
          return;
        }
        if (ref.current) ref.current.style.borderColor = "";
      }
    }
    // Save social links, certifications, mentoring focus to localStorage
    localStorage.setItem("mentorSocialLinks", JSON.stringify(socialLinks));
    localStorage.setItem("mentorCertifications", JSON.stringify(certifications));
    localStorage.setItem("mentorMentoringFocus", JSON.stringify(mentoringFocus));
    localStorage.setItem("mentorExpertiseTags", JSON.stringify(expertiseTags));

    isDirtyRef.current = false;
    setIsDirty(false);
    showToast("Saved!", "Your settings have been saved successfully. Changes are now visible on your profile.");
  };

  const doDelete = () => {
    if ((deleteConfirm || "").trim() !== "DELETE") { showToast("Not yet", "Please type DELETE to confirm."); return; }
    setModal(null); setDeleteConfirm(""); showToast("Deleted", "Account deleted (demo).");
  };

  useEffect(() => {
    const fn = (e) => { if (!isDirtyRef.current) return; e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, []);

  const status = useMemo(() =>
    isDirty
      ? { label: "Unsaved changes", dot: "bg-teal-400", text: "text-teal-700 font-extrabold" }
      : { label: "No unsaved changes", dot: "bg-slate-300", text: "text-slate-500 font-semibold" },
    [isDirty]
  );

  // ── Reusable sub-components ─────────────────────────────────────
  const Pill = ({ children }) => <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-500">{children}</span>;
  const Card = ({ children, className = "" }) => <section className={`rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] ${className}`}>{children}</section>;
  const SectionTitle = ({ icon, title }) => (
    <div className="mb-4 flex items-center gap-2 border-b-2 border-slate-100 pb-4 text-[18px] font-extrabold text-slate-800">
      <span className="text-teal-400">{icon}</span><span>{title}</span>
    </div>
  );
  const Field = ({ label, hint, children }) => (
    <div className="space-y-2">
      <label className="block text-[13px] font-extrabold text-slate-800">{label}</label>
      {children}
      {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
    </div>
  );
  const inputCls = "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100";
  const Select = (props) => (
    <select {...props} onChange={(e) => { props.onChange?.(e); markDirty(); }} className={`${inputCls} ${props.className || ""}`} />
  );
  const SwitchRow = ({ title, desc, checked, onToggle }) => (
    <div className="mb-3 flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
      <div className="space-y-1">
        <div className="text-sm font-extrabold text-slate-800">{title}</div>
        <div className="text-xs leading-5 text-slate-500">{desc}</div>
      </div>
      <button type="button" onClick={onToggle} role="switch" aria-checked={checked ? "true" : "false"}
        className={`relative h-[30px] w-[52px] rounded-full transition ${checked ? "bg-teal-400" : "bg-slate-300"}`}>
        <span className={`absolute top-1 h-[22px] w-[22px] rounded-full bg-white shadow-md transition ${checked ? "left-[26px]" : "left-1"}`} />
      </button>
    </div>
  );
  const DangerBox = ({ children }) => (
    <div className="my-4 flex gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-[13px] leading-6 text-teal-700">
      <div>{children}</div>
    </div>
  );
  const ModalShell = ({ open, title, children, onClose }) => (
    <div className={`fixed inset-0 z-[1000] ${open ? "flex" : "hidden"} items-center justify-center bg-black/50 p-5`}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="mb-4 flex items-center justify-between gap-3 border-b-2 border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-slate-50 text-lg text-slate-500 hover:bg-slate-200">×</button>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <>

      {/* Page header */}
      <div className="mb-5 flex flex-col gap-4 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your account, preferences, notifications, and security.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setModal("reset")}
            className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white">
            Reset Password
          </button>
          <button type="button" onClick={saveChanges}
            className="rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500">
            Save Now
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">

        {/* Sidebar */}
        <div className="space-y-5">
          <Card>
            {/* Photo in sidebar */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="relative cursor-pointer group flex-shrink-0" onClick={() => fileInputRef.current.click()}>
                {photo
                  ? <img src={photo} alt="Profile" className="h-14 w-14 rounded-full border-4 border-teal-400 object-cover" />
                  : <div className="grid h-14 w-14 place-items-center rounded-full border-4 border-teal-400 bg-teal-50"><UserIcon /></div>
                }
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-800">Dr. Sarah Johnson</div>
                <div className="text-xs text-slate-500">Verified Mentor • Full‑Stack</div>
                <button type="button" onClick={() => fileInputRef.current.click()} className="mt-1 text-xs font-semibold text-teal-500 hover:text-teal-600 underline">
                  Change photo
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {[
                { key: "account",       label: "Account",       pill: "Profile" },
                { key: "availability",  label: "Availability",  pill: "Preferences" },
                { key: "notifications", label: "Notifications", pill: "Alerts" },
                { key: "privacy",       label: "Privacy",       pill: "Visibility" },
                { key: "security",      label: "Security",      pill: "2FA" },
              ].map((tab) => (
                <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition ${
                    activeTab === tab.key ? "bg-teal-50 text-teal-700 ring-2 ring-teal-200" : "bg-slate-50 text-slate-800 hover:bg-teal-50 hover:text-teal-700"
                  }`}>
                  {tab.label} <Pill>{tab.pill}</Pill>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle icon={<SettingsWarningIcon />} title="Danger Zone" />
            <p className="text-xs leading-5 text-slate-500">Be careful — these actions affect your account.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={() => setModal("deactivate")}
                className="rounded-xl border-2 border-teal-500 bg-white px-5 py-2.5 text-sm font-semibold text-teal-600 transition hover:bg-teal-500 hover:text-white">Deactivate</button>
              <button type="button" onClick={() => setModal("delete")}
                className="rounded-xl border-2 border-teal-500 bg-white px-5 py-2.5 text-sm font-semibold text-teal-600 transition hover:bg-teal-500 hover:text-white">Delete Account</button>
            </div>
          </Card>
        </div>

        {/* Main content */}
        <div className="space-y-5">

          {/* ACCOUNT TAB */}
          {activeTab === "account" && (
            <>
              {/* Profile Photo Card */}
              <Card>
                <SectionTitle icon={<SettingsUserOutlineIcon />} title="Profile Photo" />
                <div className="flex items-center gap-6">
                  <div className="relative cursor-pointer group flex-shrink-0" onClick={() => fileInputRef.current.click()}>
                    {photo
                      ? <img src={photo} alt="Profile" className="h-24 w-24 rounded-full border-4 border-teal-400 object-cover" />
                      : <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-teal-400 bg-teal-50">
                          <svg className="h-10 w-10 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                        </div>
                    }
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="h-7 w-7 text-white mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
                      </svg>
                      <span className="text-xs text-white font-semibold">Change</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-800 mb-1">Profile Photo</p>
                    <p className="text-xs text-slate-500 mb-3">This photo appears on your profile page and dashboard. Click the photo or the button to change it.</p>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => fileInputRef.current.click()}
                        className="rounded-xl bg-teal-400 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-500">
                        Upload Photo
                      </button>
                      {photo && (
                        <button type="button" onClick={() => { setPhoto(null); localStorage.removeItem("mentorPhoto"); markDirty(); }}
                          className="rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100">
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Account Information */}
              <Card>
                <SectionTitle icon={<SettingsUserOutlineIcon />} title="Account Information" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="First Name *">
                    <input ref={firstNameRef} defaultValue="Sarah" onBlur={markDirty} className={inputCls} />
                  </Field>
                  <Field label="Last Name *">
                    <input ref={lastNameRef} defaultValue="Johnson" onBlur={markDirty} className={inputCls} />
                  </Field>
                  <Field label="Email Address *" hint="Visible to students as contact.">
                    <input ref={emailRef} type="email" defaultValue="sarah.johnson@email.com" onBlur={markDirty} className={inputCls} />
                  </Field>
                  <Field label="Phone (Optional)">
                    <input type="tel" defaultValue="+1 (555) 123-4567" onBlur={markDirty} className={inputCls} />
                  </Field>
                  <Field label="Location *">
                    <input ref={locationRef} defaultValue="San Francisco, CA" onBlur={markDirty} className={inputCls} />
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
                  <Field label="Professional Title *" hint="e.g. Senior Full-Stack Developer & Mentor">
                    <input ref={titleRef} defaultValue="Senior Full-Stack Developer & Technical Mentor" onBlur={markDirty} className={inputCls} />
                  </Field>
                  <Field label="Subject / Field *" hint="e.g. Web Development, Data Science">
                    <input ref={subjectRef} defaultValue="Web Development" onBlur={markDirty} className={inputCls} />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Short Bio *" hint="Shown on your public mentor profile.">
                      <textarea ref={bioRef} defaultValue="Mentor focused on practical, project-based learning and career guidance for modern web development." onBlur={markDirty}
                        className="min-h-[100px] w-full resize-y rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100" />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Skills / Expertise *" hint="Add your skills as tags — they appear on your profile page.">
                      <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] rounded-xl border-2 border-slate-200 bg-white p-3">
                        {expertiseTags.map((tag, i) => (
                          <span key={i} className="flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-sm font-semibold text-teal-600">
                            {tag}
                            <button type="button" onClick={() => { setExpertiseTags((p) => p.filter((_, j) => j !== i)); markDirty(); }}
                              className="text-teal-400 hover:text-red-400 font-bold leading-none">×</button>
                          </span>
                        ))}
                        {expertiseTags.length === 0 && <span className="text-sm text-slate-400">No skills added yet.</span>}
                      </div>
                      <div className="flex gap-3">
                        <input
                          ref={expertiseRef}
                          value={newExpertiseItem}
                          onChange={(e) => setNewExpertiseItem(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newExpertiseItem.trim()) {
                              e.preventDefault();
                              setExpertiseTags((p) => [...p, newExpertiseItem.trim()]);
                              setNewExpertiseItem("");
                              markDirty();
                            }
                          }}
                          placeholder="Type a skill and press Enter..."
                          className={`${inputCls} flex-1`}
                        />
                        <button type="button"
                          onClick={() => { if (newExpertiseItem.trim()) { setExpertiseTags((p) => [...p, newExpertiseItem.trim()]); setNewExpertiseItem(""); markDirty(); } }}
                          className="rounded-xl bg-teal-400 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-500">
                          Add
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">Examples: JavaScript, React, Node.js, Python, Docker, AWS</p>
                    </Field>
                  </div>
                </div>
                <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                  <button type="button" onClick={() => { saveChanges(); showToast("Profile Updated", "Account information has been saved."); }}
                    className="rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500">
                    Save Account Info
                  </button>
                </div>
              </Card>

              {/* Work Experience */}
              <Card>
                <SectionTitle icon={<SettingsCalendarIcon />} title="Work Experience" />
                <div className="space-y-4">
                  {experiences.map((exp, i) => (
                    <div key={i} className="rounded-xl border-2 border-slate-100 bg-slate-50 p-4 space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Field label="Job Title">
                          <input defaultValue={exp.role} onBlur={markDirty} className={inputCls} />
                        </Field>
                        <Field label="Company">
                          <input defaultValue={exp.company} onBlur={markDirty} className={inputCls} />
                        </Field>
                        <Field label="Duration" hint="e.g. Jan 2020 - Present">
                          <input defaultValue={exp.duration} onBlur={markDirty} className={inputCls} />
                        </Field>
                      </div>
                      <Field label="Description">
                        <textarea defaultValue={exp.description} onBlur={markDirty} rows={2}
                          className="w-full resize-y rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400" />
                      </Field>
                      <button type="button" onClick={() => { setExperiences((p) => p.filter((_, j) => j !== i)); markDirty(); }}
                        className="text-xs font-semibold text-red-400 hover:text-red-500">Remove this entry</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => { setExperiences((p) => [...p, { role: "", company: "", duration: "", description: "" }]); markDirty(); }}
                    className="w-full rounded-xl border-2 border-dashed border-teal-300 py-3 text-sm font-semibold text-teal-500 transition hover:bg-teal-50">
                    + Add Experience
                  </button>
                </div>
                <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                  <button type="button" onClick={() => { markDirty(); showToast("Experience Saved", "Work experience has been updated."); }}
                    className="rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500">
                    Save Work Experience
                  </button>
                </div>
              </Card>

              {/* Education */}
              <Card>
                <SectionTitle icon={<SettingsUserOutlineIcon />} title="Education" />
                <div className="space-y-4">
                  {educations.map((edu, i) => (
                    <div key={i} className="rounded-xl border-2 border-slate-100 bg-slate-50 p-4 space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Field label="Degree / Qualification">
                          <input defaultValue={edu.degree} onBlur={markDirty} className={inputCls} />
                        </Field>
                        <Field label="Institution">
                          <input defaultValue={edu.institution} onBlur={markDirty} className={inputCls} />
                        </Field>
                        <Field label="Year" hint="e.g. 2010 - 2014">
                          <input defaultValue={edu.year} onBlur={markDirty} className={inputCls} />
                        </Field>
                      </div>
                      <button type="button" onClick={() => { setEducations((p) => p.filter((_, j) => j !== i)); markDirty(); }}
                        className="text-xs font-semibold text-red-400 hover:text-red-500">Remove this entry</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => { setEducations((p) => [...p, { degree: "", institution: "", year: "" }]); markDirty(); }}
                    className="w-full rounded-xl border-2 border-dashed border-teal-300 py-3 text-sm font-semibold text-teal-500 transition hover:bg-teal-50">
                    + Add Education
                  </button>
                </div>
                <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                  <button type="button" onClick={() => { markDirty(); showToast("Education Saved", "Education details have been updated."); }}
                    className="rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500">
                    Save Education
                  </button>
                </div>
              </Card>
              {/* Social Links */}
              <Card>
                <SectionTitle icon={<SettingsEyeIcon />} title="Social Links" />
                <p className="mb-4 text-xs text-slate-500">These links appear on your public profile page.</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="LinkedIn URL">
                    <input defaultValue={socialLinks.linkedin} onBlur={(e) => { setSocialLinks((p) => ({ ...p, linkedin: e.target.value })); markDirty(); }}
                      placeholder="https://linkedin.com/in/yourname" className={inputCls} />
                  </Field>
                  <Field label="GitHub URL">
                    <input defaultValue={socialLinks.github} onBlur={(e) => { setSocialLinks((p) => ({ ...p, github: e.target.value })); markDirty(); }}
                      placeholder="https://github.com/yourname" className={inputCls} />
                  </Field>
                  <Field label="Twitter / X URL">
                    <input defaultValue={socialLinks.twitter} onBlur={(e) => { setSocialLinks((p) => ({ ...p, twitter: e.target.value })); markDirty(); }}
                      placeholder="https://twitter.com/yourname" className={inputCls} />
                  </Field>
                  <Field label="Personal Website">
                    <input defaultValue={socialLinks.website} onBlur={(e) => { setSocialLinks((p) => ({ ...p, website: e.target.value })); markDirty(); }}
                      placeholder="https://yourwebsite.com" className={inputCls} />
                  </Field>
                </div>
                <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                  <button type="button" onClick={() => { markDirty(); showToast("Links Saved", "Social links have been updated."); }}
                    className="rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500">
                    Save Social Links
                  </button>
                </div>
              </Card>

              {/* Certifications */}
              <Card>
                <SectionTitle icon={<SettingsLockIcon />} title="Certifications" />
                <p className="mb-4 text-xs text-slate-500">These appear on your public profile page.</p>
                <div className="space-y-4">
                  {certifications.map((cert, i) => (
                    <div key={i} className="rounded-xl border-2 border-slate-100 bg-slate-50 p-4 space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Field label="Certification Name">
                          <input defaultValue={cert.name} onBlur={(e) => { const c = [...certifications]; c[i] = { ...c[i], name: e.target.value }; setCertifications(c); markDirty(); }}
                            className={inputCls} placeholder="e.g. AWS Certified Developer" />
                        </Field>
                        <Field label="Issuing Organisation">
                          <input defaultValue={cert.issuer} onBlur={(e) => { const c = [...certifications]; c[i] = { ...c[i], issuer: e.target.value }; setCertifications(c); markDirty(); }}
                            className={inputCls} placeholder="e.g. Amazon Web Services" />
                        </Field>
                        <Field label="Year Obtained">
                          <input defaultValue={cert.year} onBlur={(e) => { const c = [...certifications]; c[i] = { ...c[i], year: e.target.value }; setCertifications(c); markDirty(); }}
                            className={inputCls} placeholder="e.g. 2023" />
                        </Field>
                      </div>
                      <button type="button" onClick={() => { setCertifications((p) => p.filter((_, j) => j !== i)); markDirty(); }}
                        className="text-xs font-semibold text-red-400 hover:text-red-500">Remove this certification</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => { setCertifications((p) => [...p, { name: "", issuer: "", year: "" }]); markDirty(); }}
                    className="w-full rounded-xl border-2 border-dashed border-teal-300 py-3 text-sm font-semibold text-teal-500 transition hover:bg-teal-50">
                    + Add Certification
                  </button>
                </div>
                <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                  <button type="button" onClick={() => { markDirty(); showToast("Certifications Saved", "Certifications have been updated."); }}
                    className="rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500">
                    Save Certifications
                  </button>
                </div>
              </Card>

              {/* Mentoring Focus */}
              <Card>
                <SectionTitle icon={<SettingsBellIcon />} title="Mentoring Focus" />
                <p className="mb-4 text-xs text-slate-500">These tags appear on your public profile to show students what you specialise in.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {mentoringFocus.map((item, i) => (
                    <span key={i} className="flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-3 py-1.5 text-sm font-semibold text-teal-600">
                      {item}
                      <button type="button" onClick={() => { setMentoringFocus((p) => p.filter((_, j) => j !== i)); markDirty(); }}
                        className="text-teal-400 hover:text-red-400 font-bold leading-none">×</button>
                    </span>
                  ))}
                  {mentoringFocus.length === 0 && <p className="text-sm text-slate-400">No focus areas added yet.</p>}
                </div>
                <div className="flex gap-3">
                  <input value={newFocusItem} onChange={(e) => setNewFocusItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newFocusItem.trim()) {
                        e.preventDefault();
                        setMentoringFocus((p) => [...p, newFocusItem.trim()]);
                        setNewFocusItem("");
                        markDirty();
                      }
                    }}
                    placeholder="Type a focus area and press Enter..." className={`${inputCls} flex-1`} />
                  <button type="button"
                    onClick={() => { if (newFocusItem.trim()) { setMentoringFocus((p) => [...p, newFocusItem.trim()]); setNewFocusItem(""); markDirty(); } }}
                    className="rounded-xl bg-teal-400 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-500">Add</button>
                </div>
                <p className="mt-2 text-xs text-slate-400">Examples: Career Guidance, Interview Prep, Portfolio Review, Code Review</p>
                <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                  <button type="button" onClick={() => { markDirty(); showToast("Focus Saved", "Mentoring focus areas have been updated."); }}
                    className="rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500">
                    Save Mentoring Focus
                  </button>
                </div>
              </Card>
            </>
          )}

          {/* AVAILABILITY TAB */}
          {activeTab === "availability" && (
            <Card>
              <SectionTitle icon={<SettingsCalendarIcon />} title="Availability Preferences" />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Available Days" hint="Hold Ctrl/Cmd to select multiple.">
                  <select multiple size={7} defaultValue={["Monday","Tuesday","Wednesday","Thursday","Friday"]} onChange={markDirty}
                    className="min-h-[210px] w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100">
                    <option>Monday</option><option>Tuesday</option><option>Wednesday</option>
                    <option>Thursday</option><option>Friday</option><option>Saturday</option><option>Sunday</option>
                  </select>
                </Field>
                <div className="space-y-4">
                  <Field label="Preferred Start Time">
                    <input type="time" defaultValue="09:00" onBlur={markDirty} className={inputCls} />
                  </Field>
                  <Field label="Preferred End Time">
                    <input type="time" defaultValue="18:00" onBlur={markDirty} className={inputCls} />
                  </Field>
                  <Field label="Response Time">
                    <Select defaultValue="Within 2 hours">
                      <option>Within 1 hour</option><option>Within 2 hours</option>
                      <option>Within 4 hours</option><option>Within 24 hours</option>
                    </Select>
                  </Field>
                </div>
              </div>
              <DangerBox>Availability is used to show students your likely response and active hours.</DangerBox>
            </Card>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <Card>
              <SectionTitle icon={<SettingsBellIcon />} title="Notifications" />
              <SwitchRow title="Session Requests" desc="Notify when a student requests a session." checked={toggles.sessionRequests} onToggle={() => toggle("sessionRequests")} />
              <SwitchRow title="Messages" desc="Notify when you receive a new message." checked={toggles.messages} onToggle={() => toggle("messages")} />
              <SwitchRow title="Resource Updates" desc="Notify when students view or react to a resource." checked={toggles.resourceUpdates} onToggle={() => toggle("resourceUpdates")} />
              <SwitchRow title="Weekly Summary" desc="Send a weekly digest of your mentoring activity." checked={toggles.weeklySummary} onToggle={() => toggle("weeklySummary")} />
            </Card>
          )}

          {/* PRIVACY TAB */}
          {activeTab === "privacy" && (
            <Card>
              <SectionTitle icon={<SettingsEyeIcon />} title="Profile Visibility" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label="Public Profile" hint="If hidden, students cannot find your profile in search.">
                    <Select defaultValue="Visible to students">
                      <option>Visible to students</option><option>Hidden (not searchable)</option>
                    </Select>
                  </Field>
                </div>
                <Field label="Show Email"><Select defaultValue="Yes"><option>Yes</option><option>No</option></Select></Field>
                <Field label="Show Phone"><Select defaultValue="No"><option>No</option><option>Yes</option></Select></Field>
              </div>
              <DangerBox>Keep personal contact details limited. Use in-app messaging when possible.</DangerBox>
            </Card>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <Card>
              <SectionTitle icon={<SettingsLockIcon />} title="Security" />
              <SwitchRow title="Two‑Factor Authentication (2FA)" desc="Extra protection for your mentor account." checked={toggles.twoFA} onToggle={() => toggle("twoFA")} />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Login Alerts" hint="Get notified when a new device signs in.">
                  <Select defaultValue="Enabled"><option>Enabled</option><option>Disabled</option></Select>
                </Field>
                <Field label="Session Timeout">
                  <Select defaultValue="30 minutes">
                    <option>15 minutes</option><option>30 minutes</option>
                    <option>60 minutes</option><option>Never (not recommended)</option>
                  </Select>
                </Field>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => setModal("devices")}
                  className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white">View Devices</button>
                <button type="button" onClick={() => setModal("reset")}
                  className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white">Change Password</button>
              </div>
            </Card>
          )}

          {/* Sticky Save Bar */}
          <div className="sticky bottom-5 z-40 rounded-2xl bg-white px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className={`flex items-center gap-2 text-sm ${status.text}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />{status.label}
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={discardChanges}
                  className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white">Cancel</button>
                <button type="button" onClick={saveChanges}
                  className="rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500 hover:shadow-[0_4px_12px_rgba(93,217,193,0.35)]">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastState.open && (
        <div className="fixed bottom-5 left-1/2 z-[1100] w-[min(520px,92%)] -translate-x-1/2 rounded-2xl border border-black/5 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-1 text-sm font-extrabold text-slate-800">{toastState.title}</div>
              <div className="text-[13px] leading-5 text-slate-500">{toastState.msg}</div>
            </div>
            <button type="button" onClick={closeToast} className="grid h-9 w-9 place-items-center rounded-full bg-slate-50 text-lg text-slate-500 hover:bg-slate-200">×</button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ModalShell open={modal === "reset"} title="Reset Password" onClose={() => { setModal(null); }}>
        <PasswordModal onClose={() => setModal(null)} showToast={showToast} />
      </ModalShell>

      <ModalShell open={modal === "devices"} title="Signed-in Devices" onClose={() => setModal(null)}>
        <div className="space-y-3">
          <DangerBox>This list is a demo. In your real system, show device name, location, and last active time.</DangerBox>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-slate-100 bg-white px-4 py-4">
              <div><div className="text-sm font-extrabold text-slate-800">Windows PC • Chrome</div><div className="text-xs text-slate-500">Last active: Today</div></div>
              <Pill>Current</Pill>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-slate-100 bg-white px-4 py-4">
              <div><div className="text-sm font-extrabold text-slate-800">Android • Mobile App</div><div className="text-xs text-slate-500">Last active: Yesterday</div></div>
              <button type="button" onClick={() => showToast("Signed out", "Device signed out (demo).")} className="rounded-xl border-2 border-teal-400 bg-white px-4 py-2 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white">Sign out</button>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="button" onClick={() => setModal(null)} className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white">Close</button>
          </div>
        </div>
      </ModalShell>

      <ModalShell open={modal === "deactivate"} title="Deactivate Account" onClose={() => setModal(null)}>
        <DangerBox>Deactivating hides your mentor profile and pauses notifications.</DangerBox>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setModal(null)} className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white">Cancel</button>
          <button type="button" onClick={() => { setModal(null); showToast("Deactivated", "Account deactivated (demo)."); }} className="rounded-xl bg-teal-400 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500">Deactivate</button>
        </div>
      </ModalShell>

      <ModalShell open={modal === "delete"} title="Delete Account" onClose={() => setModal(null)}>
        <DangerBox>This action is permanent. Your mentor profile, sessions history, and resources will be removed.</DangerBox>
        <Field label={<span>Type <b>DELETE</b> to confirm</span>}>
          <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE" className={inputCls} />
        </Field>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => setModal(null)} className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white">Cancel</button>
          <button type="button" onClick={doDelete} className="rounded-xl border-2 border-teal-500 bg-white px-5 py-2.5 text-sm font-semibold text-teal-600 transition hover:bg-teal-500 hover:text-white">Delete</button>
        </div>
      </ModalShell>
    </>
  );
}

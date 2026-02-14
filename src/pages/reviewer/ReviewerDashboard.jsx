import React, { useMemo, useRef, useState } from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const TYPES = [
  { value: "all", label: "All Types" },
  { value: "course", label: "Courses" },
  { value: "educator_credentials", label: "Educator Credentials" },
  { value: "student_certification", label: "Student Certifications" },
];

const STATUSES = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "flagged", label: "Flagged" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const typeLabel = (t) => {
  if (t === "course") return "Course";
  if (t === "educator_credentials") return "Educator Credentials";
  if (t === "student_certification") return "Student Certification";
  return "Item";
};

const statusPill = (status) => {
  const s = (status || "").toLowerCase();

  if (s === "flagged") {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold text-rose-600">
        Flagged
      </span>
    );
  }
  if (s === "pending") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-700">
        Pending
      </span>
    );
  }
  if (s === "approved") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
        Approved
      </span>
    );
  }
  if (s === "rejected") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700">
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
      {status || "Unknown"}
    </span>
  );
};

const ModalShell = ({ open, title, children, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close modal backdrop"
      />
      <div className="relative mx-auto mt-16 w-[92%] max-w-2xl">
        <div className="rounded-2xl bg-white shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="text-lg font-extrabold text-slate-900">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
};

const ReviewerDashboard = () => {
  const { currentUser, courses } = useApp();

  // ---------------- Reviewer Profile (read-only display + modal editor) ----------------
  const fileInputRef = useRef(null);

  const initialPhoto =
    currentUser?.photoUrl ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=60";

  const [profileSaved, setProfileSaved] = useState({
    fullName: currentUser?.name || "Alexandria Smith",
    email: currentUser?.email || "alex.smith@email.com",
    photoUrl: initialPhoto,
    domains: Array.isArray(currentUser?.domains || currentUser?.subjects)
      ? (currentUser?.domains || currentUser?.subjects)
      : ["Web Development"],
  });

  const [isReviewerActive, setIsReviewerActive] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    fullName: profileSaved.fullName,
    photoUrl: profileSaved.photoUrl,
    domains: [...profileSaved.domains],
    password: "",
    confirmPassword: "",
  });

  const resetDraftFromSaved = () => {
    setProfileDraft({
      fullName: profileSaved.fullName,
      photoUrl: profileSaved.photoUrl,
      domains: [...profileSaved.domains],
      password: "",
      confirmPassword: "",
    });
  };

  const openEdit = () => {
    resetDraftFromSaved();
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
  };

  const onPickAvatar = () => fileInputRef.current?.click();

  const onAvatarSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfileDraft((p) => ({ ...p, photoUrl: url }));
    e.target.value = "";
  };

  const removeDomain = (d) =>
    setProfileDraft((p) => ({ ...p, domains: p.domains.filter((x) => x !== d) }));

  const addDomain = (d) => {
    const v = d.trim();
    if (!v) return;
    setProfileDraft((p) => {
      const exists = p.domains.some((x) => x.toLowerCase() === v.toLowerCase());
      if (exists) return p;
      return { ...p, domains: [...p.domains, v] };
    });
  };

  const isDirty = useMemo(() => {
    const domainsSame =
      profileDraft.domains.length === profileSaved.domains.length &&
      profileDraft.domains.every((d) => profileSaved.domains.includes(d));

    const photoSame = profileDraft.photoUrl === profileSaved.photoUrl;
    const nameSame = profileDraft.fullName.trim() === profileSaved.fullName.trim();

    const pw = profileDraft.password.trim();
    const cpw = profileDraft.confirmPassword.trim();
    const passwordTouched = pw.length > 0 || cpw.length > 0;

    const passwordValid = !passwordTouched || (pw.length >= 6 && pw === cpw);

    return {
      changed: !(domainsSame && photoSame && nameSame) || passwordTouched,
      passwordValid,
    };
  }, [profileDraft, profileSaved]);

  const discardChanges = () => {
    resetDraftFromSaved();
    closeEdit();
  };

  const updateChanges = () => {
    if (!isDirty.changed) return;
    if (!isDirty.passwordValid) return;

    // NOTE: password update not persisted here; wire to API later.
    setProfileSaved((prev) => ({
      ...prev,
      fullName: profileDraft.fullName.trim() || prev.fullName,
      photoUrl: profileDraft.photoUrl,
      domains: profileDraft.domains.length ? profileDraft.domains : prev.domains,
    }));
    closeEdit();
  };

  // ---------------- Review Queue (5 mixed items) ----------------
  const queueItems = useMemo(() => {
    const fromCourses = (courses || []).slice(0, 2).map((c, idx) => ({
      id: c._id || c.id || `course-${idx}`,
      type: "course",
      title: c.title || c.name || "Untitled course",
      subjectDomain: c.subject || profileSaved.domains[0] || "General",
      status: (c.status || "pending").toLowerCase(),
      meta: {
        educator: c.educatorName || c.educator || c.instructor || "Unknown educator",
        submitted: String(c.submittedAt || c.submitted || c.createdAt || "2026-02-08").slice(0, 10),
        items: c.itemsCount ?? c.items ?? 20,
        duration: c.duration || "6h",
      },
      flagReason: c.flagReason || (c.status === "flagged" ? "possible copyrighted content" : ""),
    }));

    const mocked = [
      {
        id: "cred-1",
        type: "educator_credentials",
        title: "Educator Resume + Degree Evidence",
        subjectDomain: "Web Development",
        status: "pending",
        meta: {
          educator: "Yasindu G.",
          submitted: "2026-02-08",
          evidence: "Resume.pdf, BSc_Transcript.pdf",
        },
      },
      {
        id: "cert-1",
        type: "student_certification",
        title: "CCNA Certification Submission",
        subjectDomain: "Networking",
        status: "approved",
        meta: {
          student: "Nadeesha Fernando",
          submitted: "2026-02-05",
          credential: "Cisco CCNA (200-301)",
        },
      },
      {
        id: "cred-2",
        type: "educator_credentials",
        title: "Qualification Evidence Review",
        subjectDomain: "Cyber Security",
        status: "flagged",
        meta: {
          educator: "Sakidu P.",
          submitted: "2026-02-04",
          evidence: "Diploma_Cert.pdf, Portfolio_Link",
        },
        flagReason: "document mismatch / unclear scan",
      },
    ];

    const combined = [...fromCourses, ...mocked].slice(0, 5);
    while (combined.length < 5) {
      combined.push({
        id: `fill-${combined.length + 1}`,
        type: "student_certification",
        title: "Industry Certification Submission",
        subjectDomain: "Networking",
        status: combined.length % 2 === 0 ? "rejected" : "pending",
        meta: {
          student: "Demo Student",
          submitted: "2026-02-02",
          credential: "Cisco CCNA (200-301)",
        },
      });
    }
    return combined;
  }, [courses, profileSaved.domains]);

  // ---------------- Filters ----------------
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    return queueItems.filter((item) => {
      const matchesText =
        !q ||
        (item.title || "").toLowerCase().includes(q) ||
        (item.subjectDomain || "").toLowerCase().includes(q) ||
        (item.meta?.educator || "").toLowerCase().includes(q) ||
        (item.meta?.student || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ? true : (item.status || "").toLowerCase() === statusFilter;

      const matchesType =
        typeFilter === "all" ? true : (item.type || "").toLowerCase() === typeFilter;

      return matchesText && matchesStatus && matchesType;
    });
  }, [queueItems, query, statusFilter, typeFilter]);

  const onRefreshQueue = () => window.location.reload();

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6">
        {/* Top title pill (NOT the navbar): change to "Review Panel" and make bigger */}
        <div className="rounded-2xl bg-white px-6 py-4 shadow-[0_10px_25px_rgba(0,0,0,0.12)]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3L2 8l10 5 10-5-10-5Z"
                  stroke="#25b6a2"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 10.5V16c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-5.5"
                  stroke="#25b6a2"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-[22px] font-extrabold text-slate-800">Review Panel</div>
          </div>
        </div>

        {/* Reviewer Profile card */}
        <div className="relative mt-7 rounded-2xl bg-white px-7 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.15)]">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              {/* Change heading to "Reviewer Profile" and smaller */}
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Reviewer Profile
              </h1>

              {/* Profile row (read-only like your sample) */}
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <img
                  src={profileSaved.photoUrl}
                  alt="Reviewer"
                  className="h-24 w-24 rounded-full object-cover shadow"
                />

                <div className="min-w-[240px]">
                  <div className="text-[24px] font-extrabold text-slate-900 leading-tight">
                    {profileSaved.fullName}
                  </div>
                  <div className="text-[13px] font-medium text-slate-500">
                    {profileSaved.email}
                  </div>
                </div>
              </div>

              {/* Subject Domains (visible, NOT editable here) */}
              <div className="mt-5">
                <div className="text-[11px] font-semibold text-slate-500">
                  Subject Domain
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profileSaved.domains.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-2 text-[12px] font-semibold text-slate-800"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Smaller Active toggle */}
            <div className="flex items-center gap-2">
              <div className="text-[11px] font-extrabold text-slate-700">
                {isReviewerActive ? "Active" : "Offline"}
              </div>

              <button
                type="button"
                onClick={() => setIsReviewerActive((v) => !v)}
                className={[
                  "relative h-6 w-10 rounded-full transition shadow-[0_8px_14px_rgba(0,0,0,0.12)]",
                  isReviewerActive ? "bg-emerald-400" : "bg-slate-300",
                ].join(" ")}
                aria-label="Toggle active status"
              >
                <span
                  className={[
                    "absolute top-1 h-4 w-4 rounded-full bg-white transition",
                    isReviewerActive ? "left-5" : "left-1",
                  ].join(" ")}
                />
              </button>
            </div>
          </div>

          {/* Edit Profile button bottom-right */}
          <button
            type="button"
            onClick={openEdit}
            className="absolute bottom-5 right-5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_18px_rgba(16,185,129,0.28)] active:scale-[0.98]"
          >
            Edit Profile
          </button>
        </div>

        {/* Review Queue heading in white rounded container */}
        <div className="mt-7 rounded-2xl bg-white px-6 py-4 shadow-[0_10px_25px_rgba(0,0,0,0.12)]">
          <h2 className="text-xl font-extrabold text-slate-900">Review Queue</h2>
        </div>

        {/* Filters row */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-[0_10px_20px_rgba(0,0,0,0.12)]">
            <span className="text-slate-400">🔎</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Search course / educator / student..."
            />
          </div>

          <div className="flex items-center justify-between rounded-full bg-white px-5 py-3 shadow-[0_10px_20px_rgba(0,0,0,0.12)]">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between rounded-full bg-white px-5 py-3 shadow-[0_10px_20px_rgba(0,0,0,0.12)]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Queue list card */}
        <div className="mt-5 rounded-2xl bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.15)]">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-extrabold text-slate-800">
              Queue Items ({filteredItems.length})
            </div>

            <button
              onClick={onRefreshQueue}
              className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-6 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_18px_rgba(16,185,129,0.28)] active:scale-[0.98]"
              type="button"
              title="Refresh queue"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                No review items match your filters.
              </div>
            ) : (
              filteredItems.map((item) => {
                const meta = item.meta || {};
                const topLine =
                  item.type === "course"
                    ? `Educator: ${meta.educator || "—"} • Submitted: ${meta.submitted || "—"} • Items: ${
                        meta.items ?? "—"
                      } • Duration: ${meta.duration || "—"}`
                    : item.type === "educator_credentials"
                    ? `Educator: ${meta.educator || "—"} • Submitted: ${meta.submitted || "—"} • Evidence: ${
                        meta.evidence || "—"
                      }`
                    : `Student: ${meta.student || "—"} • Submitted: ${meta.submitted || "—"} • Credential: ${
                        meta.credential || "—"
                      }`;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate text-[12px] font-extrabold text-slate-900">
                            {item.title}
                          </div>

                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-700">
                            {typeLabel(item.type)}
                          </span>
                        </div>

                        <div className="mt-1 text-[10px] text-slate-500">
                          {topLine}
                          {item.flagReason ? ` • Flag: ${item.flagReason}` : ""}
                        </div>

                        <div className="mt-2">
                          <span className="inline-flex w-full items-center rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-slate-600">
                            Subject Domain: {item.subjectDomain || "General"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {statusPill(item.status)}

                        <button
                          type="button"
                          className="rounded-full border-2 border-emerald-300 bg-white px-4 py-2 text-[11px] font-extrabold text-emerald-600 shadow-[0_8px_14px_rgba(0,0,0,0.08)] transition hover:brightness-95 active:scale-[0.98]"
                          onClick={() => alert(`Open: ${item.title}`)}
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-lg font-semibold text-slate-600">
          © 2026 EduPath. All rights reserved.
        </div>

        {/* Edit Profile Modal */}
        <ModalShell
          open={isEditOpen}
          title="Edit Profile"
          onClose={discardChanges}
        >
          <div className="space-y-5">
            {/* Profile picture */}
            <div className="flex items-center gap-4">
              <img
                src={profileDraft.photoUrl}
                alt="Draft"
                className="h-24 w-24 rounded-full object-cover shadow"
              />
              <div>
                <button
                  type="button"
                  onClick={onPickAvatar}
                  className="rounded-full border-2 border-emerald-300 bg-white px-4 py-2 text-sm font-extrabold text-emerald-700 shadow-[0_8px_14px_rgba(0,0,0,0.08)] active:scale-[0.98]"
                >
                  Upload Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onAvatarSelected}
                  className="hidden"
                />
                <div className="mt-1 text-xs text-slate-500">
                  Choose an image from your device.
                </div>
              </div>
            </div>

            {/* Full name (editable) */}
            <div>
              <div className="text-[12px] font-extrabold text-slate-700">Full Name</div>
              <input
                value={profileDraft.fullName}
                onChange={(e) =>
                  setProfileDraft((p) => ({ ...p, fullName: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-300"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email (NOT editable) */}
            <div>
              <div className="text-[12px] font-extrabold text-slate-700">Email Address</div>
              <input
                value={profileSaved.email}
                disabled
                className="mt-2 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 outline-none"
              />
            </div>

            {/* Password (editable) */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-[12px] font-extrabold text-slate-700">New Password</div>
                <input
                  type="password"
                  value={profileDraft.password}
                  onChange={(e) =>
                    setProfileDraft((p) => ({ ...p, password: e.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-300"
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <div className="text-[12px] font-extrabold text-slate-700">Confirm Password</div>
                <input
                  type="password"
                  value={profileDraft.confirmPassword}
                  onChange={(e) =>
                    setProfileDraft((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-300"
                  placeholder="Repeat password"
                />
              </div>
            </div>

            {(!isDirty.passwordValid && (profileDraft.password || profileDraft.confirmPassword)) ? (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                Passwords must match and be at least 6 characters.
              </div>
            ) : null}

            {/* Subject domains list (editable in modal only) */}
            <div>
              <div className="text-[12px] font-extrabold text-slate-700">Subject Domain List</div>

              <div className="mt-2 flex flex-wrap gap-2">
                {profileDraft.domains.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-[12px] font-semibold text-slate-800"
                  >
                    {d}
                    <button
                      type="button"
                      onClick={() => removeDomain(d)}
                      className="grid h-5 w-5 place-items-center rounded-full bg-white/70 text-slate-600 hover:bg-white"
                      title="Remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add domain inside modal */}
              <AddDomainRow onAdd={addDomain} />
            </div>

            {/* Bottom-right actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={discardChanges}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Discard
              </button>

              <button
                type="button"
                onClick={updateChanges}
                disabled={!isDirty.changed || !isDirty.passwordValid}
                className={[
                  "rounded-full px-5 py-2.5 text-sm font-extrabold shadow-[0_10px_18px_rgba(16,185,129,0.25)] active:scale-[0.98]",
                  !isDirty.changed || !isDirty.passwordValid
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-emerald-400 to-teal-400 text-white",
                ].join(" ")}
              >
                Update Changes
              </button>
            </div>
          </div>
        </ModalShell>
      </div>
    </PageShell>
  );
};

const AddDomainRow = ({ onAdd }) => {
  const [value, setValue] = useState("");

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onAdd(value);
            setValue("");
          }
        }}
        className="w-full max-w-sm rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-emerald-300"
        placeholder="Add another domain (e.g., Networking)"
      />
      <button
        type="button"
        onClick={() => {
          onAdd(value);
          setValue("");
        }}
        className="rounded-full border-2 border-emerald-300 bg-white px-5 py-2 text-sm font-extrabold text-emerald-700 shadow-[0_8px_14px_rgba(0,0,0,0.08)] active:scale-[0.98]"
      >
        Add
      </button>
    </div>
  );
};

export default ReviewerDashboard;

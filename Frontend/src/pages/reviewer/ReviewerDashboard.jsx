import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import * as authApi from "../../api/authApi.js";

const TYPES = [
  { value: "all", label: "All Types" },
  { value: "course", label: "Courses" },
  { value: "educator_credentials", label: "Educator Credentials" },
  { value: "student_certification", label: "Student Certifications" },
];

const STATUSES = [
  { value: "all", label: "All Statuses" },
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

const StatusPill = ({ status }) => {
  const s = (status || "").toLowerCase();
  const map = {
    flagged:  "bg-rose-50 text-rose-600 border-rose-200",
    pending:  "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-primary/10 text-primary border-primary/20",
    rejected: "bg-slate-100 text-slate-500 border-slate-200",
  };
  const cls = map[s] || "bg-slate-100 text-slate-500 border-slate-200";
  const label = s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
};

const ModalShell = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-xl">
        <div className="glass-card p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
            <h3 className="text-base font-semibold text-text-dark">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full bg-black/5 text-muted hover:bg-black/10 transition text-lg"
              aria-label="Close"
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
  const { currentUser, courses, fetchReviewerQueue } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchReviewerQueue();
  }, [fetchReviewerQueue]);

  // ---------------- Reviewer Profile ----------------
  const fileInputRef = useRef(null);

  const initialPhoto =
    currentUser?.photoUrl ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=60";

  const [profileSaved, setProfileSaved] = useState({
    fullName: currentUser?.name || "Reviewer",
    email: currentUser?.email || "",
    photoUrl: initialPhoto,
    domains: Array.isArray(currentUser?.domains || currentUser?.subjects)
      ? currentUser?.domains || currentUser?.subjects
      : ["General"],
  });

  const [isReviewerActive, setIsReviewerActive] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    fullName: profileSaved.fullName,
    photoUrl: profileSaved.photoUrl,
    domains: [...profileSaved.domains],
    password: "",
    confirmPassword: "",
  });

  const resetDraftFromSaved = () =>
    setProfileDraft({
      fullName: profileSaved.fullName,
      photoUrl: profileSaved.photoUrl,
      domains: [...profileSaved.domains],
      password: "",
      confirmPassword: "",
    });

  const openEdit = () => { resetDraftFromSaved(); setIsEditOpen(true); };
  const closeEdit = () => {
    setIsEditOpen(false);
    if (searchParams.get("profile") === "1") {
      const next = new URLSearchParams(searchParams);
      next.delete("profile");
      setSearchParams(next, { replace: true });
    }
  };
  const discardChanges = () => { resetDraftFromSaved(); closeEdit(); };

  useEffect(() => {
    if (searchParams.get("profile") === "1") {
      openEdit();
    }
  }, [searchParams]);

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
      if (p.domains.some((x) => x.toLowerCase() === v.toLowerCase())) return p;
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
    return { changed: !(domainsSame && photoSame && nameSame) || passwordTouched, passwordValid };
  }, [profileDraft, profileSaved]);

  const updateChanges = async () => {
    if (!isDirty.changed || !isDirty.passwordValid) return;
    setSaveError("");
    setSaving(true);
    try {
      const payload = {
        name: profileDraft.fullName.trim() || profileSaved.fullName,
        profile: { photoUrl: profileDraft.photoUrl, domains: profileDraft.domains },
      };
      if (profileDraft.password.trim().length >= 6) payload.password = profileDraft.password.trim();
      await authApi.updateProfile(payload);
      setProfileSaved((prev) => ({
        ...prev,
        fullName: profileDraft.fullName.trim() || prev.fullName,
        photoUrl: profileDraft.photoUrl,
        domains: profileDraft.domains.length ? profileDraft.domains : prev.domains,
      }));
      closeEdit();
    } catch (err) {
      setSaveError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- Queue Items (real courses only) ----------------
  const queueItems = useMemo(() => {
    return (courses || []).map((c) => ({
      id: c._id || c.id,
      type: "course",
      title: c.title || c.name || "Untitled course",
      subjectDomain: c.category || c.specializationTag || c.subject || "General",
      status: (c.status || "pending").toLowerCase(),
      meta: {
        educator: c.educatorName || c.createdByEducatorEmail || "Unknown educator",
        submitted: String(c.submittedAt || c.createdAt || "").slice(0, 10) || "—",
        items: c.itemsCount ?? c.curriculum?.length ?? "—",
        duration: c.duration || "—",
      },
      flagReason: c.flagReason || "",
    }));
  }, [courses]);

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
        (item.meta?.educator || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || (item.status || "").toLowerCase() === statusFilter;
      const matchesType = typeFilter === "all" || (item.type || "").toLowerCase() === typeFilter;
      return matchesText && matchesStatus && matchesType;
    });
  }, [queueItems, query, statusFilter, typeFilter]);

  const pendingCount = queueItems.filter((i) => i.status === "pending").length;

  return (
    <PageShell>
      <div className="space-y-6">

        {/* Header */}
        <div className="glass-card p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text-dark">Review Panel</h1>
            <p className="mt-1 text-xs text-muted">
              Manage your review queue and track course approvals.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="text-xs font-semibold text-muted">
              {isReviewerActive ? "Active" : "Offline"}
            </span>
            <button
              type="button"
              onClick={() => setIsReviewerActive((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition-colors shadow-inner ${
                isReviewerActive ? "bg-primary" : "bg-slate-300"
              }`}
              aria-label="Toggle active status"
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                  isReviewerActive ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "In Queue", value: queueItems.length },
            { label: "Pending", value: pendingCount },
            { label: "Approved", value: queueItems.filter(i => i.status === "approved").length },
            { label: "Rejected", value: queueItems.filter(i => i.status === "rejected").length },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <p className="text-2xl font-semibold text-text-dark">{s.value}</p>
              <p className="mt-1 text-[11px] text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Reviewer Profile */}
        <div className="glass-card p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-semibold text-text-dark">Reviewer Profile</h2>
            <button
              type="button"
              onClick={openEdit}
              className="btn-soft px-5 py-2 text-xs"
            >
              Edit Profile
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-5">
            <img
              src={profileSaved.photoUrl}
              alt="Reviewer"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20 shadow"
            />
            <div>
              <p className="text-base font-semibold text-text-dark">{profileSaved.fullName}</p>
              <p className="text-xs text-muted mt-0.5">{profileSaved.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profileSaved.domains.map((d) => (
                  <span
                    key={d}
                    className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[11px] font-semibold text-primary"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Review Queue */}
        <div className="glass-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold text-text-dark">
              Review Queue
              {filteredItems.length > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {filteredItems.length}
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-soft px-5 py-2 text-xs self-start sm:self-auto"
            >
              ↻ Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5">
              <svg className="h-3.5 w-3.5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-text-dark outline-none placeholder:text-muted"
                placeholder="Search course or educator..."
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-xs font-medium text-text-dark outline-none"
            >
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-xs font-medium text-text-dark outline-none"
            >
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Queue list */}
          <div className="mt-4 space-y-3">
            {filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 bg-white/50 px-6 py-12 text-center">
                <p className="text-sm font-medium text-muted">No review items match your filters.</p>
                <p className="mt-1 text-xs text-muted">Try adjusting your search or filters above.</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const meta = item.meta || {};
                const metaLine =
                  item.type === "course"
                    ? `Educator: ${meta.educator || "—"} · Submitted: ${meta.submitted || "—"} · Duration: ${meta.duration || "—"}`
                    : item.type === "educator_credentials"
                    ? `Educator: ${meta.educator || "—"} · Submitted: ${meta.submitted || "—"} · Evidence: ${meta.evidence || "—"}`
                    : `Student: ${meta.student || "—"} · Submitted: ${meta.submitted || "—"} · Credential: ${meta.credential || "—"}`;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-white/80 border border-black/5 shadow-sm px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-text-dark truncate">{item.title}</p>
                        <span className="rounded-full bg-black/5 border border-black/10 px-2.5 py-0.5 text-[10px] font-semibold text-muted">
                          {typeLabel(item.type)}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted">{metaLine}</p>
                      {item.flagReason && (
                        <p className="mt-1 text-[11px] font-semibold text-rose-500">⚑ {item.flagReason}</p>
                      )}
                      <div className="mt-2">
                        <span className="rounded-full bg-primary/8 border border-primary/15 px-3 py-1 text-[10px] font-semibold text-primary">
                          {item.subjectDomain}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <StatusPill status={item.status} />
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/reviewer/queue/${item.id}?type=${item.type}`, {
                            state: { reviewItem: item },
                          })
                        }
                        className="btn-primary px-5 py-2 text-xs"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <ModalShell open={isEditOpen} title="Edit Profile" onClose={discardChanges}>
        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <img src={profileDraft.photoUrl} alt="Draft" className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20" />
            <div>
              <button type="button" onClick={onPickAvatar} className="btn-soft px-4 py-2 text-xs">
                Upload Photo
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onAvatarSelected} className="hidden" />
              <p className="mt-1 text-[11px] text-muted">Choose an image from your device.</p>
            </div>
          </div>

          {/* Full name */}
          <div>
            <label className="field-label">Full Name</label>
            <input
              value={profileDraft.fullName}
              onChange={(e) => setProfileDraft((p) => ({ ...p, fullName: e.target.value }))}
              className="field-input mt-1"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="field-label">Email Address</label>
            <input value={profileSaved.email} disabled className="field-input mt-1 cursor-not-allowed bg-slate-50 text-muted" />
          </div>

          {/* Password */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label">New Password</label>
              <input
                type="password"
                value={profileDraft.password}
                onChange={(e) => setProfileDraft((p) => ({ ...p, password: e.target.value }))}
                className="field-input mt-1"
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="field-label">Confirm Password</label>
              <input
                type="password"
                value={profileDraft.confirmPassword}
                onChange={(e) => setProfileDraft((p) => ({ ...p, confirmPassword: e.target.value }))}
                className="field-input mt-1"
                placeholder="Repeat password"
              />
            </div>
          </div>
          {!isDirty.passwordValid && (profileDraft.password || profileDraft.confirmPassword) && (
            <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600">
              Passwords must match and be at least 6 characters.
            </p>
          )}

          {/* Subject Domains */}
          <div>
            <label className="field-label">Subject Domains</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {profileDraft.domains.map((d) => (
                <span key={d} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[11px] font-semibold text-primary">
                  {d}
                  <button type="button" onClick={() => removeDomain(d)} className="hover:opacity-70">×</button>
                </span>
              ))}
            </div>
            <AddDomainRow onAdd={addDomain} />
          </div>

          {saveError && (
            <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600">{saveError}</p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={discardChanges} className="btn-outline px-5 py-2 text-xs">
              Discard
            </button>
            <button
              type="button"
              onClick={updateChanges}
              disabled={!isDirty.changed || !isDirty.passwordValid || saving}
              className="btn-primary px-5 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </ModalShell>
    </PageShell>
  );
};

const AddDomainRow = ({ onAdd }) => {
  const [value, setValue] = useState("");
  return (
    <div className="mt-3 flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { onAdd(value); setValue(""); } }}
        className="field-input flex-1"
        placeholder="Add a domain (e.g., Networking)"
      />
      <button
        type="button"
        onClick={() => { onAdd(value); setValue(""); }}
        className="btn-soft px-4 py-2 text-xs"
      >
        Add
      </button>
    </div>
  );
};

export default ReviewerDashboard;

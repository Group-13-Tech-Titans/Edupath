import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const normalizeStatus = (status) => {
  const s = String(status ?? "").toLowerCase().trim();
  if (s === "draft")                            return "draft";
  if (s === "approved" || s.includes("approve")) return "approved";
  if (s === "pending"  || s.includes("pending")) return "pending";
  if (s === "rejected" || s.includes("reject"))  return "rejected";
  return "approved";
};

const isTrashed = (c) => Boolean(c?.trashedAt);

const statusMeta = (status) => {
  const s = normalizeStatus(status);
  if (s === "draft")    return { label: "Draft",    cls: "bg-slate-100 text-slate-600 border-slate-200" };
  if (s === "approved") return { label: "Approved", cls: "bg-primary/10 text-primary border-primary/20" };
  if (s === "pending")  return { label: "Pending",  cls: "bg-amber-50 text-amber-700 border-amber-200" };
  return                       { label: "Rejected", cls: "bg-rose-50 text-rose-600 border-rose-200" };
};

/* ─── Sub-components ──────────────────────────────────────────────────────── */

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 4h6M4 8h16m-2 0-.8 11H6.8L6 8" />
  </svg>
);

const RestoreIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6M3.51 15a9 9 0 1 0 .49-4.5" />
  </svg>
);

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9v4m0 4h.01M10.3 4.4 2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.4a2 2 0 0 0-3.4 0z" />
  </svg>
);

/* Confirm dialog overlay */
const ConfirmDialog = ({ course, onConfirm, onCancel, busy }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} aria-label="Cancel" />
    <div className="relative glass-card w-full max-w-sm p-6">
      <h3 className="font-semibold text-text-dark">Move to Trash?</h3>
      <p className="mt-2 text-xs text-muted">
        "<span className="font-medium text-text-dark">{course.title}</span>" will be moved to the trash bin. You can restore it later.
      </p>
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-outline px-5 py-2 text-xs">Cancel</button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="rounded-full bg-rose-500 px-5 py-2 text-xs font-medium text-white hover:bg-rose-600 transition disabled:opacity-60"
        >
          {busy ? "Moving..." : "Move to Trash"}
        </button>
      </div>
    </div>
  </div>
);

const DeleteConfirmDialog = ({ request, count, onConfirm, onCancel, busy }) => {
  if (!request) return null;

  const isEmptyTrash = request.type === "empty";
  const title = isEmptyTrash ? "Empty Trash Bin?" : "Delete Course Permanently?";
  const description = isEmptyTrash
    ? `This will permanently delete ${count} trashed course${count !== 1 ? "s" : ""}. You cannot restore them later.`
    : `"${request.course?.title}" will be permanently deleted. You cannot restore it later.`;
  const confirmText = isEmptyTrash ? "Empty Trash" : "Delete Permanently";
  const busyText = isEmptyTrash ? "Emptying..." : "Deleting...";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/35 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Cancel permanent delete"
      />
      <div className="relative w-full max-w-md rounded-lg border border-rose-100 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-500">
            <WarningIcon />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-dark">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3">
          <p className="text-xs font-semibold text-rose-700">This action cannot be undone.</p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="btn-outline px-5 py-2 text-xs disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-lg bg-rose-500 px-5 py-2 text-xs font-semibold text-white hover:bg-rose-600 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? busyText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

/* Course card */
const CourseCard = ({ course, onTrash }) => {
  const { label, cls } = statusMeta(course.status);
  const st = normalizeStatus(course.status);
  const isDraft = st === "draft";
  const isRejected = st === "rejected";
  const reviewNotes = course.review?.notes || null;
  const reviewRating = course.review?.rating ?? null;
  const reviewerName = course.review?.reviewerName || null;
  const hasReview = Boolean(reviewNotes || reviewRating != null || reviewerName);

  return (
    <div className="glass-card flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-2xl">
      {/* Thumbnail */}
      <div className="relative h-36 w-full overflow-hidden bg-primary/5">
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-wide text-muted opacity-70">Course</div>
        )}
        <span className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${cls}`}>
          {label}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm font-semibold text-text-dark line-clamp-2 leading-snug">{course.title}</p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {course.category && (
            <span className="rounded-full bg-black/5 border border-black/10 px-2.5 py-0.5 text-[10px] font-semibold text-muted">
              {course.category}
            </span>
          )}
          {course.level && (
            <span className="rounded-full bg-black/5 border border-black/10 px-2.5 py-0.5 text-[10px] font-semibold text-muted">
              {course.level}
            </span>
          )}
        </div>

        <p className="mt-2 text-[11px] text-muted line-clamp-2 flex-1">
          {course.description || "No description provided."}
        </p>

        {/* Reviewer feedback */}
        {hasReview && (
          <div className={`mt-3 rounded-xl border px-3 py-2 ${
            isRejected
              ? "border-rose-200 bg-rose-50"
              : "border-primary/20 bg-primary/5"
          }`}>
            <div className="flex items-center justify-between gap-2">
              <p className={`text-[10px] font-semibold mb-0.5 ${isRejected ? "text-rose-700" : "text-primary"}`}>
                Reviewer Feedback
                {reviewerName && (
                  <span className={`font-normal ${isRejected ? "text-rose-500" : "text-primary/80"}`}> - {reviewerName}</span>
                )}
              </p>
              {reviewRating != null && (
                <span className={`text-[10px] font-medium ${isRejected ? "text-rose-500" : "text-primary/80"}`}>
                  {reviewRating}/5
                </span>
              )}
            </div>
            <p className={`text-[10px] line-clamp-2 ${isRejected ? "text-rose-700" : "text-text-dark"}`}>
              {reviewNotes || "No specific notes provided."}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <Link
            to={(isDraft || isRejected) ? `/educator/edit/${course.id}` : `/educator/courses/${course.id}`}
            className="btn-primary flex-1 px-4 py-2 text-xs text-center"
          >
            {(isDraft || isRejected) ? "Edit" : "Manage"}
          </Link>
          <button
            type="button"
            onClick={() => onTrash(course)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-400 hover:bg-rose-50 transition"
            title="Move to trash"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main component ──────────────────────────────────────────────────────── */

const EducatorCourses = () => {
  const {
    currentUser,
    courses,
    fetchMyCourses,
    moveCourseToTrash,
    restoreCourseFromTrash,
    permanentlyDeleteCourse,
    emptyCourseTrash
  } = useApp();

  useEffect(() => { fetchMyCourses(); }, [fetchMyCourses]);

  const myCourses = useMemo(
    () => courses.filter((c) => c.createdByEducatorEmail === currentUser?.email),
    [courses, currentUser?.email]
  );

  const activeCourses  = useMemo(() => myCourses.filter((c) => !isTrashed(c)), [myCourses]);
  const trashedCourses = useMemo(() => myCourses.filter(isTrashed),            [myCourses]);

  /* ── State ── */
  const [activeTab,      setActiveTab]      = useState("all");
  const [query,          setQuery]          = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter,   setStatusFilter]   = useState("All");
  const [levelFilter,    setLevelFilter]    = useState("All");
  const [courseToTrash,  setCourseToTrash]  = useState(null);
  const [trashBusy,      setTrashBusy]      = useState(false);
  const [trashError,     setTrashError]     = useState("");
  const [restoreBusyId,  setRestoreBusyId]  = useState("");
  const [deleteBusyId,   setDeleteBusyId]   = useState("");
  const [emptyBusy,      setEmptyBusy]      = useState(false);
  const [deleteRequest,  setDeleteRequest]  = useState(null);

  /* ── Filter options ── */
  const categories = useMemo(() => {
    const s = new Set(activeCourses.map((c) => c.category).filter(Boolean));
    return ["All", ...Array.from(s).sort()];
  }, [activeCourses]);

  const levels = useMemo(() => {
    const s = new Set(activeCourses.map((c) => c.level).filter(Boolean));
    ["Beginner", "Intermediate", "Advanced"].forEach((l) => s.add(l));
    return ["All", ...Array.from(s)];
  }, [activeCourses]);

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = activeTab === "drafts"
      ? activeCourses.filter((c) => normalizeStatus(c.status) === "draft")
      : activeCourses;

    return base.filter((c) => {
      const matchQ  = !q || (c.title || "").toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q);
      const matchCat = categoryFilter === "All" || c.category === categoryFilter;
      const matchSt  = statusFilter   === "All" || statusMeta(c.status).label === statusFilter;
      const matchLv  = levelFilter    === "All" || c.level === levelFilter;
      return matchQ && matchCat && matchSt && matchLv;
    });
  }, [activeCourses, activeTab, query, categoryFilter, statusFilter, levelFilter]);

  /* ── Trash actions ── */
  const confirmTrash = async () => {
    if (!courseToTrash) return;
    setTrashError("");
    setTrashBusy(true);
    const result = await moveCourseToTrash(courseToTrash.id);
    setTrashBusy(false);
    if (!result.success) { setTrashError(result.message || "Failed to move to trash."); return; }
    setCourseToTrash(null);
  };

  const handleRestore = async (courseId) => {
    setTrashError("");
    setRestoreBusyId(courseId);
    const result = await restoreCourseFromTrash(courseId);
    if (!result.success) setTrashError(result.message || "Failed to restore course.");
    setRestoreBusyId("");
  };

  const requestPermanentDelete = (course) => {
    setDeleteRequest({ type: "single", course });
  };

  const requestEmptyTrash = () => {
    if (trashedCourses.length === 0) return;
    setDeleteRequest({ type: "empty" });
  };

  const confirmPermanentAction = async () => {
    if (!deleteRequest) return;
    setTrashError("");

    if (deleteRequest.type === "empty") {
      setEmptyBusy(true);
      const result = await emptyCourseTrash();
      if (!result.success) {
        setTrashError(result.message || "Failed to empty trash.");
      } else {
        setDeleteRequest(null);
      }
      setEmptyBusy(false);
      return;
    }

    const course = deleteRequest.course;
    if (!course) return;
    setDeleteBusyId(course.id);
    const result = await permanentlyDeleteCourse(course.id);
    if (!result.success) {
      setTrashError(result.message || "Failed to permanently delete course.");
    } else {
      setDeleteRequest(null);
    }
    setDeleteBusyId("");
  };

  const cancelPermanentAction = () => {
    if (emptyBusy || deleteBusyId) return;
    setDeleteRequest(null);
  };

  const draftCount = activeCourses.filter((c) => normalizeStatus(c.status) === "draft").length;

  return (
    <PageShell>
      <div className="space-y-5">

        {/* Header */}
        <div className="glass-card p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text-dark">My Courses</h1>
            <p className="mt-1 text-xs text-muted">
              Manage, search and track all your courses.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              {activeCourses.length} courses
            </span>
            <Link to="/educator/publish" className="btn-primary px-5 py-2 text-xs">
              + Create Course
            </Link>
          </div>
        </div>

        {trashError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
            {trashError}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">

          {/* ── Sidebar ── */}
          <div className="glass-card h-fit p-4 space-y-1">
            {[
              { key: "all",    label: "All Courses",   count: activeCourses.length },
              { key: "drafts", label: "Drafts",        count: draftCount },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                type="button"
                onClick={() => { setActiveTab(key); setCategoryFilter("All"); setStatusFilter("All"); setLevelFilter("All"); }}
                className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  activeTab === key
                    ? "bg-primary text-white"
                    : "text-text-dark hover:bg-primary/5"
                }`}
              >
                <span>{label}</span>
                <span className={`text-[10px] font-semibold ${activeTab === key ? "opacity-80" : "text-muted"}`}>
                  {count}
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setActiveTab("trash")}
              className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                activeTab === "trash"
                  ? "bg-rose-500 text-white"
                  : "text-rose-500 hover:bg-rose-50"
              }`}
            >
              <span>Trash Bin</span>
              <span className="text-[10px] opacity-80">{trashedCourses.length}</span>
            </button>

            {/* Category filter (only in all/drafts tab) */}
            {activeTab !== "trash" && categories.length > 1 && (
              <div className="pt-3 border-t border-black/5">
                <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">Category</p>
                <div className="space-y-0.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`w-full rounded-xl px-3 py-2 text-left text-[11px] font-semibold transition ${
                        categoryFilter === cat
                          ? "bg-primary/10 text-primary"
                          : "text-muted hover:text-text-dark hover:bg-black/5"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Main content ── */}
          {activeTab !== "trash" ? (
            <div className="space-y-4">

              {/* Search + filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-2 rounded-2xl border border-black/10 bg-white/80 px-4 py-2.5">
                  <svg className="h-3.5 w-3.5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full bg-transparent text-sm text-text-dark outline-none placeholder:text-muted"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-2xl border border-black/10 bg-white/80 px-4 py-2.5 text-xs font-medium text-text-dark outline-none"
                >
                  {["All", "Draft", "Pending", "Approved", "Rejected"].map((s) => (
                    <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
                  ))}
                </select>

                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="rounded-2xl border border-black/10 bg-white/80 px-4 py-2.5 text-xs font-medium text-text-dark outline-none"
                >
                  {levels.map((l) => (
                    <option key={l} value={l}>{l === "All" ? "All Levels" : l}</option>
                  ))}
                </select>
              </div>

              {/* Results count */}
              <p className="text-xs text-muted">
                {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
              </p>

              {/* Empty state */}
              {filtered.length === 0 && (
                <div className="glass-card px-6 py-16 text-center">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-2xl">
                    No courses
                  </div>
                  <p className="text-sm font-semibold text-text-dark">No courses found</p>
                  <p className="mt-1 text-xs text-muted">
                    {query || categoryFilter !== "All" || statusFilter !== "All" || levelFilter !== "All"
                      ? "Try adjusting your search or filters."
                      : "Create your first course to get started."}
                  </p>
                  {!query && categoryFilter === "All" && statusFilter === "All" && levelFilter === "All" && (
                    <Link to="/educator/publish" className="btn-primary mt-4 inline-flex px-6 py-2 text-xs">
                      + Create Course
                    </Link>
                  )}
                </div>
              )}

              {/* Course grid */}
              {filtered.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onTrash={setCourseToTrash}
                    />
                  ))}
                </div>
              )}
            </div>

          ) : (
            /* ── Trash tab ── */
            <div className="space-y-4">
              <div className="glass-card overflow-hidden">
                <div className="border-b border-black/5 bg-white/70 px-5 py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-text-dark">Trash Bin</p>
                      <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">
                        Courses moved to trash are hidden from My Courses. Restore them when needed or permanently remove them from your account.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                        {trashedCourses.length} trashed
                      </span>
                      <button
                        type="button"
                        onClick={requestEmptyTrash}
                        disabled={emptyBusy || trashedCourses.length === 0}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 transition disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <TrashIcon />
                        {emptyBusy ? "Emptying..." : "Empty Trash"}
                      </button>
                    </div>
                  </div>
                </div>

                {trashedCourses.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
                      <TrashIcon />
                    </div>
                    <p className="text-sm font-semibold text-text-dark">Trash is empty</p>
                    <p className="mt-1 text-xs text-muted">Courses you move to trash will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-black/5">
                    {trashedCourses.map((course) => {
                      const { label, cls } = statusMeta(course.status);
                      const trashedDate = course.trashedAt
                        ? new Date(course.trashedAt).toLocaleDateString()
                        : "Unknown date";

                      return (
                        <div
                          key={course.id}
                          className="flex flex-col gap-4 px-5 py-4 transition hover:bg-white/65 lg:flex-row lg:items-center lg:justify-between"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-text-dark">{course.title}</p>
                              <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${cls}`}>
                                {label}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {course.category && (
                                <span className="rounded-lg border border-black/10 bg-black/5 px-2.5 py-1 text-[10px] font-semibold text-muted">
                                  {course.category}
                                </span>
                              )}
                              {course.level && (
                                <span className="rounded-lg border border-black/10 bg-black/5 px-2.5 py-1 text-[10px] font-semibold text-muted">
                                  {course.level}
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-xs text-muted">Moved to trash on {trashedDate}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleRestore(course.id)}
                              disabled={restoreBusyId === course.id || deleteBusyId === course.id}
                              className="btn-soft flex items-center gap-2 px-5 py-2 text-xs disabled:opacity-60"
                            >
                              <RestoreIcon />
                              {restoreBusyId === course.id ? "Restoring..." : "Restore"}
                            </button>
                            <button
                              type="button"
                              onClick={() => requestPermanentDelete(course)}
                              disabled={deleteBusyId === course.id || restoreBusyId === course.id}
                              className="rounded-lg border border-rose-200 bg-white px-5 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 transition disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deleteBusyId === course.id ? "Deleting..." : "Delete Permanently"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {trashedCourses.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
                  Permanent deletion removes the course from the trash bin and cannot be undone. Restore any course you want to keep before emptying the trash.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm trash dialog */}
      {courseToTrash && (
        <ConfirmDialog
          course={courseToTrash}
          onConfirm={confirmTrash}
          onCancel={() => setCourseToTrash(null)}
          busy={trashBusy}
        />
      )}

      <DeleteConfirmDialog
        request={deleteRequest}
        count={trashedCourses.length}
        onConfirm={confirmPermanentAction}
        onCancel={cancelPermanentAction}
        busy={emptyBusy || Boolean(deleteBusyId)}
      />
    </PageShell>
  );
};

export default EducatorCourses;

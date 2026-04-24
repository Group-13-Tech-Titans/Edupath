import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { getCourseById } from "../../api/courseApi.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const TYPE_META = {
  Video:       { icon: "🎬", label: "Video Lesson",         color: "border-violet-200 bg-violet-50 text-violet-700" },
  Document:    { icon: "📄", label: "Document / PDF",       color: "border-blue-200 bg-blue-50 text-blue-700" },
  PowerPoint:  { icon: "📊", label: "Presentation",         color: "border-orange-200 bg-orange-50 text-orange-700" },
  Certificate: { icon: "🏆", label: "Certificate Template", color: "border-amber-200 bg-amber-50 text-amber-700" },
  Quiz:        { icon: "📝", label: "Quiz",                 color: "border-primary/20 bg-primary/5 text-primary" },
};

// ── Content item renderer ─────────────────────────────────────────────────────
const ContentItem = ({ item, index }) => {
  const [videoError, setVideoError] = useState(false);
  const meta = TYPE_META[item.type] || TYPE_META.Document;

  return (
    <div className="glass-card overflow-hidden">
      {/* Item header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-black/5">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black/5 text-[11px] font-bold text-muted grid place-items-center">
          {index + 1}
        </span>
        <span className={`rounded-xl border px-2.5 py-1 text-sm flex-shrink-0 ${meta.color}`}>
          {meta.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-dark truncate">{item.name}</p>
          <p className="text-[11px] text-muted">
            {meta.label}
            {item.bytes ? ` · ${formatBytes(item.bytes)}` : ""}
            {item.duration ? ` · ${Math.round(item.duration)}s` : ""}
            {item.format ? ` · .${item.format}` : ""}
          </p>
        </div>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="btn-soft flex-shrink-0 px-3 py-1.5 text-xs"
          >
            Open ↗
          </a>
        )}
      </div>

      {/* Content preview */}
      <div className="p-5">
        {/* ── Video ── */}
        {item.type === "Video" && item.url && !videoError && (
          <video
            src={item.url}
            controls
            controlsList="nodownload"
            className="w-full max-h-96 rounded-xl bg-black"
            onError={() => setVideoError(true)}
          />
        )}
        {item.type === "Video" && (videoError || !item.url) && (
          <div className="rounded-xl border-2 border-dashed border-violet-200 bg-violet-50 py-8 text-center">
            <p className="text-2xl mb-2">🎬</p>
            <p className="text-sm font-semibold text-violet-700">Video file</p>
            {item.url ? (
              <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
                Open in new tab ↗
              </a>
            ) : (
              <p className="mt-1 text-xs text-muted">No URL available</p>
            )}
          </div>
        )}

        {/* ── Document / PDF ── */}
        {item.type === "Document" && item.url && (
          <div className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 py-8 text-center">
            <p className="text-3xl mb-3">📄</p>
            <p className="text-sm font-semibold text-blue-700 mb-1">{item.name}</p>
            <p className="text-xs text-muted mb-4">Click below to open or download this document.</p>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              View Document ↗
            </a>
          </div>
        )}

        {/* ── PowerPoint ── */}
        {item.type === "PowerPoint" && item.url && (
          <div className="rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 py-8 text-center">
            <p className="text-3xl mb-3">📊</p>
            <p className="text-sm font-semibold text-orange-700 mb-1">{item.name}</p>
            <p className="text-xs text-muted mb-4">Click below to view this presentation.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(item.url)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition"
              >
                View in Browser ↗
              </a>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-orange-300 bg-white px-5 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50 transition"
              >
                Download ↓
              </a>
            </div>
          </div>
        )}

        {/* ── Certificate ── */}
        {item.type === "Certificate" && item.url && (
          <div className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 py-8 text-center">
            <p className="text-3xl mb-3">🏆</p>
            <p className="text-sm font-semibold text-amber-700 mb-1">{item.name}</p>
            <p className="text-xs text-muted mb-4">Certificate template file.</p>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition"
            >
              View Certificate ↗
            </a>
          </div>
        )}

        {/* ── Quiz ── */}
        {item.type === "Quiz" && (
          <div className="rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 py-8 text-center">
            <p className="text-3xl mb-3">📝</p>
            <p className="text-sm font-semibold text-primary mb-1">{item.name}</p>
            <p className="text-xs text-muted">This is a quiz item. Questions are managed separately inside the course.</p>
          </div>
        )}

        {/* Fallback — no URL */}
        {!item.url && item.type !== "Quiz" && (
          <div className="rounded-xl border-2 border-dashed border-black/10 py-6 text-center">
            <p className="text-sm text-muted">No file URL available for this item.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const ReviewerContentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCourseById(id)
      .then((data) => {
        if (!cancelled) {
          setCourse(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load course content.");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  const backTo = `/reviewer/queue/${id}`;
  const items  = course?.content?.items || [];

  return (
    <PageShell>
      <div className="space-y-6">

        {/* Header */}
        <div className="glass-card p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={() => navigate(backTo)}
                className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-text-dark transition"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Review
              </button>
              <span className="text-muted text-xs">/</span>
              <span className="text-xs text-text-dark font-medium truncate max-w-xs">
                {loading ? "Loading…" : (course?.title || "Course Content")}
              </span>
            </div>
            <h1 className="text-lg font-semibold text-text-dark">Course Content</h1>
            {course && (
              <p className="mt-1 text-xs text-muted">
                Reviewing: <span className="font-medium text-text-dark">{course.title}</span>
                {course.category ? ` · ${course.category}` : ""}
              </p>
            )}
          </div>
          {!loading && (
            <span className="self-start rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary sm:self-auto">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-black/8" />
                  <div className="h-8 w-8 rounded-xl bg-black/8" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-2/5 rounded-full bg-black/8" />
                    <div className="h-3 w-1/4 rounded-full bg-black/5" />
                  </div>
                </div>
                <div className="mt-4 h-40 rounded-xl bg-black/5" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="glass-card px-6 py-10 text-center">
            <p className="text-2xl mb-3">⚠️</p>
            <p className="text-sm font-semibold text-rose-600">{error}</p>
            <button
              type="button"
              onClick={() => navigate("/reviewer/queue")}
              className="btn-soft mt-4 px-5 py-2 text-xs"
            >
              ← Back to Queue
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="glass-card px-6 py-12 text-center">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-sm font-semibold text-text-dark">No content uploaded</p>
            <p className="mt-1 text-xs text-muted">
              The educator hasn't added any content items to this course yet.
            </p>
            <button
              type="button"
              onClick={() => navigate(backTo)}
              className="btn-soft mt-4 px-5 py-2 text-xs"
            >
              ← Back to Review
            </button>
          </div>
        )}

        {/* Content list */}
        {!loading && !error && items.length > 0 && (
          <div className="space-y-4">
            {items.map((item, i) => (
              <ContentItem key={item.id || i} item={item} index={i} />
            ))}
          </div>
        )}

        {/* Footer back button */}
        {!loading && !error && items.length > 0 && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(backTo)}
              className="btn-primary px-7 py-2 text-sm"
            >
              ← Back to Review
            </button>
          </div>
        )}

      </div>
    </PageShell>
  );
};

export default ReviewerContentView;

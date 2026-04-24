import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import { uploadContentFile, deleteContentFile } from "../../api/uploadApi.js";

// ── Content type definitions ─────────────────────────────────────────────────
const CONTENT_TYPES = [
  {
    value: "Video",
    label: "Video Lesson",
    icon: "🎬",
    accept: "video/mp4,video/webm,video/quicktime",
    hint: "MP4, WebM or MOV · max 500 MB",
    color: "border-violet-200 bg-violet-50 text-violet-700",
    activeColor: "border-violet-400 bg-violet-100 text-violet-800 ring-2 ring-violet-200",
  },
  {
    value: "Document",
    label: "Document / PDF",
    icon: "📄",
    accept: "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    hint: "PDF or Word document · max 500 MB",
    color: "border-blue-200 bg-blue-50 text-blue-700",
    activeColor: "border-blue-400 bg-blue-100 text-blue-800 ring-2 ring-blue-200",
  },
  {
    value: "PowerPoint",
    label: "Presentation",
    icon: "📊",
    accept: "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
    hint: "PPT or PPTX · max 500 MB",
    color: "border-orange-200 bg-orange-50 text-orange-700",
    activeColor: "border-orange-400 bg-orange-100 text-orange-800 ring-2 ring-orange-200",
  },
  {
    value: "Certificate",
    label: "Certificate Template",
    icon: "🏆",
    accept: "application/pdf,image/png,image/jpeg",
    hint: "PDF or image · max 500 MB",
    color: "border-amber-200 bg-amber-50 text-amber-700",
    activeColor: "border-amber-400 bg-amber-100 text-amber-800 ring-2 ring-amber-200",
  },
  {
    value: "Quiz",
    label: "Quiz",
    icon: "📝",
    accept: null, // no file — quiz questions added inline
    hint: "No file needed — add questions below",
    color: "border-primary/20 bg-primary/5 text-primary",
    activeColor: "border-primary bg-primary/10 text-primary ring-2 ring-primary/20",
  },
];

const formatBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const typeInfo = (type) => CONTENT_TYPES.find((t) => t.value === type) || CONTENT_TYPES[0];

// ── Item row ─────────────────────────────────────────────────────────────────
const ContentRow = ({ item, index, total, onMoveUp, onMoveDown, onDelete, deleting }) => {
  const { icon, color } = typeInfo(item.type);
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/80 border border-black/5 px-4 py-3 shadow-sm">
      {/* Order controls */}
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="grid h-5 w-5 place-items-center rounded text-muted hover:text-text-dark disabled:opacity-20 transition"
          title="Move up"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="grid h-5 w-5 place-items-center rounded text-muted hover:text-text-dark disabled:opacity-20 transition"
          title="Move down"
        >
          ▼
        </button>
      </div>

      {/* Index */}
      <span className="w-5 shrink-0 text-center text-[11px] font-semibold text-muted">{index + 1}</span>

      {/* Type icon */}
      <span className={`rounded-xl border px-2.5 py-1.5 text-sm ${color}`}>{icon}</span>

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-dark truncate">{item.name}</p>
        <p className="text-[11px] text-muted">
          {item.type}
          {item.bytes ? ` · ${formatBytes(item.bytes)}` : ""}
          {item.duration ? ` · ${Math.round(item.duration)}s` : ""}
          {item.url ? (
            <a href={item.url} target="_blank" rel="noreferrer" className="ml-2 text-primary hover:underline">
              View ↗
            </a>
          ) : null}
        </p>
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-rose-200 bg-white text-rose-400 hover:bg-rose-50 transition disabled:opacity-50"
        title="Remove"
      >
        {deleting ? "…" : "×"}
      </button>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const EducatorAddContent = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const backTo = location.state?.backTo || "/educator/publish";

  const storageKey = useMemo(() => {
    const email = currentUser?.email || "unknown";
    return `edupath_publish_content_${email}`;
  }, [currentUser?.email]);

  // ── Existing content list from localStorage ──────────────────────────────
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  const saveItems = (updated) => {
    setItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // ── Form state ────────────────────────────────────────────────────────────
  const [selectedType, setSelectedType] = useState("");
  const [itemName,     setItemName]     = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [error,        setError]        = useState("");
  const [deletingId,   setDeletingId]   = useState("");

  const currentTypeDef = CONTENT_TYPES.find((t) => t.value === selectedType) || null;
  const needsFile = selectedType && selectedType !== "Quiz";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file && !itemName) setItemName(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleAdd = async () => {
    setError("");

    if (!selectedType) { setError("Please select a content type."); return; }
    if (!itemName.trim()) { setError("Please enter a name for this item."); return; }
    if (needsFile && !selectedFile) { setError("Please select a file to upload."); return; }

    // Quiz — no upload needed
    if (selectedType === "Quiz") {
      const newItem = {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        type: "Quiz",
        name: itemName.trim(),
        url: null,
        publicId: null,
        resourceType: null,
      };
      saveItems([...items, newItem]);
      setItemName("");
      setSelectedType("");
      return;
    }

    // File upload
    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadContentFile(
        selectedFile,
        selectedType,
        itemName.trim(),
        (pct) => setProgress(pct)
      );

      if (!result.success) throw new Error(result.message || "Upload failed.");

      saveItems([...items, result.item]);
      setItemName("");
      setSelectedType("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (item) => {
    setDeletingId(item.id);
    try {
      if (item.publicId) {
        await deleteContentFile(item.publicId, item.resourceType || "raw");
      }
    } catch {
      // Don't block UI if Cloudinary delete fails
    }
    saveItems(items.filter((i) => i.id !== item.id));
    setDeletingId("");
  };

  const moveItem = (index, dir) => {
    const updated = [...items];
    const target = index + dir;
    if (target < 0 || target >= updated.length) return;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    saveItems(updated);
  };

  return (
    <PageShell>
      <div className="space-y-6">

        {/* Header */}
        <div className="glass-card p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text-dark">Course Content</h1>
            <p className="mt-1 text-xs text-muted">
              Add videos, documents, presentations, certificates and quizzes. Files are stored on Cloudinary.
            </p>
          </div>
          <span className="self-start rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary sm:self-auto">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Add content form */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="font-semibold text-text-dark">Add New Item</h2>

          {/* Type selector */}
          <div>
            <p className="field-label">Content Type</p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {CONTENT_TYPES.map((t) => {
                const isSelected = selectedType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setSelectedType(t.value);
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                      setError("");
                    }}
                    className={`rounded-2xl border-2 px-3 py-3 text-center transition ${
                      isSelected ? t.activeColor : "border-black/10 bg-white/60 hover:border-black/20"
                    }`}
                  >
                    <div className="text-2xl">{t.icon}</div>
                    <div className="mt-1 text-[11px] font-semibold leading-tight">{t.label}</div>
                  </button>
                );
              })}
            </div>
            {currentTypeDef && (
              <p className="mt-2 text-[11px] text-muted">{currentTypeDef.hint}</p>
            )}
          </div>

          {/* Item name */}
          <div>
            <label className="field-label">Item Name</label>
            <input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Introduction to Variables"
              className="field-input mt-1"
            />
          </div>

          {/* File picker (hidden for Quiz) */}
          {needsFile && currentTypeDef && (
            <div>
              <label className="field-label">Select File</label>
              <div
                className="mt-1 rounded-2xl border-2 border-dashed border-black/10 bg-white/60 px-5 py-6 text-center hover:border-primary/40 hover:bg-primary/5 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-semibold text-text-dark">{selectedFile.name}</p>
                    <p className="mt-1 text-xs text-muted">{formatBytes(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl mb-2">📂</p>
                    <p className="text-sm font-medium text-muted">Click to choose a file</p>
                    <p className="mt-1 text-[11px] text-muted">{currentTypeDef.hint}</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={currentTypeDef.accept}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Uploading to Cloudinary…</span>
                <span className="font-semibold text-primary">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-black/8">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(backTo)}
              className="btn-outline px-6 py-2 text-sm"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={uploading || !selectedType}
              className="btn-primary px-7 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading…" : "Add Item"}
            </button>
          </div>
        </div>

        {/* Content list */}
        {items.length > 0 && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-dark">Course Content ({items.length})</h2>
              <p className="text-[11px] text-muted">Drag ▲▼ to reorder</p>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <ContentRow
                  key={item.id}
                  item={item}
                  index={i}
                  total={items.length}
                  onMoveUp={() => moveItem(i, -1)}
                  onMoveDown={() => moveItem(i, 1)}
                  onDelete={() => handleDelete(item)}
                  deleting={deletingId === item.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="glass-card px-6 py-12 text-center">
            <p className="text-2xl mb-3">📭</p>
            <p className="text-sm font-semibold text-text-dark">No content yet</p>
            <p className="mt-1 text-xs text-muted">Add your first video, document, or quiz above.</p>
          </div>
        )}

        {/* Done button */}
        {items.length > 0 && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(backTo)}
              className="btn-primary px-8 py-2 text-sm"
            >
              Done — Back to Course
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default EducatorAddContent;

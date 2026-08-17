import React, { useEffect, useRef, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import { getSpecializations } from "../../api/specializationApi.js";
import { deleteContentFile, uploadThumbnailFile } from "../../api/uploadApi.js";

// Removes a content item and saves the updated list
const removeContentItem = (items, id, storageKey) => {
  const updated = items.filter((i) => i.id !== id);
  try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch { /* ignore */ }
  return updated;
};

const decimalPattern = /^\d+(?:\.\d+)?$/;

// Builds the new course publishing page
const EducatorPublish = () => {
  const { currentUser, createCourse } = useApp();
  const navigate = useNavigate();

  // Builds the storage key for content items
  const storageKey = useMemo(() => {
    const email = currentUser?.email || "unknown";
    return `edupath_publish_content_${email}`;
  }, [currentUser?.email]);

  // Builds the storage key for saved form data
  const formStorageKey = useMemo(() => {
    const email = currentUser?.email || "unknown";
    return `edupath_publish_form_${email}`;
  }, [currentUser?.email]);

  const [contentItems, setContentItems] = useState([]);

  // Restores saved content items
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      setContentItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setContentItems([]);
    }
  }, [storageKey]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    duration: "",
    specializationTags: [],
    thumbnailFile: null,
    thumbnailUrl: "",
    thumbnailName: "",
    thumbnailPublicId: "",
    thumbnailResourceType: "image"
  });

  // Saves the current form to local storage
  const persistFormData = (nextForm = form) => {
    try {
      const toSave = {
        title: nextForm.title,
        description: nextForm.description,
        category: nextForm.category,
        level: nextForm.level,
        duration: nextForm.duration,
        specializationTags: nextForm.specializationTags,
        thumbnailUrl: nextForm.thumbnailFile ? "" : nextForm.thumbnailUrl,
        thumbnailName: nextForm.thumbnailFile ? "" : (nextForm.thumbnailName || ""),
        thumbnailPublicId: nextForm.thumbnailPublicId || "",
        thumbnailResourceType: nextForm.thumbnailResourceType || "image"
      };
      localStorage.setItem(formStorageKey, JSON.stringify(toSave));
    } catch {
      // ignore storage errors
    }
  };

  // Restores saved form data when returning from Add Content
  useEffect(() => {
    try {
      const raw = localStorage.getItem(formStorageKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      setForm((prev) => ({
        ...prev,
        title: saved.title || "",
        description: saved.description || "",
        category: saved.category || "",
        level: saved.level || "",
        duration: saved.duration || "",
        specializationTags: Array.isArray(saved.specializationTags) ? saved.specializationTags : [],
        thumbnailUrl: saved.thumbnailUrl || "",
        thumbnailName: saved.thumbnailName || "",
        thumbnailPublicId: saved.thumbnailPublicId || "",
        thumbnailResourceType: saved.thumbnailResourceType || "image",
        thumbnailFile: null // File objects can't be serialised; user re-selects only if they want to change it
      }));
    } catch {
      // ignore bad data
    }
  }, [formStorageKey]);

  // Saves form changes to local storage
  useEffect(() => {
    persistFormData(form);
  }, [form, formStorageKey]);

  const [specializations, setSpecializations] = useState([]);
  const [specializationsLoading, setSpecializationsLoading] = useState(true);
  const [tagSearch, setTagSearch] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Loads specialization options
  useEffect(() => {
    let alive = true;
    getSpecializations()
      .then((items) => {
        if (alive) setSpecializations(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (alive) setError("Unable to load course specializations. Please try again.");
      })
      .finally(() => {
        if (alive) setSpecializationsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const isVerified = currentUser?.status === "VERIFIED";
  const hasContent = contentItems.length > 0;

  // Validates duration field
  const validateNumericFields = (nextForm = form, { requireValues = false } = {}) => {
    const errors = {};
    const durationText = String(nextForm.duration || "").trim();

    if (requireValues && !durationText) {
      errors.duration = "Enter duration as a number of hours, e.g., 6 or 6.5.";
    } else if (durationText) {
      if (!decimalPattern.test(durationText)) {
        errors.duration = "Use numbers only, with an optional decimal point, e.g., 6 or 6.5.";
      } else if (Number(durationText) <= 0) {
        errors.duration = "Duration must be greater than 0.";
      }
    }

    return errors;
  };

  // Updates normal text fields
  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // Updates decimal fields and shows format errors
  const handleDecimalChange = (e) => {
    const { name, value } = e.target;
    const nextValue = String(value);

    if (!/^\d*\.?\d*$/.test(nextValue)) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: name === "price"
          ? "Use numbers only, with an optional decimal point, e.g., 1200 or 1200.50."
          : "Use numbers only, with an optional decimal point, e.g., 6 or 6.5."
      }));
      return;
    }

    setForm((prev) => {
      const nextForm = { ...prev, [name]: nextValue };
      const nextErrors = validateNumericFields(nextForm);
      setFieldErrors((errors) => {
        const updated = { ...errors };
        if (nextErrors[name]) updated[name] = nextErrors[name];
        else delete updated[name];
        return updated;
      });
      return nextForm;
    });
  };

  // Stores the selected thumbnail file
  const handleThumbnail = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setForm((p) => ({ ...p, thumbnailFile: file, thumbnailName: file.name, thumbnailUrl: previewUrl }));
  };

  // Adds or removes a specialization tag
  const toggleTag = (tag) => {
    setForm((p) => {
      const exists = p.specializationTags.includes(tag);
      return {
        ...p,
        specializationTags: exists
          ? p.specializationTags.filter((t) => t !== tag)
          : [...p.specializationTags, tag]
      };
    });
  };

  // Filters specialization tags by search text
  const filteredTags = useMemo(() => {
    const tags = specializations.map((item) => item.slug || item.name).filter(Boolean);
    const q = tagSearch.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((tag) => tag.toLowerCase().includes(q));
  }, [specializations, tagSearch]);

  // Checks if the publish form is complete
  const isFormComplete = useMemo(() => {
    return Boolean(
      form.title.trim() &&
      form.description.trim() &&
      form.category.trim() &&
      form.level.trim() &&
      String(form.duration).trim() &&
      (form.thumbnailFile || form.thumbnailUrl)
    );
  }, [form]);

  // Checks current numeric field errors
  const numericErrors = useMemo(() => validateNumericFields(form), [form]);
  // Checks if any numeric errors exist
  const hasNumericErrors = Object.keys(numericErrors).length > 0;

  // Checks if the course can be published
  const canPublish = isVerified && isFormComplete && hasContent && !hasNumericErrors;

  // Checks if the course can be saved as a draft
  const canDraft = isVerified && form.title.trim().length > 0 && !hasNumericErrors;

  // Finds the selected specialization
  const selectedSpecialization = useMemo(() => {
    return specializations.find((item) => item.name === form.category);
  }, [specializations, form.category]);

  // Builds the course data sent to the API
  const buildCoursePayload = (status) => ({
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category.trim(),
    level: form.level.trim(),
    price: 0, // No course fee; educators earn $1 per enrolled student
    duration: Number(form.duration) || 0,
    specializationTag: selectedSpecialization?.slug || form.category.trim(),
    thumbnailName: form.thumbnailFile?.name || form.thumbnailName || "",
    thumbnailUrl: form.thumbnailUrl || "",
    thumbnailPublicId: form.thumbnailPublicId || "",
    thumbnailResourceType: form.thumbnailResourceType || "image",
    rating: 0,
    educatorName: currentUser?.name || "Educator",
    createdByEducatorEmail: currentUser?.email,
    status,
    content: {
      modules: [],
      items: contentItems
    }
  });

  // Uploads the thumbnail before saving if needed
  const ensureUploadedThumbnail = async () => {
    if (!form.thumbnailFile) {
      return {
        thumbnailUrl: form.thumbnailUrl || "",
        thumbnailName: form.thumbnailName || "",
        thumbnailPublicId: form.thumbnailPublicId || "",
        thumbnailResourceType: form.thumbnailResourceType || "image"
      };
    }

    const uploaded = await uploadThumbnailFile(form.thumbnailFile);
    setForm((prev) => ({
      ...prev,
      thumbnailFile: null,
      thumbnailName: uploaded.thumbnail.name,
      thumbnailUrl: uploaded.thumbnail.url,
      thumbnailPublicId: uploaded.thumbnail.publicId,
      thumbnailResourceType: uploaded.thumbnail.resourceType
    }));
    return {
      thumbnailUrl: uploaded.thumbnail.url,
      thumbnailName: uploaded.thumbnail.name,
      thumbnailPublicId: uploaded.thumbnail.publicId,
      thumbnailResourceType: uploaded.thumbnail.resourceType
    };
  };

  // Goes to the add content page
  const goAddContent = () => {
    persistFormData(form);
    navigate("/educator/add-content/new", { state: { backTo: "/educator/publish" } });
  };

  // Warns before closing the tab with unsaved data
  const formIsDirty = form.title.trim().length > 0 || contentItems.length > 0;
  const formIsDirtyRef = useRef(formIsDirty);
  useEffect(() => { formIsDirtyRef.current = formIsDirty; }, [formIsDirty]);
  useEffect(() => {
    const handler = (e) => {
      if (!formIsDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Saves the course as a draft
  const handleSaveDraft = async (e) => {
    e?.preventDefault?.();
    if (submitting) return;
    setError("");
    if (!isVerified) {
      setError("Your educator profile must be verified before saving a draft.");
      return;
    }
    if (!form.title.trim()) {
      setError("Please enter at least a course title to save a draft.");
      return;
    }
    const errors = validateNumericFields(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Please fix the highlighted course setup fields before saving a draft.");
      return;
    }
    setSubmitting(true);
    try {
      const thumbnail = await ensureUploadedThumbnail();
      const res = await createCourse({ ...buildCoursePayload("draft"), ...thumbnail });
      if (!res.success) {
        setError(res.message || "Failed to save draft.");
        return;
      }
      localStorage.removeItem(storageKey);
      localStorage.removeItem(formStorageKey);
      navigate("/educator/courses");
    } finally {
      setSubmitting(false);
    }
  };

  // Publishes the course for review
  const handlePublish = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    if (!isVerified) {
      setError("Your educator profile must be verified before publishing.");
      return;
    }
    if (!isFormComplete) {
      setError("Please fill all fields, including category and thumbnail, before publishing.");
      return;
    }
    const errors = validateNumericFields(form, { requireValues: true });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Please fix the highlighted course setup fields before publishing.");
      return;
    }
    if (!hasContent) {
      setError("Please add at least one course content item before publishing.");
      return;
    }
    setSubmitting(true);
    try {
      const thumbnail = await ensureUploadedThumbnail();
      const res = await createCourse({ ...buildCoursePayload("pending"), ...thumbnail });
      if (!res.success) {
        setError(res.message || "Failed to publish course.");
        return;
      }
      localStorage.removeItem(storageKey);
      localStorage.removeItem(formStorageKey);
      navigate("/educator/courses");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      {/* Holds the publish course sections */}
      <div className="space-y-6">
        {/* Header */}
        {/* Shows the publish page title and alerts */}
        <div className="glass-card p-6">
          <h1 className="text-xl font-semibold text-text-dark">Publish New Course</h1>
          <p className="mt-1 text-xs text-muted">
            Create a course, add your content (video, files, quizzes), and publish when ready.
          </p>
          {!isVerified && (
            <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs text-yellow-800">
              Publishing is disabled until an admin verifies your educator profile.
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-xs text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Holds course details and setup fields */}
        <form onSubmit={handlePublish} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* LEFT: Course Details */}
          {/* Collects the main course information */}
          <div className="rounded-3xl bg-white/80 border border-black/5 shadow-lg p-6">
            <h2 className="text-base font-semibold text-text-dark">Course Details</h2>
            <p className="mt-1 text-xs text-muted">Basic course information visible to students.</p>

            <div className="mt-5 space-y-4 text-xs">
              {/* Lets the educator enter the course title */}
              <div>
                <label className="font-semibold text-text-dark">Course Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  disabled={!isVerified}
                  placeholder="Eg: Python for beginners"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              {/* Lets the educator write the course description */}
              <div>
                <label className="font-semibold text-text-dark">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  disabled={!isVerified}
                  placeholder="Write a clear description: what students will learn, outcomes, prerequisites..."
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              {/* Course Content */}
              {/* Shows added content and the add content button */}
              <div>
                {/* Holds the content section heading and add button */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-text-dark">Course Content</p>
                    <p className="text-[11px] text-muted">Add lessons, resources, and quizzes.</p>
                  </div>
                  <button
                    type="button"
                    disabled={!isVerified}
                    onClick={goAddContent}
                    className="btn-primary px-5 py-2 text-[11px] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    + Add course content
                  </button>
                </div>

                {contentItems.length === 0 ? (
                  /* Shows when no content has been added */
                  <div className="mt-3 rounded-2xl border border-black/10 bg-white/70 px-4 py-4 text-[11px] text-muted text-center">
                    No content added yet. Click Add Course Content to begin.
                  </div>
                ) : (
                  /* Lists the added course content */
                  <div className="mt-3 rounded-2xl border border-black/10 bg-white/70 px-4 py-3">
                    <ul className="space-y-2">
                      {contentItems.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-2 rounded-xl bg-white/80 border border-black/5 px-3 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-semibold text-text-dark truncate">{item.name}</p>
                            <p className="text-[11px] text-muted">{item.type}</p>
                          </div>
                          <button
                            type="button"
                            title="Remove item"
                            onClick={() => {
                              // Delete the file from Cloudinary if it has a publicId
                              if (item.publicId) {
                                deleteContentFile(item.publicId, item.resourceType || "raw").catch(() => {});
                              }
                              setContentItems((prev) =>
                                removeContentItem(prev, item.id, storageKey)
                              );
                            }}
                            className="shrink-0 grid h-6 w-6 place-items-center rounded-full border border-rose-200 bg-white text-rose-400 hover:bg-rose-50 transition text-sm"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Course Setup */}
          {/* Collects course settings */}
          <div className="rounded-3xl bg-white/80 border border-black/5 shadow-lg p-6">
            <h2 className="text-base font-semibold text-text-dark">Course Setup</h2>
            <p className="mt-1 text-xs text-muted">Quick settings for your course.</p>

            <div className="mt-5 space-y-4 text-xs">
              {/* Category */}
              {/* Lets the educator choose a category */}
              <div>
                <label className="font-semibold text-text-dark">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  disabled={!isVerified || specializationsLoading}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="" disabled>
                    {specializationsLoading ? "Loading categories..." : "Select Category"}
                  </option>
                  {specializations.map((specialization) => (
                    <option key={specialization._id || specialization.slug} value={specialization.name}>
                      {specialization.name}
                    </option>
                  ))}
                </select>
                {!specializationsLoading && specializations.length === 0 && (
                  <p className="mt-1 text-[11px] text-rose-500">
                    No specializations found. Add them in the database first.
                  </p>
                )}
              </div>

              {/* Difficulty */}
              {/* Lets the educator choose difficulty */}
              <div>
                <label className="font-semibold text-text-dark">Difficulty</label>
                <select
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  disabled={!isVerified}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="" disabled>Select Difficulty</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Course Access & Educator Earnings Model */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs mb-1">
                  <span>💰 Zero Course Fee • $1.00 USD / Enrolled Student</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  EduPath courses are free to enroll for students. You earn <strong>$1.00 USD</strong> for every real student who enrolls. Monthly withdrawals open during the <strong>first week of every month (Days 1–7)</strong>.
                </p>
              </div>

              {/* Duration */}
              {/* Lets the educator enter the duration */}
              <div>
                <label className="font-semibold text-text-dark">Estimated Duration</label>
                <input
                  name="duration"
                  value={form.duration}
                  onChange={handleDecimalChange}
                  disabled={!isVerified}
                  inputMode="decimal"
                  placeholder="Eg: 6 or 6.5"
                  className={`mt-2 w-full rounded-2xl border bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100 ${
                    fieldErrors.duration ? "border-rose-300 ring-rose-200" : "border-black/10"
                  }`}
                />
                {fieldErrors.duration ? (
                  <p className="mt-1 text-[11px] font-medium text-rose-500">{fieldErrors.duration}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-muted">Enter hours as a number, e.g., 6 or 6.5. Must be greater than 0.</p>
                )}
              </div>

              {/* Thumbnail */}
              {/* Lets the educator upload a thumbnail */}
              <div>
                <label className="font-semibold text-text-dark">Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnail}
                  disabled={!isVerified}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-[11px] outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                />
                {(form.thumbnailFile?.name || form.thumbnailName) && (
                  <p className="mt-1 text-[11px] text-muted">Selected: {form.thumbnailFile?.name || form.thumbnailName}</p>
                )}
              </div>

              {/* Specialization Tags - searchable multi-select */}
              {/* Lets the educator select related specialization tags */}
              <div>
                <label className="font-semibold text-text-dark">Related Specialization Tags</label>
                <p className="mt-1 text-[11px] text-muted">Optional tags loaded from the specialization database.</p>

                {/* Search input */}
                {/* Filters available tags */}
                <input
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  disabled={!isVerified}
                  placeholder="Type to filter tags... e.g. web"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                {/* Selected tags shown as removable chips */}
                {/* Shows selected tags as chips */}
                {form.specializationTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {form.specializationTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-primary text-white px-3 py-1 text-[11px] font-semibold"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => toggleTag(tag)}
                          disabled={!isVerified}
                          className="ml-0.5 hover:opacity-70"
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Filtered tag options */}
                {/* Shows matching tag options */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {filteredTags.length === 0 ? (
                    <p className="text-[11px] text-muted">No tags match your search.</p>
                  ) : (
                    filteredTags.map((tag) => {
                      const selected = form.specializationTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          disabled={!isVerified}
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            selected
                              ? "bg-primary/10 text-primary border-primary/40"
                              : "bg-white border-black/10 text-text-dark hover:border-primary/50 hover:text-primary"
                          }`}
                        >
                          #{tag}
                        </button>
                      );
                    })
                  )}
                </div>

                {form.specializationTags.length === 0 && (
                  <p className="mt-1 text-[11px] text-muted">No optional tags selected.</p>
                )}
              </div>

              {/* Buttons */}
              {/* Holds discard, draft and publish buttons */}
              <div className="pt-1 flex gap-3 justify-end flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (form.thumbnailPublicId) {
                      deleteContentFile(form.thumbnailPublicId, form.thumbnailResourceType || "image").catch(() => {});
                    }
                    localStorage.removeItem(storageKey);
                    localStorage.removeItem(formStorageKey);
                    navigate("/educator/courses");
                  }}
                  className="rounded-full border border-red-300 bg-white px-7 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
                >
                  Discard
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={!canDraft || submitting}
                  className="btn-soft px-7 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save Draft"}
                </button>

                <button
                  type="submit"
                  disabled={!canPublish || submitting}
                  className="btn-primary px-8 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Publishing..." : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </PageShell>
  );
};

export default EducatorPublish;

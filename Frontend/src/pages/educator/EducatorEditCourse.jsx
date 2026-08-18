import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import * as courseApi from "../../api/courseApi.js";
import { deleteContentFile, uploadThumbnailFile } from "../../api/uploadApi.js";

const ALL_TAGS = [
  "web-dev", "data-science", "ai-ml", "cyber-security",
  "mobile-dev", "ui-ux", "commerce", "business",
  "accounting", "marketing", "art-design", "photography",
  "music", "science", "mathematics", "language",
  "health", "engineering", "law", "other"
];

// Builds the course edit page
const EducatorEditCourse = () => {
  const { id } = useParams();
  const { courses, currentUser, fetchMyCourses } = useApp();
  const navigate = useNavigate();

  const course = courses.find((c) => c.id === id || c._id === id);

  // Checks if this educator owns the course
  const isOwner = !course || course.createdByEducatorEmail === currentUser?.email;

  // Fills the form with existing course data
  const [form, setForm] = useState(() => {
    if (!course) return {
      title: "", description: "", category: "", level: "",
      price: "", duration: "", specializationTags: [],
      thumbnailFile: null, thumbnailUrl: "", thumbnailName: "",
      thumbnailPublicId: "", thumbnailResourceType: "image"
    };

    // Splits saved specialization tags
    const existingTags = course.specializationTag
      ? course.specializationTag.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    return {
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      level: course.level || "",
      price: String(course.price || ""),
      duration: String(course.duration || ""),
      specializationTags: existingTags,
      thumbnailFile: null,
      thumbnailUrl: course.thumbnailUrl || "",
      thumbnailName: course.thumbnailName || "",
      thumbnailPublicId: course.thumbnailPublicId || "",
      thumbnailResourceType: course.thumbnailResourceType || "image"
    };
  });

  // Loads edited content from local storage first
  const contentStorageKey = `edupath_content_${id}`;
  const [contentItems, setContentItems] = useState(() => {
    try {
      const raw = localStorage.getItem(contentStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return course?.content?.items || [];
  });

  // Removes a content item from the edit page
  const removeContentItem = (itemId) => {
    const updated = contentItems.filter((i) => i.id !== itemId);
    setContentItems(updated);
    try { localStorage.setItem(contentStorageKey, JSON.stringify(updated)); } catch { /* ignore */ }
  };

  const [tagSearch, setTagSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isVerified = currentUser?.status === "VERIFIED";

  // Updates normal text fields
  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // Keeps number fields as digits only
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: String(value).replace(/[^\d]/g, "") }));
  };

  // Stores the selected thumbnail file
  const handleThumbnail = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setForm((p) => ({
      ...p,
      thumbnailFile: file,
      thumbnailName: file.name,
      thumbnailUrl: previewUrl
    }));
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

  // Filters tags by search text
  const filteredTags = useMemo(() => {
    const q = tagSearch.trim().toLowerCase();
    if (!q) return ALL_TAGS;
    return ALL_TAGS.filter((t) => t.includes(q));
  }, [tagSearch]);

  // Checks if the edit form is complete
  const isFormComplete = useMemo(() => {
    return Boolean(
      form.title.trim() &&
      form.description.trim() &&
      form.category.trim() &&
      form.level.trim() &&
      String(form.price).trim() &&
      String(form.duration).trim() &&
      form.specializationTags.length > 0 &&
      (form.thumbnailFile || form.thumbnailUrl)
    );
  }, [form]);

  const hasContent = contentItems.length > 0;
  const canPublish = isVerified && isFormComplete && hasContent;
  const canDraft = isVerified && form.title.trim().length > 0;

  // Builds the course data sent to the API
  const buildPayload = (status) => ({
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category.trim(),
    level: form.level.trim(),
    price: Number(form.price) || 0,
    duration: Number(form.duration) || 0,
    specializationTag: form.specializationTags.join(","),
    thumbnailName: form.thumbnailFile?.name || course?.thumbnailName || "",
    thumbnailUrl: form.thumbnailUrl || "",
    thumbnailPublicId: form.thumbnailPublicId || "",
    thumbnailResourceType: form.thumbnailResourceType || "image",
    rating: course?.rating || 0,
    educatorName: currentUser?.name || "Educator",
    createdByEducatorEmail: currentUser?.email,
    status,
    content: { modules: [], items: contentItems }
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

    const previousPublicId = form.thumbnailPublicId || "";
    const previousResourceType = form.thumbnailResourceType || "image";
    const uploaded = await uploadThumbnailFile(form.thumbnailFile);
    setForm((prev) => ({
      ...prev,
      thumbnailFile: null,
      thumbnailName: uploaded.thumbnail.name,
      thumbnailUrl: uploaded.thumbnail.url,
      thumbnailPublicId: uploaded.thumbnail.publicId,
      thumbnailResourceType: uploaded.thumbnail.resourceType
    }));

    if (previousPublicId && previousPublicId !== uploaded.thumbnail.publicId) {
      deleteContentFile(previousPublicId, previousResourceType).catch(() => {});
    }

    return {
      thumbnailUrl: uploaded.thumbnail.url,
      thumbnailName: uploaded.thumbnail.name,
      thumbnailPublicId: uploaded.thumbnail.publicId,
      thumbnailResourceType: uploaded.thumbnail.resourceType
    };
  };

  // Saves edits as a draft
  const handleSaveDraft = async () => {
    setError("");
    if (!form.title.trim()) {
      setError("Please enter at least a course title.");
      return;
    }
    setSaving(true);
    try {
      const thumbnail = await ensureUploadedThumbnail();
      await courseApi.updateCourseData(id, { ...buildPayload("draft"), ...thumbnail });
      try { localStorage.removeItem(contentStorageKey); } catch { /* ignore */ }
      await fetchMyCourses();
      navigate("/educator/courses");
    } catch (err) {
      setError(err.message || "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  // Publishes edits for review
  const handlePublish = async (e) => {
    e.preventDefault();
    setError("");
    if (!isVerified) { setError("Your profile must be verified before publishing."); return; }
    if (!isFormComplete) { setError("Please fill all fields before publishing."); return; }
    if (!hasContent) { setError("Please add at least one content item."); return; }
    setSaving(true);
    try {
      const thumbnail = await ensureUploadedThumbnail();
      await courseApi.updateCourseData(id, { ...buildPayload("pending"), ...thumbnail });
      try { localStorage.removeItem(contentStorageKey); } catch { /* ignore */ }
      await fetchMyCourses();
      navigate("/educator/courses");
    } catch (err) {
      setError(err.message || "Failed to publish.");
    } finally {
      setSaving(false);
    }
  };

  if (!course) {
    return (
      <PageShell>
        {/* Shows when the course cannot be found */}
        <p className="text-sm text-muted">Course not found.</p>
      </PageShell>
    );
  }

  if (!isOwner) {
    return (
      <PageShell>
        {/* Shows when another educator tries to edit this course */}
        <div className="glass-card px-6 py-10 text-center">
          <p className="text-sm font-semibold text-rose-600">You don't have permission to edit this course.</p>
          <button type="button" onClick={() => navigate("/educator/courses")}
            className="btn-soft mt-4 px-5 py-2 text-xs">← Back to courses</button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Holds the edit course sections */}
      <div className="space-y-6">
        {/* Header */}
        {/* Shows the edit page title and alerts */}
        <div className="glass-card p-6">
          <h1 className="text-xl font-semibold text-text-dark">Edit Draft</h1>
          <p className="mt-1 text-xs text-muted">
            Continue editing your draft. Save as draft or publish when ready.
          </p>
          {!isVerified && (
            <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs text-yellow-800">
              Publishing is disabled until an admin verifies your educator profile.
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-xs text-red-600">{error}</div>
          )}
        </div>

        {/* Holds course details and setup fields */}
        <form onSubmit={handlePublish} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* LEFT */}
          {/* Collects the main course information */}
          <div className="rounded-3xl bg-white/80 border border-black/5 shadow-lg p-6">
            <h2 className="text-base font-semibold text-text-dark">Course Details</h2>
            <p className="mt-1 text-xs text-muted">Basic course information visible to students.</p>

            <div className="mt-5 space-y-4 text-xs">
              {/* Lets the educator edit the course title */}
              <div>
                <label className="font-semibold text-text-dark">Course Title</label>
                <input name="title" value={form.title} onChange={handleChange}
                  disabled={!isVerified} placeholder="Eg: Python for beginners"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100" />
              </div>

              {/* Lets the educator edit the description */}
              <div>
                <label className="font-semibold text-text-dark">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  rows={4} disabled={!isVerified}
                  placeholder="What students will learn, outcomes, prerequisites..."
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100" />
              </div>

              {/* Content items */}
              {/* Shows existing content and the add content button */}
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
                    onClick={() => navigate(`/educator/add-content/${id}`, { state: { backTo: `/educator/edit/${id}` } })}
                    className="btn-primary px-4 py-2 text-[11px] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    + Add Content
                  </button>
                </div>
                {contentItems.length === 0 ? (
                  /* Shows when no content has been added */
                  <div className="mt-3 rounded-2xl border border-black/10 bg-white/70 px-4 py-4 text-[11px] text-muted text-center">
                    No content added yet. Click Add Content to begin.
                  </div>
                ) : (
                  /* Lists current course content */
                  <div className="mt-3 rounded-2xl border border-black/10 bg-white/70 px-4 py-3">
                    <ul className="space-y-2">
                      {contentItems.map((item) => (
                        <li key={item.id}
                          className="flex items-center justify-between gap-2 rounded-xl bg-white/80 border border-black/5 px-3 py-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-semibold text-text-dark truncate">{item.name}</p>
                            <p className="text-[11px] text-muted">{item.type}</p>
                          </div>
                          <button
                            type="button"
                            title="Remove item"
                            onClick={() => {
                              if (item.publicId) {
                                deleteContentFile(item.publicId, item.resourceType || "raw").catch(() => {});
                              }
                              removeContentItem(item.id);
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

          {/* RIGHT */}
          {/* Collects course settings */}
          <div className="rounded-3xl bg-white/80 border border-black/5 shadow-lg p-6">
            <h2 className="text-base font-semibold text-text-dark">Course Setup</h2>
            <p className="mt-1 text-xs text-muted">Quick settings for your course.</p>

            <div className="mt-5 space-y-4 text-xs">
              {/* Category */}
              {/* Lets the educator edit the category */}
              <div>
                <label className="font-semibold text-text-dark">Category</label>
                <select name="category" value={form.category} onChange={handleChange}
                  disabled={!isVerified}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100">
                  <option value="" disabled>Select Category</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Business Management">Business Management</option>
                  <option value="Accounting & Finance">Accounting & Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Art & Design">Art & Design</option>
                  <option value="Photography & Video">Photography & Video</option>
                  <option value="Music">Music</option>
                  <option value="Science">Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Language & Communication">Language & Communication</option>
                  <option value="Health & Medicine">Health & Medicine</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Law">Law</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Difficulty */}
              {/* Lets the educator edit difficulty */}
              <div>
                <label className="font-semibold text-text-dark">Difficulty</label>
                <select name="level" value={form.level} onChange={handleChange}
                  disabled={!isVerified}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100">
                  <option value="" disabled>Select Difficulty</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Revenue Model Banner */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-[13px] font-semibold text-primary">
                  💰 Zero Course Fee • $1.00 USD / Enrolled Student
                </p>
                <p className="mt-1 text-[11px] text-primary/80 leading-relaxed">
                  EduPath courses are free to enroll for students. You earn <strong>$1.00 USD</strong> for every real student who enrolls. Monthly withdrawals open during the <strong>3rd week of every month (15th to 21st)</strong>.
                </p>
              </div>

              {/* Duration */}
              {/* Lets the educator edit the duration */}
              <div>
                <label className="font-semibold text-text-dark">Estimated Duration</label>
                <input name="duration" value={form.duration} onChange={handleNumberChange}
                  disabled={!isVerified} inputMode="numeric" placeholder="Eg: 12"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100" />
                <p className="mt-1 text-[11px] text-muted">Enter hours as a number.</p>
              </div>

              {/* Thumbnail */}
              {/* Lets the educator replace the thumbnail */}
              <div>
                <label className="font-semibold text-text-dark">Thumbnail</label>
                {form.thumbnailUrl && !form.thumbnailFile && (
                  <div className="mt-2 mb-2">
                    <img src={form.thumbnailUrl} alt="Current thumbnail"
                      className="h-20 w-32 rounded-xl object-cover border border-black/10" />
                    <p className="text-[11px] text-muted mt-1">Current thumbnail - upload a new one to replace it.</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleThumbnail}
                  disabled={!isVerified}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-[11px] outline-none disabled:cursor-not-allowed disabled:bg-gray-100" />
                {form.thumbnailFile?.name && (
                  <p className="mt-1 text-[11px] text-muted">Selected: {form.thumbnailFile.name}</p>
                )}
              </div>

              {/* Specialization Tags */}
              {/* Lets the educator edit specialization tags */}
              <div>
                <label className="font-semibold text-text-dark">Specialization Tags</label>
                <p className="mt-1 text-[11px] text-muted">Search and select one or more tags.</p>
                <input type="text" value={tagSearch} onChange={(e) => setTagSearch(e.target.value)}
                  disabled={!isVerified} placeholder="Type to filter tags... e.g. web"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100" />

                {form.specializationTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {form.specializationTags.map((tag) => (
                      <span key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-primary text-white px-3 py-1 text-[11px] font-semibold">
                        #{tag}
                        <button type="button" onClick={() => toggleTag(tag)}
                          disabled={!isVerified} className="ml-0.5 hover:opacity-70">x</button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-2 flex flex-wrap gap-2">
                  {filteredTags.map((tag) => {
                    const selected = form.specializationTags.includes(tag);
                    return (
                      <button key={tag} type="button" disabled={!isVerified}
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          selected
                            ? "bg-primary/10 text-primary border-primary/40"
                            : "bg-white border-black/10 text-text-dark hover:border-primary/50 hover:text-primary"
                        }`}>
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Buttons */}
              {/* Holds cancel, draft and publish buttons */}
              <div className="pt-1 flex gap-3 justify-end flex-wrap">
                <button type="button"
                  onClick={() => navigate("/educator")}
                  className="rounded-full border border-slate-300 bg-white px-7 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>

                <button type="button" onClick={handleSaveDraft}
                  disabled={!canDraft || saving}
                  className="btn-soft px-7 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? "Saving..." : "Save Draft"}
                </button>

                <button type="submit" disabled={!canPublish || saving}
                  className="btn-primary px-8 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? "Publishing..." : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </PageShell>
  );
};

export default EducatorEditCourse;

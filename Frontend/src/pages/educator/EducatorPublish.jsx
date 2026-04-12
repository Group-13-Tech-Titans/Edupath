import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const ALL_TAGS = [
  "web-dev", "data-science", "ai-ml", "cyber-security",
  "mobile-dev", "ui-ux", "commerce", "business",
  "accounting", "marketing", "art-design", "photography",
  "music", "science", "mathematics", "language",
  "health", "engineering", "law", "other"
];

const EducatorPublish = () => {
  const { currentUser, createCourse } = useApp();
  const navigate = useNavigate();

  const storageKey = useMemo(() => {
    const email = currentUser?.email || "unknown";
    return `edupath_publish_content_${email}`;
  }, [currentUser?.email]);

  const [contentItems, setContentItems] = useState([]);

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
    price: "",
    duration: "",
    specializationTags: [],   // now an array
    thumbnailFile: null,
    thumbnailUrl: ""
  });

  const [tagSearch, setTagSearch] = useState("");
  const [error, setError] = useState("");

  const isVerified = currentUser?.status === "VERIFIED";
  const hasContent = contentItems.length > 0;

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const digitsOnly = String(value).replace(/[^\d]/g, "");
    setForm((p) => ({ ...p, [name]: digitsOnly }));
  };

  const handleThumbnail = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setForm((p) => ({ ...p, thumbnailFile: file, thumbnailUrl: evt.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Toggle a tag on/off
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

  // Filtered tags based on search input
  const filteredTags = useMemo(() => {
    const q = tagSearch.trim().toLowerCase();
    if (!q) return ALL_TAGS;
    return ALL_TAGS.filter((t) => t.includes(q));
  }, [tagSearch]);

  // Full form complete check (for Publish)
  const isFormComplete = useMemo(() => {
    return Boolean(
      form.title.trim() &&
      form.description.trim() &&
      form.category.trim() &&
      form.level.trim() &&
      String(form.price).trim() &&
      String(form.duration).trim() &&
      form.specializationTags.length > 0 &&
      form.thumbnailFile
    );
  }, [form]);

  const canPublish = isVerified && isFormComplete && hasContent;

  // Draft only needs a title
  const canDraft = isVerified && form.title.trim().length > 0;

  const buildCoursePayload = (status) => ({
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category.trim(),
    level: form.level.trim(),
    price: Number(form.price) || 0,
    duration: Number(form.duration) || 0,
    specializationTag: form.specializationTags.join(","),
    thumbnailName: form.thumbnailFile?.name || "",
    thumbnailUrl: form.thumbnailUrl || "",
    rating: 0,
    educatorName: currentUser?.name || "Educator",
    createdByEducatorEmail: currentUser?.email,
    status,
    content: {
      modules: [],
      items: contentItems
    }
  });

  const goAddContent = () => {
    navigate("/educator/add-content", { state: { backTo: "/educator/publish" } });
  };

  // Draft — only needs title, saves with status "draft"
  const handleSaveDraft = async (e) => {
    e?.preventDefault?.();
    setError("");
    if (!isVerified) {
      setError("Your educator profile must be verified before saving a draft.");
      return;
    }
    if (!form.title.trim()) {
      setError("Please enter at least a course title to save a draft.");
      return;
    }
    const res = await createCourse(buildCoursePayload("draft"));
    if (!res.success) {
      setError(res.message || "Failed to save draft.");
      return;
    }
    localStorage.removeItem(storageKey);
    navigate("/educator/courses");
  };

  // Publish — needs everything
  const handlePublish = async (e) => {
    e.preventDefault();
    setError("");
    if (!isVerified) {
      setError("Your educator profile must be verified before publishing.");
      return;
    }
    if (!isFormComplete) {
      setError("Please fill all fields (including thumbnail and at least one tag) before publishing.");
      return;
    }
    if (!hasContent) {
      setError("Please add at least one course content item before publishing.");
      return;
    }
    const res = await createCourse(buildCoursePayload("pending"));
    if (!res.success) {
      setError(res.message || "Failed to publish course.");
      return;
    }
    localStorage.removeItem(storageKey);
    navigate("/educator/courses");
  };

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
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

        <form onSubmit={handlePublish} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* LEFT: Course Details */}
          <div className="rounded-3xl bg-white/80 border border-black/5 shadow-lg p-6">
            <h2 className="text-base font-semibold text-text-dark">Course Details</h2>
            <p className="mt-1 text-xs text-muted">Basic course information visible to students.</p>

            <div className="mt-5 space-y-4 text-xs">
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
              <div>
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
                  <div className="mt-3 rounded-2xl border border-black/10 bg-white/70 px-4 py-4 text-[11px] text-muted text-center">
                    No content added yet. Click Add Course Content to begin.
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-black/10 bg-white/70 px-4 py-3">
                    <ul className="space-y-2">
                      {contentItems.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between rounded-xl bg-white/80 border border-black/5 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-text-dark truncate">{item.name}</p>
                            <p className="text-[11px] text-muted">{item.type}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Course Setup */}
          <div className="rounded-3xl bg-white/80 border border-black/5 shadow-lg p-6">
            <h2 className="text-base font-semibold text-text-dark">Course Setup</h2>
            <p className="mt-1 text-xs text-muted">Quick settings for your course.</p>

            <div className="mt-5 space-y-4 text-xs">
              {/* Category */}
              <div>
                <label className="font-semibold text-text-dark">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  disabled={!isVerified}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
                >
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

              {/* Price */}
              <div>
                <label className="font-semibold text-text-dark">Price (LKR)</label>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleNumberChange}
                  disabled={!isVerified}
                  inputMode="numeric"
                  placeholder="Eg: 5000"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="font-semibold text-text-dark">Estimated Duration</label>
                <input
                  name="duration"
                  value={form.duration}
                  onChange={handleNumberChange}
                  disabled={!isVerified}
                  inputMode="numeric"
                  placeholder="Eg: 12"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
                />
                <p className="mt-1 text-[11px] text-muted">Enter hours as a number (e.g., 12).</p>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="font-semibold text-text-dark">Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnail}
                  disabled={!isVerified}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-[11px] outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                />
                {form.thumbnailFile?.name && (
                  <p className="mt-1 text-[11px] text-muted">Selected: {form.thumbnailFile.name}</p>
                )}
              </div>

              {/* Specialization Tags — searchable multi-select */}
              <div>
                <label className="font-semibold text-text-dark">Specialization Tags</label>
                <p className="mt-1 text-[11px] text-muted">Search and select one or more tags.</p>

                {/* Search input */}
                <input
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  disabled={!isVerified}
                  placeholder="Type to filter tags... e.g. web"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                {/* Selected tags shown as removable chips */}
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
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Filtered tag options */}
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
                  <p className="mt-1 text-[11px] text-rose-500">Please select at least one tag.</p>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-1 flex gap-3 justify-end flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem(storageKey);
                    navigate("/educator");
                  }}
                  className="rounded-full border border-red-300 bg-white px-7 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
                >
                  Discard
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={!canDraft}
                  className="btn-soft px-7 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save Draft
                </button>

                <button
                  type="submit"
                  disabled={!canPublish}
                  className="btn-primary px-8 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Publish
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

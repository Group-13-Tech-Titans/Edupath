import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

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
    price: "", // numeric-only
    duration: "", // numeric-only
    specializationTag: "",
    thumbnailFile: null
  });

  const [error, setError] = useState("");

  const isVerified = educator?.status === "VERIFIED";
  const hasContent = contentItems.length > 0;

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // Numeric-only sanitizers (still allows empty)
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const digitsOnly = String(value).replace(/[^\d]/g, "");
    setForm((p) => ({ ...p, [name]: digitsOnly }));
  };

  const handleThumbnail = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((p) => ({ ...p, thumbnailFile: file }));
  };

  // All fields mandatory (including thumbnail)
  const isFormComplete = useMemo(() => {
    const hasText =
      form.title.trim() &&
      form.description.trim() &&
      form.category.trim() &&
      form.level.trim() &&
      String(form.price).trim() &&
      String(form.duration).trim() &&
      form.specializationTag.trim();

    const hasThumb = !!form.thumbnailFile;
    return Boolean(hasText && hasThumb);
  }, [form]);

  // ✅ must have at least 1 content item too
  const canSubmit = isVerified && isFormComplete && hasContent;

  const buildCoursePayload = (status) => ({
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category.trim(),
    level: form.level.trim(),
    price: Number(form.price),
    duration: Number(form.duration),
    specializationTag: form.specializationTag.trim(),
    thumbnailName: form.thumbnailFile?.name || "",
    rating: 0,
    educatorName: educator?.name || "Educator",
    createdByEducatorEmail: currentUser?.email,
    status, // "pending" etc.
    content: {
      modules: [],
      items: contentItems
    }
  });

  const goAddContent = () => {
    navigate("/educator/add-content", { state: { backTo: "/educator/publish" } });
  };

  const handleSaveDraft = (e) => {
    e?.preventDefault?.();
    setError("");

    if (!isVerified) {
      setError("Your educator profile must be verified before creating a draft.");
      return;
    }
    if (!isFormComplete) {
      setError("Please fill all fields (including thumbnail) before saving a draft.");
      return;
    }
    if (!hasContent) {
      setError("Please add at least one course content item before saving a draft.");
      return;
    }

    createCourse(buildCoursePayload("pending"));
    // ✅ go back to My Courses page
    navigate("/educator/courses");
  };

  const handlePublish = (e) => {
    e.preventDefault();
    setError("");

    if (!isVerified) {
      setError("Your educator profile must be verified before publishing.");
      return;
    }
    if (!isFormComplete) {
      setError("Please fill all fields (including thumbnail) before publishing.");
      return;
    }
    if (!hasContent) {
      setError("Please add at least one course content item before publishing.");
      return;
    }

    createCourse(buildCoursePayload("pending"));
    // ✅ go back to My Courses page
    navigate("/educator/courses");
  };

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Top header container */}
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
            <div>
              <h2 className="text-base font-semibold text-text-dark">Course Details</h2>
              <p className="mt-1 text-xs text-muted">
                Basic course information visible to students.
              </p>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-text-dark">Course Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  disabled={!isVerified}
                  placeholder="Eg: python for beginners"
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
                  required
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
                            <p className="text-[12px] font-semibold text-text-dark truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-muted">{item.type}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!hasContent && (
                  <p className="mt-2 text-[11px] text-rose-600">
                    You must add at least one content item before saving/publishing.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Course Setup */}
          <div className="rounded-3xl bg-white/80 border border-black/5 shadow-lg p-6">
            <div>
              <h2 className="text-base font-semibold text-text-dark">Course Setup</h2>
              <p className="mt-1 text-xs text-muted">Quick settings for your course.</p>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-text-dark">Category</label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  disabled={!isVerified}
                  placeholder="Select Category"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="font-semibold text-text-dark">Difficulty</label>
                <select
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  required
                  disabled={!isVerified}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="" disabled>
                    Select Difficulty
                  </option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* ✅ numeric-only */}
              <div>
                <label className="font-semibold text-text-dark">Price (LKR)</label>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleNumberChange}
                  required
                  disabled={!isVerified}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Eg :5000"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              {/* ✅ numeric-only */}
              <div>
                <label className="font-semibold text-text-dark">Estimated Duration</label>
                <input
                  name="duration"
                  value={form.duration}
                  onChange={handleNumberChange}
                  required
                  disabled={!isVerified}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Eg : 12"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
                />
                <p className="mt-1 text-[11px] text-muted">Enter hours as a number (e.g., 12).</p>
              </div>

              <div>
                <label className="font-semibold text-text-dark">Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnail}
                  required
                  disabled={!isVerified}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-[11px] outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                />
                {form.thumbnailFile?.name && (
                  <p className="mt-1 text-[11px] text-muted">
                    Selected: {form.thumbnailFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="font-semibold text-text-dark">Specialization Tag</label>
                <input
                  name="specializationTag"
                  value={form.specializationTag}
                  onChange={handleChange}
                  required
                  disabled={!isVerified}
                  placeholder="e.g. web-dev, data-science"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              {/* One set of buttons for the whole page */}
              <div className="pt-1 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={!canSubmit}
                  className="btn-soft px-7 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save Draft
                </button>

                <button
                  type="submit"
                  disabled={!canSubmit}
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

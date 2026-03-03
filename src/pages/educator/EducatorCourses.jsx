import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

// ---- Mock image pool (theme vibe) ----
const mockImages = [
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=60"
];

// Stable hash so mock details don't change when filtering/sorting
const stableHash = (input) => {
  const str = String(input ?? "");
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

const normalizeStatus = (status) => {
  const s = String(status ?? "").toLowerCase().trim();
  if (s === "approved" || s === "approved ".trim() || s === "approved".toLowerCase()) return "approved";
  if (s === "pending" || s.includes("pending")) return "pending";
  if (s === "rejected" || s.includes("reject")) return "rejected";
  // your backend might use "approved"/"pending"/"rejected" already; default:
  return "approved";
};

const statusPill = (status) => {
  const s = normalizeStatus(status);
  if (s === "approved")
    return { label: "Approved", cls: "bg-emerald-100/70 text-emerald-800 border-emerald-200/70" };
  if (s === "pending")
    return { label: "Pending Review", cls: "bg-amber-100/70 text-amber-900 border-amber-200/70" };
  return { label: "Rejected", cls: "bg-rose-100/70 text-rose-800 border-rose-200/70" };
};

const categoryChip = (category) => {
  const c = String(category ?? "").toLowerCase();
  if (c.includes("web")) return { label: "WEB", icon: "🌐" };
  if (c.includes("data")) return { label: "DATA", icon: "📊" };
  if (c.includes("design") || c.includes("ui")) return { label: "DESIGN", icon: "🎨" };
  // fallback
  const short = String(category || "COURSE").toUpperCase();
  return { label: short.length > 10 ? short.slice(0, 10) : short, icon: "📚" };
};

const levelChip = (level) => {
  const l = String(level ?? "").toLowerCase();
  if (l.includes("beginner")) return { label: "BEGINNER", icon: "🧑‍🎓" };
  if (l.includes("intermediate")) return { label: "INTERMEDIATE", icon: "🧠" };
  if (l.includes("advanced")) return { label: "ADVANCED", icon: "🚀" };
  return { label: "BEGINNER", icon: "🧑‍🎓" };
};

// Custom themed dropdown (matches your mint theme)
const CustomSelect = ({ value, options, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="glass-card w-full px-5 py-3 text-sm font-semibold text-text-dark hover:bg-white/80 transition text-left"
      >
        <span>{value || placeholder}</span>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">▾</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-primary/25 bg-white/95 shadow-lg backdrop-blur">
          <div className="max-h-56 overflow-auto py-1">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition ${
                  opt === value ? "bg-primary/15 text-text-dark font-semibold" : "hover:bg-primary/10 text-text-dark"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EducatorCourses = () => {
  const { currentUser, courses } = useApp();

  const myCourses = useMemo(() => {
    return courses.filter((c) => c.createdByEducatorEmail === currentUser?.email);
  }, [courses, currentUser?.email]);

  // Search + filters state
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [levelFilter, setLevelFilter] = useState("All Levels");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Build filter options from existing courses
  const categoryOptions = useMemo(() => {
    const set = new Set();
    myCourses.forEach((c) => {
      if (c.category) set.add(String(c.category));
    });
    return ["All Categories", ...Array.from(set)];
  }, [myCourses]);

  const levelOptions = useMemo(() => {
    const set = new Set();
    myCourses.forEach((c) => {
      if (c.level) set.add(String(c.level));
    });
    // Ensure common ones exist (even if not present yet)
    const defaults = ["Beginner", "Intermediate", "Advanced"];
    defaults.forEach((d) => set.add(d));
    return ["All Levels", ...Array.from(set)];
  }, [myCourses]);

  const statusOptions = useMemo(() => {
    return ["All Status", "Approved", "Pending Review", "Rejected"];
  }, []);

  // Apply search + filters
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return myCourses.filter((c) => {
      const title = String(c.title ?? "").toLowerCase();
      const desc = String(c.description ?? "").toLowerCase();
      const cat = String(c.category ?? "").toLowerCase();
      const lvl = String(c.level ?? "").toLowerCase();
      const st = normalizeStatus(c.status);

      // Search
      const matchesQuery = !q || title.includes(q) || desc.includes(q) || cat.includes(q);

      // Category filter
      const matchesCategory =
        categoryFilter === "All Categories" || String(c.category ?? "") === categoryFilter;

      // Level filter
      const matchesLevel =
        levelFilter === "All Levels" || String(c.level ?? "") === levelFilter;

      // Status filter
      const matchesStatus =
        statusFilter === "All Status" ||
        (statusFilter === "Approved" && st === "approved") ||
        (statusFilter === "Pending Review" && st === "pending") ||
        (statusFilter === "Rejected" && st === "rejected");

      return matchesQuery && matchesCategory && matchesLevel && matchesStatus;
    });
  }, [myCourses, query, categoryFilter, levelFilter, statusFilter]);

  // Decorate each course with stable mock visuals (based on course.id)
  const cards = useMemo(() => {
    return filtered.map((c) => {
      const h = stableHash(c.id ?? c.title);
      const image = c.thumbnailUrl || mockImages[h % mockImages.length];

      // Stable mock stats (unless your course already has these fields)
      const durationHrs = c.durationHours ?? [22, 18, 24, 16][h % 4];
      const rating = c.rating ?? [4.8, 4.7, 4.9, 4.6][h % 4];

      const chipA = categoryChip(c.category || "Web");
      const chipB = levelChip(c.level || "Beginner");
      const pill = statusPill(c.status);

      return {
        ...c,
        _img: image,
        _duration: durationHrs,
        _rating: rating,
        _chipA: chipA,
        _chipB: chipB,
        _pill: pill
      };
    });
  }, [filtered]);

  return (
    <PageShell>
      <div className="space-y-5">
        {/* Hero */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="text-xl font-semibold text-text-dark">My Published Courses</h1>
              <p className="mt-1 text-xs text-muted">
                Manage your courses, track approval status, and quickly search by title, category, or
                level. Click a course to edit or view details.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* 1) dynamic count + remove emoji */}
              <span className="pill">{myCourses.length} courses</span>

              <Link to="/educator/publish" className="btn-primary text-xs px-5 py-2">
                + Create Course
              </Link>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10" />
          <div className="pointer-events-none absolute -right-10 top-10 h-52 w-52 rounded-full bg-primary/10" />
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="glass-card px-4 py-3 flex items-center gap-3">
              <span className="text-muted">🔎</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your courses..."
                className="w-full bg-transparent outline-none text-sm text-text-dark placeholder:text-muted"
              />
            </div>
          </div>

          {/* 3) Real filtering dropdowns */}
          <div className="w-full lg:w-52">
            <CustomSelect
              value={categoryFilter}
              options={categoryOptions}
              onChange={setCategoryFilter}
              placeholder="All Categories"
            />
          </div>

          <div className="w-full lg:w-44">
            <CustomSelect
              value={levelFilter}
              options={levelOptions}
              onChange={setLevelFilter}
              placeholder="All Levels"
            />
          </div>

          <div className="w-full lg:w-44">
            <CustomSelect
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
              placeholder="All Status"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((course) => (
            <div
              key={course.id}
              className="glass-card overflow-hidden p-0 hover:-translate-y-1 hover:shadow-2xl transition"
            >
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={course._img}
                  alt={course.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="p-4">
                <h3 className="text-sm font-semibold text-text-dark">{course.title}</h3>
                <p className="mt-2 text-[11px] text-muted line-clamp-3">
                  {course.description || "A short course description will appear here."}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="pill-soft">
                    {course._chipA.icon} {course._chipA.label}
                  </span>
                  <span className="pill">
                    {course._chipB.icon} {course._chipB.label}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="pill">⏱ {course._duration}h</span>
                  <span className="pill">⭐ {course._rating}</span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`rounded-full border px-4 py-1 text-[11px] font-semibold ${course._pill.cls}`}
                  >
                    {course._pill.label}
                  </span>

                  {/* Placeholder page for later */}
                  <Link
                    to={`/educator/courses/${course.id}`}
                    className="rounded-full border border-black/20 bg-white/80 px-5 py-1.5 text-[11px] font-semibold text-text-dark hover:bg-white transition"
                  >
                    Open
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {cards.length === 0 && (
            <div className="glass-card p-6 text-sm text-muted sm:col-span-2 lg:col-span-4">
              No courses found. Try different filters, or create a new course.
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default EducatorCourses;

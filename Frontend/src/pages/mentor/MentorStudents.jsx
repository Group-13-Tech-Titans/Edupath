import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMentorStudents, getMentorSessions } from "../../api/mentorApi";

export default function MentorStudents() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // clear any auth data you stored
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // redirect to login (change if your route is different)
    navigate("/login");
  };

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper to format time ago
  const formatTimeAgo = (date) => {
    if (!date) return "Never";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffDays > 30) return d.toLocaleDateString();
    if (diffDays > 0) return `${diffDays} days ago`;
    if (diffHr > 0) return `${diffHr} hours ago`;
    if (diffMin > 0) return `${diffMin} mins ago`;
    return "Just now";
  };

  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        setLoading(true);
        // Fetch both explicit student relations and sessions
        const [studentData, sessionData] = await Promise.all([
          getMentorStudents(),
          getMentorSessions()
        ]);

        const studentMap = new Map();

        // 1. Add students from explicit relations
        studentData.forEach((s) => {
          const id = s.studentId;
          studentMap.set(id, {
            id: id,
            name: s.studentName || "Unknown Student",
            initials: getInitials(s.studentName),
            status: s.status || "active",
            track: s.track || "General",
            enrolled: formatTimeAgo(s.enrolledAt),
            lastActivity: formatTimeAgo(s.lastActivity),
            rawEnrolledAt: s.enrolledAt,
          });
        });

        // 2. Add students from sessions (if not already added)
        sessionData.forEach((sess) => {
          const id = sess.studentId;
          if (!studentMap.has(id)) {
            studentMap.set(id, {
              id: id,
              name: sess.studentName || "Unknown Student",
              initials: getInitials(sess.studentName),
              status: sess.status === "completed" ? "active" : "new",
              track: "General", // Sessions don't always have track info
              enrolled: formatTimeAgo(sess.createdAt),
              lastActivity: formatTimeAgo(sess.updatedAt || sess.createdAt),
              rawEnrolledAt: sess.createdAt,
            });
          }
        });

        setStudents(Array.from(studentMap.values()));
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStudents();
  }, []);

  const [statusFilter, setStatusFilter] = useState("all");
  const [trackFilter, setTrackFilter] = useState("all");
  const [sortMode, setSortMode] = useState("name_asc");
  const [searchText, setSearchText] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);

  const counts = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.status === "active").length;
    const paused = students.filter((s) => s.status === "paused").length;
    return { total, active, paused };
  }, [students]);

  const filteredStudents = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    const matches = (s) => {
      const statusOk = statusFilter === "all" ? true : s.status === statusFilter;
      const trackOk = trackFilter === "all" ? true : s.track === trackFilter;

      const searchOk =
        q.length === 0
          ? true
          : s.name.toLowerCase().includes(q) || s.track.toLowerCase().includes(q);

      return statusOk && trackOk && searchOk;
    };

    let arr = students.filter(matches);

    if (sortMode === "name_asc") arr = [...arr].sort((a, b) => a.name.localeCompare(b.name));
    if (sortMode === "name_desc") arr = [...arr].sort((a, b) => b.name.localeCompare(a.name));
    if (sortMode === "enrolled_desc") arr = [...arr].sort((a, b) => (b.rawEnrolledAt || "").localeCompare(a.rawEnrolledAt || ""));

    return arr;
  }, [students, statusFilter, trackFilter, sortMode, searchText]);

  const resetFilters = () => {
    setStatusFilter("all");
    setTrackFilter("all");
    setSortMode("name_asc");
    setSearchText("");
  };

  const StatusChip = ({ status }) => {
    if (status === "active")
      return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-800">Active</span>;
    if (status === "paused")
      return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">Paused</span>;
    if (status === "new")
      return <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-extrabold text-sky-800">New</span>;
    return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">-</span>;
  };

  return (
    <>
      {/* Page Header */}
      <section className="mb-5 flex flex-col justify-between gap-4 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold">My Students</h1>
          <p className="mt-1 text-sm text-slate-500">View your assigned students and communicate with them.</p>
        </div>
      </section>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-5">
        {/* Main list */}
        <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
              {/* search */}
              <div className="flex w-full min-w-[260px] items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-teal-400 focus-within:bg-white lg:w-[320px]">
                <SearchIcon />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Search by name or track..."
                />
              </div>

            </div>

            <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
              <select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
              >
                <option value="all">All Tracks</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Science & ML">Data Science & ML</option>
                <option value="React & TypeScript">React & TypeScript</option>
                <option value="Networking">Networking</option>
              </select>

              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
                className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
              >
                <option value="name_asc">Sort: Name (A → Z)</option>
                <option value="name_desc">Sort: Name (Z → A)</option>
                <option value="enrolled_desc">Sort: Recently Enrolled</option>
              </select>

              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl bg-emerald-100 px-4 py-2 text-sm font-bold text-teal-600 transition hover:bg-emerald-200"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Student list */}
          <div className="flex flex-col gap-3">
            {filteredStudents.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-4 rounded-xl border border-black/5 bg-slate-50 p-4 transition hover:translate-x-1 hover:bg-emerald-50 md:flex-row md:items-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-300 text-lg font-extrabold text-white">
                  {s.initials}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                    <div>
                      <div className="text-base font-extrabold">{s.name}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {s.track} • Enrolled {s.enrolled} • Last activity: {s.lastActivity}
                      </div>
                    </div>

                  </div>
                </div>

                <div className="flex gap-2 md:flex-col">
                  <button
                    type="button"
                    onClick={() => navigate(`/mentor/student-details/${s.id}`)}
                    className="rounded-xl bg-teal-400 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-500"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/mentor/messages", { state: { studentId: s.id } })}
                    className="rounded-xl border-2 border-teal-400 bg-white px-4 py-2 text-sm font-bold text-teal-600 transition hover:bg-teal-400 hover:text-white"
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-slate-500">
            Showing <span className="font-bold">{filteredStudents.length}</span> student(s)
          </div>
        </section>
      </div>
    </>
  );
}

/* ----------------- small UI components ----------------- */
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}


function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
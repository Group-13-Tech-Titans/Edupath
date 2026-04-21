import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MentorStudents() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // clear any auth data you stored
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // redirect to login (change if your route is different)
    navigate("/login");
  };

  // demo dataset from your HTML (replace with API later)
  const students = useMemo(
    () => [
      {
        id: "S001",
        name: "Priya Sharma",
        initials: "PS",
        status: "active",
        track: "Web Development",
        enrolled: "3 months ago",
        lastActivity: "2 hours ago",
      },
      {
        id: "S002",
        name: "Rahul Mehta",
        initials: "RM",
        status: "active",
        track: "Data Science & ML",
        enrolled: "1 month ago",
        lastActivity: "Yesterday",
      },
      {
        id: "S003",
        name: "Anjali Kumar",
        initials: "AK",
        status: "active",
        track: "React & TypeScript",
        enrolled: "2 months ago",
        lastActivity: "3 days ago",
      },
      {
        id: "S004",
        name: "Nimal Perera",
        initials: "NP",
        status: "new",
        track: "Networking",
        enrolled: "5 days ago",
        lastActivity: "1 hour ago",
      },
      {
        id: "S005",
        name: "Sahana Jayasinghe",
        initials: "SJ",
        status: "paused",
        track: "Web Development",
        enrolled: "4 months ago",
        lastActivity: "2 weeks ago",
      },
      {
        id: "S006",
        name: "Kavindu Fernando",
        initials: "KF",
        status: "active",
        track: "Web Development",
        enrolled: "2 weeks ago",
        lastActivity: "Today",
      },
    ],
    []
  );

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
    if (sortMode === "enrolled_desc") arr = [...arr].sort((a, b) => (a.enrolled || "").localeCompare(b.enrolled || ""));

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
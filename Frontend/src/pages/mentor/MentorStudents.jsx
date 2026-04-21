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
    <div className="min-h-screen bg-gradient-to-br from-emerald-200 to-teal-300 p-5 text-slate-800">
      {/* Header - matching MentorDashboard */}
      <header className="mb-5 flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <EduPathLogo />
          <span>EduPath</span>
        </div>

        <nav className="relative z-50 hidden flex-1 items-center justify-center gap-8 md:flex">
          <Link to="/MentorDashboard" className="font-medium text-slate-800 transition-colors hover:text-teal-500">
            Dashboard
          </Link>
          <Link to="/MentorStudents" className="font-medium text-teal-500 transition-colors hover:text-teal-500">
            My Students
          </Link>
          <Link to="/MentorSessions" className="font-medium text-slate-800 transition-colors hover:text-teal-500">
            Sessions
          </Link>
          <Link to="/MentorResources" className="font-medium text-slate-800 transition-colors hover:text-teal-500">
          Resources
          </Link>
          <Link to="/MentorMessages" className="font-medium text-slate-800 transition-colors hover:text-teal-500">
          Messages
          </Link>
          <Link to="/MentorProfile" className="font-medium text-slate-800 transition-colors hover:text-teal-500" style={{ textDecoration: "none" }}>
            Profile
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="w-[150px] flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </header>

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
                    onClick={() => navigate(`/MentorStudentDetails/${s.id}`)}
                    className="rounded-xl bg-teal-400 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-500"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/MentorMessages", { state: { studentId: s.id } })}
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


      {/* Footer */}
      <footer className="mt-5 rounded-2xl bg-white px-7 py-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <div className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
                <EduPathLogo />
                <span>EduPath</span>
              </div>

              <p className="mb-4 text-sm leading-6 text-slate-700">
                Empowering learners worldwide with quality education and personalized learning paths.
              </p>

              <div className="flex gap-3">
                <SocialIcon><FacebookIcon /></SocialIcon>
                <SocialIcon><TwitterIcon /></SocialIcon>
                <SocialIcon><LinkedInIcon /></SocialIcon>
                <SocialIcon><InstagramIcon /></SocialIcon>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 md:gap-12">
              <FooterCol
                title="Quick Links"
                links={[
                  { label: "Mentor Guidelines", href: "#" },
                  { label: "Best Practices", href: "#" },
                  { label: "Resources", href: "#" },
                ]}
              />
              <FooterCol
                title="Support"
                links={[
                  { label: "Help Center", href: "#" },
                  { label: "Contact Us", href: "#" },
                  { label: "FAQs", href: "#" },
                ]}
              />
              <FooterCol
                title="Legal"
                links={[
                  { label: "Terms & Conditions", href: "#" },
                  { label: "Privacy Policy", href: "#" },
                  { label: "Cookie Policy", href: "#" },
                ]}
              />
            </div>
          </div>

          <div className="mt-8 border-t-2 border-slate-200 pt-5 text-center">
            <p className="text-sm text-slate-500">© 2026 EduPath. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ----------------- small UI components ----------------- */

function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full border border-teal-400 bg-teal-400 px-3 py-2 text-xs font-extrabold text-white transition"
          : "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-extrabold text-teal-600 transition hover:-translate-y-[1px]"
      }
    >
      {children}
    </button>
  );
}

function MiniStat({ label, value, accent }) {
  return (
    <div className={`mb-3 flex items-center justify-between rounded-xl border-l-4 ${accent} bg-slate-50 p-4`}>
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-lg font-extrabold">{value}</div>
      </div>
    </div>
  );
}

function KV({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 py-2 last:border-b-0">
      <span className="text-sm text-slate-500">{k}</span>
      <span className="text-sm font-extrabold text-slate-800">{v}</span>
    </div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-800">{title}</h4>
      <div className="flex flex-col gap-2">
        {links.map((l) => (
          <a key={l.label} href={l.href} className="text-sm text-slate-500 hover:text-teal-500">
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function SocialIcon({ children }) {
  return (
    <button
      type="button"
      className="grid h-10 w-10 place-items-center rounded-full bg-[#D9F3EC] text-[#5DD9C1]"
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

function EduPathLogo() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#5DD9C1" opacity="0.2" />
      <path d="M20 8L12 12L20 16L28 12L20 8Z" fill="#5DD9C1" />
      <path d="M12 20L20 24L28 20" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 26L20 30L28 26" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2" fill="#5DD9C1" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

/* -------- Social Media Icons -------- */

function FacebookIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M22 12.073C22 6.504 17.523 2 12 2S2 6.504 2 12.073c0 5.016 3.657 9.175 8.438 9.927v-7.025H7.898v-2.902h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.095 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.562v1.874h2.773l-.443 2.902h-2.33V22C18.343 21.248 22 17.089 22 12.073z"/>
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 8.09V9a10.66 10.66 0 01-9-4.5s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.984V9h3.108v1.561h.046c.433-.82 1.494-1.684 3.074-1.684 3.287 0 3.894 2.164 3.894 4.977v6.598zM5.337 7.433a1.96 1.96 0 110-3.92 1.96 1.96 0 010 3.92zM6.919 20.452H3.756V9h3.163v11.452z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M7 2C4.8 2 3 3.8 3 6v12c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4V6c0-2.2-1.8-4-4-4H7zm5 5a5 5 0 110 10 5 5 0 010-10zm6.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0zM12 9a3 3 0 100 6 3 3 0 000-6z"/>
    </svg>
  );
}


function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
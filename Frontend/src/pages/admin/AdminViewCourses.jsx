import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminFooter from "./AdminFooter";

const mockCourses = [
  {
    id: "1",
    title: "HTML + CSS Bootcamp",
    desc: "Beginner friendly course with projects, quizzes, and cheat sheets.",
    category: "WEB",
    educator: "Alex Johnson",
    level: "BEGINNER",
    durationHrs: 22,
    status: "pending",
    imageUrl:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "2",
    title: "JavaScript Essentials",
    desc: "DOM, events, APIs, best practices, and hands-on exercises.",
    category: "WEB",
    educator: "Maya Perera",
    level: "INTERMEDIATE",
    durationHrs: 18,
    status: "pending",
    imageUrl:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "3",
    title: "Python for Data Analysis",
    desc: "Pandas, NumPy, charts, and real datasets.",
    category: "DATA",
    educator: "Dr. Liam Chen",
    level: "BEGINNER",
    durationHrs: 24,
    status: "pending",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "4",
    title: "UI/UX Design Fundamentals",
    desc: "Wireframes, user journeys, color systems, and UI rules.",
    category: "DESIGN",
    educator: "Nadia Silva",
    level: "BEGINNER",
    durationHrs: 16,
    status: "pending",
    imageUrl:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "5",
    title: "AI/ML Crash Course",
    desc: "Supervised vs unsupervised learning, regression, classification, and projects.",
    category: "AI/ML",
    educator: "Samira Fernando",
    level: "INTERMEDIATE",
    durationHrs: 20,
    status: "pending",
    imageUrl:
      "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "6",
    title: "SQL for Analytics",
    desc: "Queries, joins, aggregation, dashboards, and reporting.",
    category: "DATA",
    educator: "Prof. Daniel Ortiz",
    level: "BEGINNER",
    durationHrs: 14,
    
    status: "pending",
    imageUrl:
      "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1200&q=80",
  },
];



export default function AdminViewCourses() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("pending"); // pending | approved | rejected | all
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, all: mockCourses.length };
    for (const course of mockCourses) c[course.status] += 1;
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mockCourses
      .filter((c) => (tab === "all" ? true : c.status === tab))
      .filter((c) => {
        if (!q) return true;
        const hay = `${c.title} ${c.desc} ${c.category} ${c.educator} ${c.level}`.toLowerCase();
        return hay.includes(q);
      });
  }, [tab, search]);

  const openCourse = (id) => navigate(`/admin/courses/${id}`);

  return (
    <div className="min-h-screen ">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-[30px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur ">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">All Pending Courses</h1>
              <p className="mt-1 text-xs text-slate-500">
                Browse courses and review pending submissions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className=" px-3 py-1 text-s font-semibold text-slate-800">
                Total: {counts.all}
              </span>
            </div>
          </div>

          {/* Controls */}
          
        </div>

        {/* Grid like screenshot */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="rounded-[26px] border border-black/5 bg-white/80 shadow-[0_14px_40px_rgba(0,0,0,0.08)] backdrop-blur overflow-hidden"
            >
              {/* Image */}
              <button
                type="button"
                onClick={() => openCourse(c.id)}
                className="block w-full text-left"
                title="Open course"
              >
                <div className="relative h-36 w-full">
                  <img
                    src={c.imageUrl}
                    alt={c.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {/* soft overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-black/0" />
                </div>
              </button>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm font-extrabold text-slate-900 truncate">
                  {c.title}
                </p>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {c.desc}
                </p>

                {/* Pills row */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Pill>{c.category}</Pill>
                  <Pill>{c.level}</Pill>
                  <Pill>{c.durationHrs} hrs</Pill>

                  <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-600">
                    
                  </div>
                </div>

                {/* Bottom row */}
                <div className="mt-4 flex items-center justify-between">
                  

                  <button
                    type="button"
                    onClick={() => openCourse(c.id)}
                    className="rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-semibold text-slate-900 hover:bg-white/70"
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-6 rounded-[26px] border border-black/5 bg-white/60 p-5 text-sm text-slate-500">
            No courses found for your filters.
          </div>
        )}
      </div>

      <AdminFooter />
    </div>
  );
}




function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700">
      {children}
    </span>
  );
}

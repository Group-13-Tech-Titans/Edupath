import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MentorProfile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-200 to-teal-300 p-5 text-slate-800">
      {/* Header - matching MentorStudents */}
      <header className="mb-5 flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <EduPathLogo />
          <span>EduPath</span>
        </div>

        <nav className="relative z-50 hidden flex-1 items-center justify-center gap-8 md:flex">
          <Link to="/MentorDashboard" className="font-medium text-slate-800 transition-colors hover:text-teal-500">
            Dashboard
          </Link>
          <Link to="/MentorStudents" className="font-medium text-slate-800 transition-colors hover:text-teal-500">
            My Students
          </Link>
          <Link to="/MentorSessions" className="font-medium text-slate-800 transition-colors hover:text-teal-500">
            Sessions
          </Link>

          <Link to="/MentorProfile" className="font-medium text-teal-500 transition-colors hover:text-teal-500" style={{ textDecoration: "none" }}>
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

      {/* Profile Header */}
      <section className="mb-5 rounded-2xl bg-white p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="mb-8 flex flex-col gap-8 md:flex-row md:items-start">
          <img
            className="h-[150px] w-[150px] rounded-full border-[5px] border-teal-400 object-cover"
            alt="Dr. Sarah Johnson"
            src="data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 150 150' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='75' cy='75' r='75' fill='%235DD9C1'/%3E%3Cpath d='M75 70C88.255 70 99 59.255 99 46C99 32.745 88.255 22 75 22C61.745 22 51 32.745 51 46C51 59.255 61.745 70 75 70Z' fill='white'/%3E%3Cpath d='M75 80C54.29 80 37.5 89.455 37.5 100V128H112.5V100C112.5 89.455 95.71 80 75 80Z' fill='white'/%3E%3C/svg%3E"
          />

          <div className="flex-1">
            <h1 className="mb-2 text-[32px] font-extrabold text-slate-800">Dr. Sarah Johnson</h1>
            <p className="mb-4 text-lg text-slate-500">Senior Full-Stack Developer & Technical Mentor</p>

            <div className="mb-5 flex flex-wrap gap-2.5">
              <span className="rounded-full bg-teal-400 px-4 py-2 text-[13px] font-semibold text-white">✓ Verified Mentor</span>
              <span className="rounded-full bg-teal-300 px-4 py-2 text-[13px] font-semibold text-white">Expert Level</span>
              <span className="rounded-full bg-emerald-200 px-4 py-2 text-[13px] font-semibold text-slate-800">★ 4.9 Rating</span>
            </div>

            <div className="mb-5 flex flex-wrap gap-10">
              <StatItem value="180+" label="Students Mentored" />
              <StatItem value="850+" label="Sessions Completed" />
              <StatItem value="12" label="Years Experience" />
              <StatItem value="98%" label="Success Rate" />
            </div>

            <div className="flex gap-2.5">
              <Link
                to="/MentorSettings"
                className="inline-block rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
              >
                Edit Profiles
              </Link>
              <Link
                to="/MentorShareProfile"
                className="inline-block rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
              >
                Share Profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* (rest of your file stays EXACTLY same below this line) */}
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        {/* Left Column */}
        <div className="flex flex-col gap-5">
          {/* About Me */}
          <section className="rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h3 className="mb-5 flex items-center gap-2.5 text-[22px] font-extrabold text-slate-800">
              <UserIcon />
              About Me
            </h3>
            <p className="mb-4 text-[15px] leading-[1.8] text-slate-800">
              Passionate full-stack developer with over 12 years of experience in web development, specializing in React, Node.js, and cloud technologies. I've successfully mentored 180+ students, helping them transition into tech careers and advance their skills. My approach combines practical, real-world projects with personalized guidance tailored to each student's learning style and career goals.
            </p>
            <p className="text-[15px] leading-[1.8] text-slate-800">
              I believe in learning by doing and focus on helping students build production-ready applications while mastering fundamental concepts. Beyond technical skills, I guide students on best practices, career development, interview preparation, and navigating the tech industry.
            </p>
          </section>

          {/* Areas of Expertise */}
          <section className="rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h3 className="mb-5 flex items-center gap-2.5 text-[22px] font-extrabold text-slate-800">
              <LightbulbIcon />
              Areas of Expertise
            </h3>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {["JavaScript", "React.js", "Node.js", "TypeScript", "Python", "AWS", "MongoDB", "PostgreSQL", "Docker", "GraphQL", "REST APIs", "Microservices", "CI/CD", "System Design", "Agile/Scrum"].map((skill) => (
                <span key={skill} className="rounded-full bg-emerald-50 px-4 py-2 text-[13px] font-semibold text-teal-500">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* ... keep the rest exactly as your original file ... */}
        </div>

        <div className="flex flex-col gap-5">{/* ... */}</div>
      </div>

      {/* Footer */}
      <footer className="mt-5 rounded-2xl bg-white px-7 py-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-6xl">
          <div className="mt-8 border-t-2 border-slate-200 pt-5 text-center">
            <p className="text-sm text-slate-500">© 2026 EduPath. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ----------------- Small UI Components ----------------- */

function StatItem({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-[28px] font-extrabold text-slate-800">{value}</div>
      <div className="mt-1 text-[13px] text-slate-500">{label}</div>
    </div>
  );
}

/* ----------------- Icons ----------------- */

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

function UserIcon() {
  return (
    <svg className="h-6 w-6 stroke-teal-500" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg className="h-6 w-6 stroke-teal-500" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}
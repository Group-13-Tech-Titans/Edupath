import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import LandingFooter from "../components/LandingFooter";
import ComingSoon from "./ComingSoon";
import ContactForm from "../components/ContactForm.jsx";


const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function LandingBloomPro() {
  const nav = useMemo(
    () => [
      { id: "home", label: "Home" },
      { id: "pathways", label: "Pathways" },
      { id: "courses", label: "Courses" },
      { id: "why", label: "Why EduPath" },
      { id: "contact", label: "Contact" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50 text-slate-900">

      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button
            onClick={() => scrollToId("home")}
            className="flex items-center gap-2 rounded-2xl px-2 py-1 hover:bg-black/5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 shadow-sm">
              🎓
            </div>
            <div className="leading-tight text-left">
              <p className="text-sm font-extrabold">EduPath</p>
              <p className="-mt-0.5 text-[11px] text-slate-500">
                AI Paths • Verified Learning • Career Growth
              </p>
            </div>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((x) => (
              <button
                key={x.id}
                onClick={() => scrollToId(x.id)}
                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-black/5 hover:text-slate-900"
              >
                {x.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-black/5"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section id="home" className="mx-auto max-w-6xl px-4 pt-10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative overflow-hidden rounded-[34px] border border-black/5 bg-white shadow-[0_18px_70px_rgba(0,0,0,0.08)]"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
            <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
            <div className="absolute left-1/3 top-1/2 h-56 w-56 rounded-full bg-yellow-300/25 blur-3xl" />
          </div>

          <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:items-center">

            <div className="space-y-5">
              

              <motion.h1
                variants={fadeUp}
                className="text-4xl font-extrabold leading-tight sm:text-5xl"
              >
                Your career starts with a{" "}
                <span className="text-emerald-700">smart learning path</span>.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="max-w-xl text-sm text-slate-600 sm:text-base"
              >
                EduPath is a modern learning platform with AI career guidance, qualified educators, and special sessions with industry experts.

              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <Link
                  to="/signup"
                  className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow hover:brightness-95"
                >
                  Start free
                </Link>
                <button
                  onClick={() => scrollToId("courses")}
                  className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-bold text-slate-900 hover:bg-black/5"
                >
                  Explore courses
                </button>
              </motion.div>

              
            </div>

            <motion.div variants={fade} className="relative">
              <motion.div
                aria-hidden
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease }}
                className="pointer-events-none absolute -left-4 -top-4 hidden h-20 w-20 rounded-full bg-yellow-300 sm:block"
              />
              <motion.div
                aria-hidden
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 5.2, repeat: Infinity, ease }}
                className="pointer-events-none absolute -right-5 bottom-4 hidden h-14 w-14 rounded-full bg-emerald-400/30 sm:block"
              />

              <div className="rounded-[28px] border border-black/5 bg-white p-4 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <LinkCard
                    to="/coming-soon"
                    title="AI Path Finder"
                    subtitle="Answer questions → get your best matches"
                    badge="AI"
                    icon="🧭"
                    bg="bg-gradient-to-br from-emerald-50 to-white"
                  />
                  <LinkCard
                    onclick={()=> scrollToId("courses")}
                    title="Verified Courses"
                    subtitle="Reviewed before publishing for quality"
                    badge="QC"
                    icon="✅"
                    bg="bg-gradient-to-br from-teal-50 to-white"
                  />
                  <LinkCard
                    to="/coming-soon"
                    title="Mentor Support"
                    subtitle="Request 1:1 guidance (Premium)"
                    badge="PRO"
                    icon="🧑‍🏫"
                    bg="bg-gradient-to-br from-yellow-50 to-white"
                  />
                  <LinkCard
                    to="/login"
                    title="My Learning"
                    subtitle="Track progress, streaks, milestones"
                    badge="GO"
                    icon="📈"
                    bg="bg-gradient-to-br from-slate-50 to-white"
                  />
                </div>

                <div className="mt-4 overflow-hidden rounded-[22px] border border-black/5 bg-gradient-to-b from-emerald-50 to-white">
                  
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* PATHWAYS */}
      <section id="pathways" className="mx-auto max-w-6xl px-4 py-12">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="space-y-4">
            <motion.p variants={fadeUp} className="text-xs font-extrabold text-emerald-700">
              CAREER PATHWAYS
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-extrabold sm:text-4xl">
              Build your future with job-ready learning pathways
            </motion.h2>
            <motion.p variants={fadeUp} className="max-w-2xl text-sm text-slate-600 sm:text-base">
             EduPath uses AI to suggest the best career direction for you.
Once you choose a goal, we guide you step-by-step with courses, quizzes, projects, and milestones.
            </motion.p>

            <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-2">
              <PathCard
                title="UI/UX Designer"
                points={["Design fundamentals", "Figma projects", "Portfolio-ready case studies"]}
                accent="emerald"
              />
              <PathCard
                title="Full-Stack Developer"
                points={["Frontend + backend", "APIs + databases", "Deploy real apps"]}
                accent="teal"
              />
              <PathCard
                title="Data Analyst"
                points={["Excel → SQL", "Dashboards", "Insights & reporting"]}
                accent="yellow"
              />
              <PathCard
                title="Cybersecurity Basics"
                points={["Security mindset", "Threats & defense", "Hands-on labs"]}
                accent="slate"
              />
            </motion.div>
          </div>

          <motion.div
            variants={fade}
            className="rounded-[30px] border border-black/5 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)]"
          >
            <p className="text-sm font-extrabold">Why pathways matter</p>
            <p className="mt-2 text-sm text-slate-600">
              Most platforms give you courses — EduPath gives you direction.
              A clear pathway removes confusion and tells you exactly what to learn next, in the right order.
            </p>

            <div className="mt-5 space-y-3">
              <MiniRow icon="🧠" title="Less confusion" text="Know what to learn next, step-by-step." />
              <MiniRow icon="🎯" title="Clear goals" text="Milestones + projects to track improvement." />
              <MiniRow icon="⏱️" title="Save time" text="No more jumping between random tutorials." />
              <MiniRow icon="🏆" title="Better outcomes" text="Build proof: portfolio + certificates." />
            </div>

            <div className="mt-6">
              <button
                onClick={() => scrollToId("contact")}
                className="w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow hover:brightness-95"
              >
                Ask about pathways
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* COURSES */}
      <section id="courses" className="mx-auto max-w-6xl px-4 pb-12">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="space-y-5"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <motion.p variants={fadeUp} className="text-xs font-extrabold text-emerald-700">
                VERIFIED COURSES
              </motion.p>
              <motion.h3 variants={fadeUp} className="text-3xl font-extrabold">
                Learn with structured courses and guided steps
              </motion.h3>
              <motion.p variants={fadeUp} className="mt-1 text-sm text-slate-600">
                EduPath helps you choose the right career direction and learn with a guided, verified, and modern experience.
              </motion.p>
            </div>

            <motion.div variants={fadeUp} className="flex gap-2">
              
              <Link
                to="/signup"
                className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:brightness-95"
              >
                Join to enroll
              </Link>
            </motion.div>
          </div>

          {/* special highlight */}
          <motion.div
            variants={fadeUp}
            // className="rounded-[30px] border border-black/5 bg-gradient-to-br from-emerald-50 via-white to-yellow-50 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)]"
          >
            
              <div>
                <img
                  src="/landingImages/Img2.png"
                  alt="Landing Preview"
                  className="w-full h-full rounded-xl"
      />
                
              </div>

              
          
          </motion.div>

          
          <div className="grid gap-4 md:grid-cols-3">
            <CourseCard
              title="HTML + CSS Foundations"
              meta="Beginner • 6 modules"
              desc="Responsive layouts with Flexbox/Grid + modern UI practices."
              tag="Web"
              icon="🌐"
              to="/courses/html-css"
            />
            <CourseCard
              title="JavaScript Essentials"
              meta="Beginner • 7 modules"
              desc="Core JS + DOM + APIs, with small real-world projects."
              tag="Code"
              icon="⚡"
              to="/courses/js-essentials"
            />
            <CourseCard
              title="React for Beginners"
              meta="Beginner • 8 modules"
              desc="Components, state, routing, and clean UI patterns."
              tag="Frontend"
              icon="⚛️"
              to="/courses/react-beginner"
            />
            <CourseCard
              title="Database Basics (SQL)"
              meta="Beginner • 5 modules"
              desc="Tables, relations, queries, joins, and practice exercises."
              tag="DB"
              icon="🗄️"
              to="/courses/sql-basics"
            />
            <CourseCard
              title="Figma UI Kit Workshop"
              meta="Intermediate • 4 modules"
              desc="Design reusable components and build a consistent UI kit."
              tag="Design"
              icon="🎨"
              to="/courses/figma-ui-kit"
            />
            <CourseCard
              title="API + Auth Fundamentals"
              meta="Intermediate • 6 modules"
              desc="REST APIs, JWT auth, and role-based access patterns."
              tag="Backend"
              icon="🔐"
              to="/courses/api-auth"
            />
          </div>
        </motion.div>
      </section>

      {/* WHY EDUPATH */}
      <section id="why" className="mx-auto max-w-6xl px-4 pb-14">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid gap-6 lg:grid-cols-2"
        >
          <motion.div
            variants={fadeUp}
            className="rounded-[30px] border border-black/5 bg-white p-7 shadow-[0_18px_60px_rgba(0,0,0,0.06)]"
          >
            
        <img
        src="/landingImages/Img1.png"
        alt="Landing Preview"
        className="w-full rounded-xl"
      />


            

            
          </motion.div>

          <motion.div
            variants={fade}
            className="rounded-[30px] border border-black/5 bg-white p-7 shadow-[0_18px_60px_rgba(0,0,0,0.06)]"
          >
            <p className="text-sm font-extrabold">What you’ll get</p>
            <div className="mt-4 space-y-3">
              <MiniRow
                icon="✅"
                title="Verified & approved courses"
                text="Reviewer checks content quality before it goes live."
              />
              <MiniRow
                icon="🧭"
                title="AI Path Finder recommendations"
                text="Get multiple best-fit career paths based on your profile."
              />
              <MiniRow
                icon="🧩"
                title="Stepstones + quizzes + milestones"
                text="Learn in the right order and prove progress with tasks and tests."
              />
              <MiniRow
                icon="🤝"
                title="Mentor support (Premium)"
                text="Request 1:1 sessions with industry experts and get guidance whenever you’re stuck.."
              />
            </div>

            <div className="mt-6 overflow-hidden rounded-[22px] border border-black/5 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
              
            </div>
          </motion.div>
        </motion.div>
      </section>
            <ContactForm/>
           <LandingFooter onNav={scrollToId} />

    </div>
  );
}


function Tag({ children }) {
  return (
    <span className="rounded-full border border-black/5 bg-white px-3 py-1 text-xs font-extrabold text-slate-700">
      {children}
    </span>
  );
}

function LinkCard({ to, title, subtitle, badge, icon, bg }) {
  return (
    <Link to={to} className="group">
      <div
        className={`relative h-full overflow-hidden rounded-[22px] border border-black/5 ${bg} p-4 shadow-sm transition-transform duration-200 group-hover:-translate-y-1`}
      >
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700">
            {icon}
          </div>
          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-black text-white">
            {badge}
          </span>
        </div>
        <p className="mt-3 text-sm font-extrabold text-slate-900">{title}</p>
        <p className="mt-1 text-xs font-semibold text-slate-600">{subtitle}</p>

        <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-yellow-300/30 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl" />
      </div>
    </Link>
  );
}

function PathCard({ title, points, accent = "emerald" }) {
  const accentMap = {
    emerald: "from-emerald-50 to-white text-emerald-700 bg-emerald-600/10",
    teal: "from-teal-50 to-white text-teal-700 bg-teal-600/10",
    yellow: "from-yellow-50 to-white text-yellow-700 bg-yellow-400/20",
    slate: "from-slate-50 to-white text-slate-700 bg-slate-600/10",
  };

  const cfg = accentMap[accent] || accentMap.emerald;

  return (
    <div
      className={`rounded-[26px] border border-black/5 bg-gradient-to-br ${cfg.split(" ")[0]} ${cfg.split(" ")[1]} p-5 shadow-sm`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${cfg.split(" ")[3]}`}>
          🧩
        </div>
        <p className="text-sm font-extrabold">{title}</p>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-sm">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-600" />
            <span className="text-slate-600">{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CourseCard({ title, meta, desc, tag, icon, to }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link to={to} className="block h-full">
        <div className="h-full rounded-[30px] border border-black/5 bg-white p-6 shadow-[0_16px_45px_rgba(0,0,0,0.06)] transition hover:shadow-[0_22px_65px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-xl text-emerald-700">
              {icon}
            </div>
            <span className="rounded-full bg-yellow-300/60 px-3 py-1 text-[11px] font-black text-slate-900">
              {tag}
            </span>
          </div>

          <p className="mt-4 text-base font-extrabold text-slate-900">{title}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{meta}</p>
          <p className="mt-3 text-sm font-semibold text-slate-600">{desc}</p>

          <div className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-emerald-700">
            View course <span aria-hidden>→</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function MiniRow({ icon, title, text }) {
  return (
    <div className="flex items-start gap-3 rounded-[22px] border border-black/5 bg-white p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700">
        {icon}
      </div>
      <div>
        <p className="text-sm font-extrabold text-slate-900">{title}</p>
        <p className="text-sm font-semibold text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-[22px] border border-black/5 bg-gradient-to-b from-white to-emerald-50 p-4">
      <p className="text-xl font-black text-slate-900">{value}</p>
      <p className="text-xs font-bold text-slate-600">{label}</p>
    </div>
  );
}

function ContactPill({ icon, title, text }) {
  return (
    <div className="rounded-[22px] border border-black/5 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700">
          {icon}
        </div>
        <div>
          <p className="text-sm font-extrabold text-slate-900">{title}</p>
          <p className="text-xs font-bold text-slate-600">{text}</p>
        </div>
      </div>
    </div>
  );
}

function Input({ label, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-extrabold text-slate-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
      />
    </div>
  );
}



function Bar({ label, v }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black text-slate-700">{label}</p>
        <p className="text-[11px] font-black text-slate-500">{Math.round(v * 100)}%</p>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-black/5">
        <div
          className="h-2 rounded-full bg-emerald-600"
          style={{ width: `${Math.max(2, Math.min(100, v * 100))}%` }}
        />
      </div>
    </div>
  );
}

function UsecaseMiniArt() {
  return (
    <div className="relative h-[220px] w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(16,185,129,0.18),transparent_55%),radial-gradient(circle_at_80%_25%,rgba(20,184,166,0.16),transparent_55%),radial-gradient(circle_at_55%_80%,rgba(250,204,21,0.18),transparent_60%)]" />
      <div className="absolute inset-0 p-5">
        <div className="grid h-full grid-cols-12 gap-3">
          <div className="col-span-6 rounded-[22px] border border-black/5 bg-white/85 p-4 shadow-sm">
            <p className="text-xs font-black text-slate-800">Reviewer Queue</p>
            <div className="mt-3 space-y-2">
              <ChipRow title="React Basics" status="Pending" />
              <ChipRow title="SQL Joins" status="Approved" good />
              <ChipRow title="UI Kit" status="Pending" />
            </div>
          </div>
          <div className="col-span-6 rounded-[22px] border border-black/5 bg-white/85 p-4 shadow-sm">
            <p className="text-xs font-black text-slate-800">Admin Overview</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <MiniStat v="1,240" l="Active learners" />
              <MiniStat v="86" l="Educators" />
              <MiniStat v="28" l="Reviewers" />
              <MiniStat v="4.8" l="Avg rating" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChipRow({ title, status, good }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white px-3 py-2">
      <p className="text-xs font-black text-slate-800">{title}</p>
      <span
        className={`rounded-full px-3 py-1 text-[11px] font-black ${
          good ? "bg-emerald-600/10 text-emerald-700" : "bg-yellow-300/60 text-slate-900"
        }`}
      >
        {status}
      </span>
    </div>
  );
}

function MiniStat({ v, l }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-gradient-to-b from-white to-emerald-50 px-3 py-2">
      <p className="text-sm font-black text-slate-900">{v}</p>
      <p className="text-[11px] font-bold text-slate-600">{l}</p>
    </div>
  );
}
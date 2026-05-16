import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp, fade, stagger, LinkCard } from "./LandingSharedUI";

// The top banner section of the landing page
export default function HeroSection({ scrollToId }) {
  return (
    <section id="home" className="mx-auto max-w-6xl px-4 pt-10">
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger}
        className="relative overflow-hidden rounded-[34px] border border-black/5 bg-white shadow-[0_18px_70px_rgba(0,0,0,0.08)]"
      >
        {/* Background blurred color accents */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
          <div className="absolute left-1/3 top-1/2 h-56 w-56 rounded-full bg-yellow-300/25 blur-3xl" />
        </div>

        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
          
          {/* Left Text Content */}
          <div className="space-y-5">
            <motion.h1 variants={fadeUp} className="text-4xl font-extrabold leading-tight sm:text-5xl">
              Your career starts with a <span className="text-emerald-700">smart learning path</span>.
            </motion.h1>

            <motion.p variants={fadeUp} className="max-w-xl text-sm text-slate-600 sm:text-base">
              EduPath is a modern learning platform with AI career guidance, qualified educators, and special sessions with industry experts.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/signup" className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow hover:brightness-95 text-center">
                Start free
              </Link>
              <button onClick={() => scrollToId("courses")} className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-bold text-slate-900 hover:bg-black/5">
                Explore courses
              </button>
            </motion.div>
          </div>

          {/* Right Action Cards */}
          <motion.div variants={fade} className="relative">
            <div className="rounded-[28px] border border-black/5 bg-white p-4 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
              <div className="grid gap-3 sm:grid-cols-2">
                <LinkCard to="/path-finder" title="AI Path Finder" subtitle="Answer questions → get matches" badge="AI" icon="🧭" bg="bg-gradient-to-br from-emerald-50 to-white" />
                <LinkCard to="/courses" title="Verified Courses" subtitle="Reviewed for quality" badge="QC" icon="✅" bg="bg-gradient-to-br from-teal-50 to-white" />
                <LinkCard to="/mentor" title="Mentor Support" subtitle="Request 1:1 guidance" badge="PRO" icon="🧑‍🏫" bg="bg-gradient-to-br from-yellow-50 to-white" />
                <LinkCard to="/dashboard" title="My Learning" subtitle="Track progress & milestones" badge="GO" icon="📈" bg="bg-gradient-to-br from-slate-50 to-white" />
              </div>
            </div>
          </motion.div>
          
        </div>
      </motion.div>
    </section>
  );
}
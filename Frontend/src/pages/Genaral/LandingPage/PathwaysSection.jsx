import React from "react";
import { motion } from "framer-motion";
import { fadeUp, fade, stagger, PathCard, MiniRow } from "./LandingSharedUI";

// Section explaining career pathways
export default function PathwaysSection({ scrollToId }) {
  return (
    <section id="pathways" className="mx-auto max-w-6xl px-4 py-12">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
      >
        {/* Pathway Examples */}
        <div className="space-y-4">
          <motion.p variants={fadeUp} className="text-xs font-extrabold text-emerald-700">CAREER PATHWAYS</motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl font-extrabold sm:text-4xl">Build your future with job-ready learning pathways</motion.h2>
          <motion.p variants={fadeUp} className="max-w-2xl text-sm text-slate-600 sm:text-base">
            EduPath uses AI to suggest the best career direction for you. Once you choose a goal, we guide you step-by-step.
          </motion.p>

          <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-2">
            <PathCard title="UI/UX Designer" points={["Design fundamentals", "Figma projects"]} accent="emerald" />
            <PathCard title="Full-Stack Developer" points={["Frontend + backend", "Deploy real apps"]} accent="teal" />
            <PathCard title="Data Analyst" points={["Excel → SQL", "Dashboards"]} accent="yellow" />
            <PathCard title="Cybersecurity Basics" points={["Security mindset", "Hands-on labs"]} accent="slate" />
          </motion.div>
        </div>

        {/* Why Pathways Matter Details */}
        <motion.div variants={fade} className="rounded-[30px] border border-black/5 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
          <p className="text-sm font-extrabold">Why pathways matter</p>
          <p className="mt-2 text-sm text-slate-600">
            A clear pathway removes confusion and tells you exactly what to learn next, in the right order.
          </p>

          <div className="mt-5 space-y-3">
            <MiniRow icon="🧠" title="Less confusion" text="Know what to learn next, step-by-step." />
            <MiniRow icon="🎯" title="Clear goals" text="Milestones + projects to track improvement." />
            <MiniRow icon="⏱️" title="Save time" text="No more jumping between random tutorials." />
          </div>

          <button onClick={() => scrollToId("contact")} className="mt-6 w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow hover:brightness-95">
            Ask about pathways
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
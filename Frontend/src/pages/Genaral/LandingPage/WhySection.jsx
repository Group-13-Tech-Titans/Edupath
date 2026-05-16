import React from "react";
import { motion } from "framer-motion";
import { fadeUp, fade, stagger, MiniRow } from "./LandingSharedUI";

// Section explaining why users should choose EduPath
export default function WhySection() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-4 pb-14">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Left Side: Illustration Image */}
        <motion.div variants={fadeUp} className="rounded-[30px] border border-black/5 bg-white p-7 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
          <img src="/landingImages/Img1.png" alt="Landing Preview" className="w-full rounded-xl" />
        </motion.div>

        {/* Right Side: Features List */}
        <motion.div variants={fade} className="rounded-[30px] border border-black/5 bg-white p-7 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
          <p className="text-sm font-extrabold">What you’ll get</p>
          <div className="mt-4 space-y-3">
            <MiniRow icon="✅" title="Verified & approved courses" text="Reviewer checks content quality before it goes live." />
            <MiniRow icon="🧭" title="AI Path Finder recommendations" text="Get multiple best-fit career paths based on your profile." />
            <MiniRow icon="🧩" title="Stepstones + quizzes + milestones" text="Learn in the right order and prove progress with tasks and tests." />
            <MiniRow icon="🤝" title="Mentor support (Premium)" text="Request 1:1 sessions with industry experts and get guidance whenever you’re stuck." />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
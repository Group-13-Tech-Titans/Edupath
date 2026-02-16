import React from "react";
import { motion } from "framer-motion";

// 1. Define your animation variants
const stagger = {
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// 2. Define the sub-components used in the form
const ContactPill = ({ icon, title, text }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-slate-50 p-3">
    <span className="text-xl">{icon}</span>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      <p className="text-xs font-semibold text-slate-700">{text}</p>
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-xs font-extrabold text-slate-700">{label}</label>
    <input
      {...props}
      className="mt-1 w-full rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300 transition-all"
    />
  </div>
);

export default function ContactForm({ onNav }) {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 pb-12">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="rounded-[34px] border border-black/5 bg-white p-6 shadow-[0_18px_70px_rgba(0,0,0,0.08)] sm:p-10"
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="space-y-3">
            <motion.p variants={fadeUp} className="text-xs font-extrabold text-emerald-700">
              CONTACT US
            </motion.p>
            <motion.h4 variants={fadeUp} className="text-3xl font-extrabold">
              Need help choosing a path?
            </motion.h4>
            <motion.p variants={fadeUp} className="text-sm text-slate-600">
              Ask us about pathways, course publishing, reviews, mentoring, or subscriptions.
              We’ll respond with clear guidance and next steps.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-4 grid gap-3 sm:grid-cols-2">
              <ContactPill icon="📍" title="Location" text="Sri Lanka" />
              <ContactPill icon="📧" title="Email" text="support@edupath.app" />
              <ContactPill icon="⏰" title="Hours" text="24/7 Learning Access" />
              <ContactPill icon="💬" title="Support" text="Fast response" />
            </motion.div>
          </div>

          <motion.form
            variants={fadeUp}
            className="rounded-[26px] border border-black/5 bg-gradient-to-b from-emerald-50 to-white p-5 sm:p-6"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Full name" placeholder="Your name" />
              <Input label="Email" placeholder="you@email.com" type="email" />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input label="I am a..." placeholder="Student / Educator / Parent" />
              <Input label="Topic" placeholder="Pathways / Courses / Mentoring" />
            </div>
            <div className="mt-3">
              <label className="text-xs font-extrabold text-slate-700">Message</label>
              <textarea
                className="mt-1 h-28 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="Tell us what you need…"
              />
            </div>

            <button
              type="submit"
              className="mt-4 w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white shadow hover:bg-emerald-700 transition-colors"
            >
              Send message
            </button>
          </motion.form>
        </div>
      </motion.div>
    </section>
  );
}
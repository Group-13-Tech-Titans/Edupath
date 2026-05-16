import React from "react";
import { motion } from "framer-motion";
import { fadeUp, stagger, ContactPill, Input } from "./LandingSharedUI";

// Contact form and information section
export default function ContactSection() {
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
          
          {/* Left Side: Contact Details */}
          <div className="space-y-3">
            <motion.p variants={fadeUp} className="text-xs font-extrabold text-emerald-700">
              CONTACT US
            </motion.p>
            <motion.h4 variants={fadeUp} className="text-3xl font-extrabold">
              Need help choosing a path?
            </motion.h4>
            <motion.p variants={fadeUp} className="text-sm text-slate-600">
              Ask us about pathways, course publishing, reviews, mentoring, or subscriptions. We’ll respond with clear guidance and next steps.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-4 grid gap-3 sm:grid-cols-2">
              <ContactPill icon="📍" title="Location" text="Sri Lanka" />
              <ContactPill icon="📧" title="Email" text="support@edupath.app" />
              <ContactPill icon="⏰" title="Hours" text="24/7 Learning Access" />
              <ContactPill icon="💬" title="Support" text="Fast response" />
            </motion.div>
          </div>

          {/* Right Side: Contact Form */}
          {/* <motion.form
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
              type="button"
              className="mt-4 w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white shadow hover:brightness-95"
            >
              Send message
            </button>
          </motion.form> */}
          
        </div>
      </motion.div>
    </section>
  );
}
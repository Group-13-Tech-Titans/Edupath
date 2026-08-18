import React from "react";
import { motion } from "framer-motion";
import { fadeUp, fade, stagger } from "./LandingSharedUI";
import { GraduationCap, CheckCircle, Compass, Puzzle, HeartHandshake } from "lucide-react";
import whyImage from "../../../assets/images/why-section-img.png";

// Clean feature item
function FeatureRow({ icon, title, text }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#eefaf6] text-2xl text-emerald-600">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-bold text-slate-900">{title}</h4>
        <p className="mt-1 text-sm text-slate-500 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

// Section explaining why users should choose EduPath
export default function WhySection() {
  return (
    <section id="why" className="bg-white px-4 py-20 sm:px-6 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-[1300px]">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16"
        >
          {/* Left Side: Modern Stock Photo */}
          <motion.div variants={fade} className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-tr from-emerald-100 to-teal-50 opacity-50 blur-2xl" />
            <img 
              src={whyImage} 
              alt="Students collaborating" 
              className="relative w-full rounded-[40px]"
            />

          </motion.div>

          {/* Right Side: Features */}
          <div className="order-1 lg:order-2">
            <motion.p variants={fadeUp} className="text-sm font-bold tracking-wider text-[#2b9d62] uppercase mb-3">
              Why EduPath
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl mb-6">
              Learn smarter, not harder. <br className="hidden sm:block"/> We guarantee results.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-slate-500 mb-10">
              Stop wandering through endless tutorials. We provide curated, expert-reviewed content structured into definitive career paths.
            </motion.p>

            <motion.div variants={fadeUp} className="space-y-8">
              <FeatureRow 
                icon={<CheckCircle className="h-6 w-6" />} 
                title="Verified & Approved Courses" 
                text="Every course is heavily scrutinized by reviewers before publishing to ensure high quality." 
              />
              <FeatureRow 
                icon={<Compass className="h-6 w-6" />} 
                title="AI Path Finder Recommendations" 
                text="Get customized learning recommendations based on your goals and current skill level." 
              />
              <FeatureRow 
                icon={<Puzzle className="h-6 w-6" />} 
                title="Stepstones & Milestones" 
                text="Follow a structured journey with quizzes and assignments that prove your competency." 
              />
              <FeatureRow 
                icon={<HeartHandshake className="h-6 w-6" />} 
                title="1:1 Mentor Support (Premium)" 
                text="Stuck? Request a live session with industry experts to get past any hurdle quickly." 
              />
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
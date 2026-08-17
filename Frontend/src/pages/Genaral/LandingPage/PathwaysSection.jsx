import React from "react";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "./LandingSharedUI";
import { Palette, Monitor, BarChart, Shield } from "lucide-react";

// Modern Pathway Card for a cleaner look
function ModernPathCard({ title, icon, points, colorClass, bgClass }) {
  return (
    <div className="flex flex-col h-full rounded-[30px] border border-black/5 bg-white p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
      <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${bgClass} ${colorClass} text-2xl`}>
        {icon}
      </div>
      <h3 className="mb-4 text-xl font-extrabold text-slate-800">{title}</h3>
      <ul className="mt-auto space-y-3">
        {points.map((p, i) => (
          <li key={i} className="flex items-start text-sm text-slate-600">
            <span className={`mr-3 mt-1.5 inline-flex h-2 w-2 flex-shrink-0 rounded-full ${colorClass.replace('text-', 'bg-')}`} />
            <span className="leading-relaxed font-medium">{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Section explaining career pathways
export default function PathwaysSection({ scrollToId }) {
  return (
    <section id="pathways" className="bg-white px-4 py-20 sm:px-6 lg:px-12 lg:py-28 relative">
      <div className="mx-auto max-w-[1300px] relative z-10">
        <div className="text-center mb-16">
          <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-sm font-bold tracking-wider text-[#2b9d62] uppercase mb-3">
            Career Pathways
          </motion.p>
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-5xl mb-6">
            Build your future with <br className="hidden sm:block"/> job-ready learning paths
          </motion.h2>
          <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto max-w-2xl text-lg text-slate-500">
            EduPath uses AI to suggest the best career direction for you. Once you choose a goal, we provide a clear, step-by-step roadmap so you know exactly what to learn next.
          </motion.p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={fadeUp} className="h-full">
            <ModernPathCard 
              title="UI/UX Designer" 
              icon={<Palette className="h-7 w-7" />} 
              points={["Design fundamentals", "Figma mastery", "User research"]} 
              colorClass="text-emerald-600" 
              bgClass="bg-emerald-50" 
            />
          </motion.div>
          <motion.div variants={fadeUp} className="h-full">
            <ModernPathCard 
              title="Full-Stack Developer" 
              icon={<Monitor className="h-7 w-7" />} 
              points={["Frontend & Backend", "Database design", "Deploy real apps"]} 
              colorClass="text-blue-600" 
              bgClass="bg-blue-50" 
            />
          </motion.div>
          <motion.div variants={fadeUp} className="h-full">
            <ModernPathCard 
              title="Data Analyst" 
              icon={<BarChart className="h-7 w-7" />} 
              points={["Excel to SQL", "Data visualization", "Building dashboards"]} 
              colorClass="text-purple-600" 
              bgClass="bg-purple-50" 
            />
          </motion.div>
          <motion.div variants={fadeUp} className="h-full">
            <ModernPathCard 
              title="Cybersecurity" 
              icon={<Shield className="h-7 w-7" />} 
              points={["Security mindset", "Network defense", "Hands-on labs"]} 
              colorClass="text-orange-600" 
              bgClass="bg-orange-50" 
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
import React from "react";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "./LandingSharedUI";
import { 
  Palette, Monitor, BarChart, Shield, Cloud, Smartphone, 
  Gamepad2, Settings, Link as LinkIcon, Brain, Briefcase, Megaphone 
} from "lucide-react";

// Modern Pathway Card for a cleaner look
// Modern Pathway Card for a cleaner look
function ModernPathCard({ title, icon, points, colorClass, bgClass, dotClass }) {
  return (
    <div className="flex flex-col h-full rounded-[30px] border border-black/5 bg-white p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
      <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${bgClass} ${colorClass} text-2xl`}>
        {icon}
      </div>
      <h3 className="mb-4 text-xl font-extrabold text-slate-800">{title}</h3>
      <ul className="mt-auto space-y-3">
        {points.map((p, i) => (
          <li key={i} className="flex items-center text-sm text-slate-600">
            <span className={`mr-3 inline-flex h-2 w-2 flex-shrink-0 rounded-full ${dotClass}`} />
            <span className="leading-relaxed font-medium">{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const pathwaysData = [
  {
    title: "UI/UX Designer",
    icon: <Palette className="h-7 w-7" />,
    points: ["Design fundamentals", "Figma mastery", "User research"],
    colorClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
    dotClass: "bg-emerald-600"
  },
  {
    title: "Full-Stack Developer",
    icon: <Monitor className="h-7 w-7" />,
    points: ["Frontend & Backend", "Database design", "Deploy real apps"],
    colorClass: "text-blue-600",
    bgClass: "bg-blue-50",
    dotClass: "bg-blue-600"
  },
  {
    title: "Data Analyst",
    icon: <BarChart className="h-7 w-7" />,
    points: ["Excel to SQL", "Data visualization", "Building dashboards"],
    colorClass: "text-purple-600",
    bgClass: "bg-purple-50",
    dotClass: "bg-purple-600"
  },
  {
    title: "Cybersecurity",
    icon: <Shield className="h-7 w-7" />,
    points: ["Security mindset", "Network defense", "Hands-on labs"],
    colorClass: "text-orange-600",
    bgClass: "bg-orange-50",
    dotClass: "bg-orange-600"
  },
  {
    title: "Cloud Engineer",
    icon: <Cloud className="h-7 w-7" />,
    points: ["AWS & Azure", "Cloud architecture", "Serverless basics"],
    colorClass: "text-cyan-600",
    bgClass: "bg-cyan-50",
    dotClass: "bg-cyan-600"
  },
  {
    title: "Mobile App Developer",
    icon: <Smartphone className="h-7 w-7" />,
    points: ["iOS & Android", "React Native", "App deployment"],
    colorClass: "text-pink-600",
    bgClass: "bg-pink-50",
    dotClass: "bg-pink-600"
  },
  {
    title: "Game Developer",
    icon: <Gamepad2 className="h-7 w-7" />,
    points: ["Game logic", "Unity 3D Engine", "Asset management"],
    colorClass: "text-red-600",
    bgClass: "bg-red-50",
    dotClass: "bg-red-600"
  },
  {
    title: "DevOps Engineer",
    icon: <Settings className="h-7 w-7" />,
    points: ["CI/CD pipelines", "Docker & K8s", "Infrastructure as Code"],
    colorClass: "text-slate-600",
    bgClass: "bg-slate-50",
    dotClass: "bg-slate-600"
  },
  {
    title: "Blockchain Dev",
    icon: <LinkIcon className="h-7 w-7" />,
    points: ["Web3 concepts", "Smart contracts", "DApp development"],
    colorClass: "text-yellow-600",
    bgClass: "bg-yellow-50",
    dotClass: "bg-yellow-600"
  },
  {
    title: "AI/ML Engineer",
    icon: <Brain className="h-7 w-7" />,
    points: ["Machine learning", "Neural networks", "Python for AI"],
    colorClass: "text-indigo-600",
    bgClass: "bg-indigo-50",
    dotClass: "bg-indigo-600"
  },
  {
    title: "Product Manager",
    icon: <Briefcase className="h-7 w-7" />,
    points: ["Agile scoping", "Roadmap planning", "User metrics"],
    colorClass: "text-teal-600",
    bgClass: "bg-teal-50",
    dotClass: "bg-teal-600"
  },
  {
    title: "Digital Marketer",
    icon: <Megaphone className="h-7 w-7" />,
    points: ["SEO & SEM", "Social media strategy", "Content creation"],
    colorClass: "text-rose-600",
    bgClass: "bg-rose-50",
    dotClass: "bg-rose-600"
  }
];

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
          {pathwaysData.map((pathway, index) => (
            <motion.div key={index} variants={fadeUp} className="h-full">
              <ModernPathCard 
                title={pathway.title} 
                icon={pathway.icon} 
                points={pathway.points} 
                colorClass={pathway.colorClass} 
                bgClass={pathway.bgClass}
                dotClass={pathway.dotClass}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
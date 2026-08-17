import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp, fade, stagger } from "./LandingSharedUI";
import { Star } from "lucide-react";

export default function HeroSection({ scrollToId }) {
  return (
    <section id="home" className="snap-start relative min-h-[calc(100vh-64px)] w-full overflow-x-clip bg-[#eefaf6] px-4 py-10 sm:px-6 lg:px-12 lg:py-12 flex items-center">
      
      <div className="relative mx-auto w-full max-w-[1300px]">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-8"
        >
          
          {/* ================= LEFT CONTENT COLUMN ================= */}
          <div className="flex flex-col items-start space-y-5 lg:space-y-6 relative z-10 pt-10 lg:pt-0">
            
            <motion.div variants={fadeUp} className="relative inline-block">
              <span className="text-emerald-600 font-semibold tracking-wide text-lg lg:text-xl">
                Start your favourite course
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              variants={fadeUp} 
              className="max-w-2xl text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl lg:text-5xl xl:text-[3.8rem] xl:leading-[1.15] xl:pr-10"
            >
              Now learning from anywhere, and build your <span className="relative inline-block text-emerald-600 font-bold">
                bright
              </span>{" "}
              <span className="relative inline-block text-emerald-600 font-bold mt-1 lg:mt-2">
                career.
                <div className="absolute -bottom-2 left-0 w-full h-3 text-emerald-600">
                   <svg viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-full">
                     <path d="M5 10 Q 100 20 195 5" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                   </svg>
                </div>
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              variants={fadeUp} 
              className="max-w-md text-base leading-relaxed text-slate-500 sm:text-lg mt-4 lg:mt-6"
            >
              It has survived not only five centuries but also the leap into electronic typesetting.
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              variants={fadeUp} 
              className="flex w-full flex-col pt-6 sm:w-auto sm:flex-row lg:pt-8"
            >
              <Link 
                to="/signup" 
                className="flex items-center justify-center rounded-xl bg-[#2b9d62] px-8 py-4 text-lg font-bold text-white shadow-[0_10px_20px_rgba(43,157,98,0.25)] transition-transform hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(43,157,98,0.35)]"
              >
                Try It Free
              </Link>
            </motion.div>

          </div>

          {/* ================= RIGHT HERO VISUAL ================= */}
          <motion.div variants={fade} className="relative flex justify-center pb-10 lg:pb-0 lg:ml-10 z-0">
            
            <div className="relative w-full max-w-[480px] lg:max-w-none flex justify-center mt-10 lg:mt-0">

              {/* FLOATING BADGE 1: Courses (Middle Left) */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 lg:-left-28 top-1/3 z-30"
              >
                <div className="relative">
                  <div className="flex flex-col items-center justify-center h-[130px] w-[130px] rounded-full bg-[#328e5d] text-white shadow-2xl border-4 border-white">
                     <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                     <span className="text-2xl font-bold tracking-tight">1,235</span>
                     <span className="text-xs font-medium">courses</span>
                  </div>
                  {/* Decorative underline below the circle */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-40 text-emerald-600">
                    <svg viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                       <path d="M5 10 Q 50 20 95 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                       <path d="M15 15 Q 50 22 85 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </motion.div>

              {/* FLOATING BADGE 2: Rating (Top Right) */}
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute right-0 top-0 lg:-right-4 lg:-top-6 z-30 rounded-3xl bg-white px-6 py-4 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-100"
              >
                <div className="flex flex-col items-center">
                   <div className="flex items-center gap-1.5">
                      <span className="text-2xl font-extrabold text-slate-800">4.8</span>
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                   </div>
                   <span className="text-xs font-medium text-slate-500 mt-0.5">Rating (86K)</span>
                </div>
              </motion.div>

              {/* Main Image */}
              <div className="relative z-10 w-full lg:w-[420px]">
                 <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
                  alt="Student learning" 
                  className="w-full h-auto object-cover rounded-[50px] shadow-2xl"
                  style={{
                    aspectRatio: "3/4"
                  }}
                />
              </div>

            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "./LandingSharedUI";

export default function CoursesSection() {
  const featuredCourses = [
    {
      id: 1,
      title: "UI/UX Design Masterclass",
      category: "Design",
      rating: 4.9,
      students: "12k",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 2,
      title: "Full-Stack Web Development",
      category: "Programming",
      rating: 4.8,
      students: "8.5k",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 3,
      title: "Data Science for Beginners",
      category: "Data",
      rating: 4.7,
      students: "5.2k",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600",
    },
  ];

  return (
    <section id="courses" className="bg-[#f8fcfb] px-4 py-20 sm:px-6 lg:px-12 lg:py-28 relative border-y border-slate-100">
      <div className="mx-auto max-w-[1300px] relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-sm font-bold tracking-wider text-[#2b9d62] uppercase mb-3">
              Top Courses
            </motion.p>
            <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Explore our most popular <br className="hidden sm:block"/> featured courses
            </motion.h2>
          </div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <Link to="/signup" className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5 text-base font-bold text-slate-700 transition-all hover:border-[#2b9d62] hover:text-[#2b9d62]">
              Explore All Courses
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {featuredCourses.map((course) => (
            <motion.div key={course.id} variants={fadeUp} className="group flex flex-col overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
              <div className="relative h-56 w-full overflow-hidden">
                <img src={course.image} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-slate-800 shadow-sm">
                  {course.category}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6 lg:p-8">
                <div className="mb-3 flex items-center gap-4 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1"><span className="text-yellow-400 text-lg">★</span> {course.rating}</span>
                  <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    {course.students} students
                  </span>
                </div>
                <h3 className="mb-4 text-xl font-extrabold text-slate-900 line-clamp-2">{course.title}</h3>
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <Link to="/signup" className="text-[#2b9d62] font-bold text-sm inline-flex items-center gap-1 group-hover:underline">
                    View Course
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

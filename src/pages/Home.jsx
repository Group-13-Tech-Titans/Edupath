import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell.jsx";

const Home = () => {
  return (
    <PageShell>
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-12 md:flex-row md:items-start">
        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs text-muted shadow">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            AI-powered learning paths tailored to you
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-text-dark sm:text-4xl md:text-5xl">
            Learn your way to a{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              career you love.
            </span>
          </h1>
          <p className="max-w-xl text-sm text-muted sm:text-base">
            EduPath helps students and professionals choose the right courses,
            follow curated pathways, and learn with verified educators and mentors.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/signup" className="btn-primary">
              Get started
            </Link>
            <Link to="/courses" className="btn-outline">
              Browse courses
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-6 text-xs text-muted">
            <div>
              <p className="text-lg font-semibold text-text-dark">50k+</p>
              <p>Learners guided</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-text-dark">100+</p>
              <p>Verified mentors</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-text-dark">95%</p>
              <p>Satisfaction score</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="mt-4 flex-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="glass-card p-5">
            <p className="text-sm font-medium text-text-dark">
              Pathway suggestions
            </p>
            <p className="mt-1 text-xs text-muted">
              Answer a few questions and we&apos;ll recommend a learning path.
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-primary/5 px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Web Developer Path</p>
                  <p className="text-xs text-muted">HTML, CSS, JS, React</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs text-primary shadow">
                  Beginner
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-secondary/5 px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Data Science Path</p>
                  <p className="text-xs text-muted">Python, pandas, ML</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs text-secondary shadow">
                  In demand
                </span>
              </div>
            </div>
            <Link
              to="/signup"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-text-dark px-4 py-2 text-sm font-medium text-white hover:bg-text-dark/90"
            >
              Start path selector
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl px-4 py-8">
        <h2 className="text-xl font-semibold text-text-dark">How EduPath works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "1. Choose a path",
              desc: "Tell us your goals and background. We recommend a curated roadmap."
            },
            {
              title: "2. Learn with mentors",
              desc: "Follow structured courses taught by verified educators and mentors."
            },
            {
              title: "3. Track your progress",
              desc: "Complete lessons, unlock milestones, and keep a study streak."
            }
          ].map((item) => (
            <div
              key={item.title}
              className="glass-card p-4 transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <p className="text-sm font-semibold text-text-dark">{item.title}</p>
              <p className="mt-2 text-xs text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-4 max-w-6xl px-4 pb-16">
        <h2 className="text-xl font-semibold text-text-dark">What learners say</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            "The mentorship calls helped me switch to my first dev role.",
            "I love how the dashboard keeps track of my streak and progress.",
            "The review process ensures course quality stays consistently high."
          ].map((quote, idx) => (
            <div
              key={idx}
              className="glass-card p-4 text-xs text-muted transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <p className="text-sm text-text-dark">★ ★ ★ ★ ★</p>
              <p className="mt-2">{quote}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
};

export default Home;


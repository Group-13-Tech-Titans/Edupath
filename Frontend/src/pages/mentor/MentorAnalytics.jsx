import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

export default function MentorAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: [],
    monthlyVolume: [],
    tracksDistribution: []
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/mentor/analytics", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const maxSessions = useMemo(() => {
    if (!data.monthlyVolume.length) return 1;
    return Math.max(...data.monthlyVolume.map(m => m.count)) || 1;
  }, [data.monthlyVolume]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-emerald-200 to-teal-300">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-200 to-teal-300 p-5 font-sans text-slate-800">
      {/* Header */}
      <header className="mb-5 flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <EduPathLogo />
          <span>EduPath</span>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
          <Link to="/MentorDashboard" className="font-medium text-slate-800 transition-colors hover:text-teal-500">Dashboard</Link>
          <Link to="/MentorStudents"  className="font-medium text-slate-800 transition-colors hover:text-teal-500">My Students</Link>
          <Link to="/MentorSessions"  className="font-medium text-slate-800 transition-colors hover:text-teal-500">Sessions</Link>
          <Link to="/MentorResources" className="font-medium text-slate-800 transition-colors hover:text-teal-500">Resources</Link>
          <Link to="/MentorMessages"  className="font-medium text-slate-800 transition-colors hover:text-teal-500">Messages</Link>
          <Link to="/MentorProfile"   className="font-medium text-slate-800 transition-colors hover:text-teal-500">Profile</Link>
        </nav>

        <div className="w-[150px] flex justify-end">
          <button type="button" onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white">
            <LogoutIcon /> Logout
          </button>
        </div>
      </header>

      {/* Page Title Section with Integrated Back Button */}
      <section className="mb-5 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Mentoring Analytics</h1>
            <p className="text-sm text-slate-500 font-medium">Tracking your impact and growth as a mentor</p>
          </div>
          <button 
            onClick={() => navigate("/MentorDashboard")} 
            className="inline-flex w-fit items-center gap-2 rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-bold text-teal-600 transition hover:bg-teal-400 hover:text-white shadow-sm"
          >
            <BackIcon /> Back to Dashboard
          </button>
        </div>
      </section>

      {/* Stats - Dynamic */}
      <section className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((s, idx) => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition hover:-translate-y-1"
          >
            <div className="mb-2 text-sm text-slate-500">{s.label}</div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{s.value}</div>
            <div className="text-[11px] font-bold text-teal-500 bg-teal-50 inline-block px-2 py-1 rounded-md">
              {s.trend}
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Session Activity Graph - Dynamic */}
        <section className="lg:col-span-2 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Monthly Session Volume</h2>
            <div className="text-xs font-bold text-slate-400 border border-slate-200 px-3 py-1 rounded-lg">Last 6 Months</div>
          </div>

          <div className="relative h-60 w-full flex items-end justify-between gap-4 pt-5 px-2">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03]">
              {[0, 1, 2, 3].map(i => <div key={i} className="w-full border-t border-slate-900"></div>)}
            </div>

            {data.monthlyVolume.map((m, idx) => (
              <div key={m.month} className="relative flex-1 flex flex-col items-center group h-full justify-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(m.count / maxSessions) * 100}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.05 }}
                  className="w-full max-w-[32px] rounded-t-lg bg-teal-400 relative shadow-sm transition hover:bg-teal-500"
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md font-bold whitespace-nowrap shadow-lg">
                    {m.count} Sessions
                  </div>
                </motion.div>
                <div className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.month}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Tracks Distribution - Dynamic */}
        <section className="rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <h2 className="mb-8 text-xl font-semibold text-slate-800">Learning Tracks</h2>
          <div className="space-y-6">
            {data.tracksDistribution.length > 0 ? data.tracksDistribution.map((t, idx) => (
              <div key={t.name}>
                <div className="mb-2 flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-700">{t.name}</span>
                  <span className="text-xs font-bold text-slate-400">{t.percent}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-50 overflow-hidden border border-slate-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${t.percent}%` }}
                    transition={{ duration: 1, delay: 0.3 + idx * 0.1 }}
                    className={`h-full ${idx % 2 === 0 ? 'bg-teal-400' : 'bg-emerald-400'} rounded-full`}
                  />
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400 text-center py-10">No student tracks data available</p>
            )}
          </div>
        </section>

        {/* Weekly Heatmap - (Keeping mock for now as it needs complex session time processing) */}
        <section className="lg:col-span-3 rounded-2xl bg-white p-7 shadow-[0_4px_20_rgba(0,0,0,0.08)]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Weekly Activity Heatmap</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Activity Patterns</p>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="w-16"></div>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="flex-1 text-center text-[10px] font-bold text-slate-400 uppercase">{d}</div>
              ))}
            </div>
            {[9, 11, 13, 15, 17, 19].map(hour => (
              <div key={hour} className="flex gap-2 items-center">
                <div className="w-16 text-right text-[10px] font-bold text-slate-400">{hour}:00</div>
                {[1, 2, 3, 4, 5, 6, 7].map(day => {
                  // Simplified random heatmap to maintain visual interest
                  const intensity = Math.random();
                  const color = intensity > 0.8 ? 'bg-teal-500' : intensity > 0.5 ? 'bg-teal-300' : intensity > 0.2 ? 'bg-teal-100' : 'bg-slate-50';
                  return (
                    <motion.div 
                      key={day} whileHover={{ scale: 1.05 }}
                      className={`flex-1 h-8 rounded-md ${color} transition cursor-help relative group`}
                    >
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Standard Dashboard Footer */}
      <footer className="mt-6 rounded-2xl bg-white px-7 py-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <div className="mb-3 flex items-center gap-2 text-xl font-bold text-slate-800">
                <EduPathLogo /><span>EduPath</span>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-slate-600 font-medium">
                Empowering learners worldwide with premium mentorship, personalized learning paths, and high-impact educational resources.
              </p>
              <div className="flex gap-4">
                <SocialIcon><FacebookIcon /></SocialIcon>
                <SocialIcon><TwitterIcon /></SocialIcon>
                <SocialIcon><LinkedInIcon /></SocialIcon>
                <SocialIcon><InstagramIcon /></SocialIcon>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-16">
              <FooterCol title="Quick Links" links={[
                { label: "Mentor Dashboard", href: "/MentorDashboard" },
                { label: "My Students", href: "/MentorStudents" },
                { label: "Sessions", href: "/MentorSessions" }
              ]} />
              <FooterCol title="Support" links={[
                { label: "Help Center", href: "#" },
                { label: "Contact Us", href: "#" },
                { label: "Mentor Guidelines", href: "#" }
              ]} />
              <FooterCol title="Legal" links={[
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Cookie Policy", href: "#" }
              ]} />
            </div>
          </div>
          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-[11px] font-bold text-slate-400 tracking-wide uppercase">© 2026 EDUPATH • EMPOWERING FUTURE TALENT</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── UI Components ────────────────────────────────────────────── */
function EduPathLogo() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none">
      <circle cx="20" cy="20" r="18" fill="#5DD9C1" opacity="0.2" />
      <path d="M20 8L12 12L20 16L28 12L20 8Z" fill="#5DD9C1" />
      <path d="M12 20L20 24L28 20" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 26L20 30L28 26" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2" fill="#5DD9C1" />
    </svg>
  );
}
function LogoutIcon()   { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>; }
function BackIcon()     { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>; }
function FacebookIcon()  { return <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M22 12.073C22 6.504 17.523 2 12 2S2 6.504 2 12.073c0 5.016 3.657 9.175 8.438 9.927v-7.025H7.898v-2.902h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.095 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.562v1.874h2.773l-.443 2.902h-2.33V22C18.343 21.248 22 17.089 22 12.073z" /></svg>; }
function TwitterIcon()   { return <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 8.09V9a10.66 10.66 0 01-9-4.5s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>; }
function LinkedInIcon()  { return <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.984V9h3.108v1.561h.046c.433-.82 1.494-1.684 3.074-1.684 3.287 0 3.894 2.164 3.894 4.977v6.598zM5.337 7.433a1.96 1.96 0 110-3.92 1.96 1.96 0 010 3.92zM6.919 20.452H3.756V9h3.163v11.452z" /></svg>; }
function InstagramIcon() { return <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M7 2C4.8 2 3 3.8 3 6v12c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4V6c0-2.2-1.8-4-4-4H7zm5 5a5 5 0 110 10 5 5 0 010-10zm6.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0zM12 9a3 3 0 100 6 3 3 0 000-6z" /></svg>; }

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-800">{title}</h4>
      <div className="flex flex-col gap-2">
        {links.map((l) => <a key={l.label} href={l.href} className="text-sm text-slate-500 hover:text-teal-500">{l.label}</a>)}
      </div>
    </div>
  );
}
function SocialIcon({ children }) {
  return <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-[#D9F3EC] text-[#5DD9C1] transition hover:bg-[#5DD9C1] hover:text-white">{children}</button>;
}

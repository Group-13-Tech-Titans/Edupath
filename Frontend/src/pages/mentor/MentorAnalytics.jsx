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
    <>
      {/* Page Title Section with Integrated Back Button */}
      <section className="mb-5 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Mentoring Analytics</h1>
            <p className="text-sm text-slate-500 font-medium">Tracking your impact and growth as a mentor</p>
          </div>
          <button
            onClick={() => navigate("/mentor")}
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
    </>
  );
}

/* ── UI Components ────────────────────────────────────────────── */
function BackIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>; }

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentGrowthChart() {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [timeRange, setTimeRange] = useState("6m");

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const token = localStorage.getItem("edupath_token");
        const res = await axios.get(`${API_URL}/api/auth/admin/stats/students-growth?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setChartData(res.data.data || []); 
      } catch (error) {
        console.error("Error loading chart data:", error);
        setError(true); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]); 

  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Student Registration Growth</h2>
          <p className="text-xs text-slate-500 mt-1">Number of new students joined over the selected period.</p>
        </div>
        
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 shadow-sm cursor-pointer"
        >
          {/* 🟢 NEW: Added 1 Day Option */}
          <option value="1d">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="3m">Last 3 Months</option>
          <option value="6m">Last 6 Months</option>
          <option value="1y">Last 1 Year</option>
        </select>
      </div>

      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center text-slate-400 animate-pulse text-sm font-semibold">
          Loading Chart Data...
        </div>
      ) : error ? (
        <div className="h-[300px] flex items-center justify-center text-red-500 text-sm font-semibold bg-red-50 rounded-2xl">
          Failed to load chart data. Check server connection.
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-[300px] flex flex-col items-center justify-center text-slate-500 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2 text-slate-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
          </svg>
          No student registrations in this period.
        </div>
      ) : (
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              
              <YAxis 
                allowDecimals={false} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                dx={-10}
              />
              
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              />

              <Area 
                type="monotone" 
                dataKey="Students" 
                stroke="#10b981" 
                strokeWidth={3}
                fill="#10b981" 
                fillOpacity={0.2} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
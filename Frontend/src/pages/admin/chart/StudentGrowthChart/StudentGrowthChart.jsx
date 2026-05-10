import React, { useEffect, useState } from "react";
import axios from "axios";

import ChartHeader from "./ChartHeader";
import ChartArea from "./ChartArea";
import { ChartLoading, ChartError, ChartEmpty } from "./ChartFeedback";

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
        const res = await axios.get(`${API_URL}/api/admin/stats/students-growth?range=${timeRange}`, {
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
      
      <ChartHeader timeRange={timeRange} setTimeRange={setTimeRange} />

      {/* Render Logic */}
      {isLoading ? (
        <ChartLoading />
      ) : error ? (
        <ChartError />
      ) : chartData.length === 0 ? (
        <ChartEmpty />
      ) : (
        <ChartArea data={chartData} />
      )}
      
    </div>
  );
}
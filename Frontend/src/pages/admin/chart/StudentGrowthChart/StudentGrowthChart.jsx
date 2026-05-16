import React, { useEffect, useState } from "react";
import axios from "axios";

import ChartHeader from "./ChartHeader"; //import the header component
import ChartArea from "./ChartArea"; //import the area chart component
import { ChartLoading, ChartError, ChartEmpty } from "./ChartFeedback"; //import the feedback components for loading, error, and empty states

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; //call

export default function StudentGrowthChart() {
  const [chartData, setChartData] = useState([]); //state to hold the chart data
  const [isLoading, setIsLoading] = useState(true); //track loading state
  const [error, setError] = useState(false); //track error state
  const [timeRange, setTimeRange] = useState("6m"); //store the selected time period (default to last 6 months)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true); // start loading
      setError(false); //reset error state before fetching new data
      try {
        //get user seurity token from browser loal storage 
        const token = localStorage.getItem("edupath_token");
        //fetch student grouwth data ,passing to selected time range 
        const res = await axios.get(`${API_URL}/api/admin/stats/students-growth?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` } //send the token to prove the user logged in
        });
        
        //save the recived data into chartData state
        setChartData(res.data.data || []); 
      } catch (error) {
        console.error("Error loading chart data:", error);
        setError(true);  // If something breaks, show the error screen
      } finally {
        setIsLoading(false); // Stop loading in both success and error cases
      }
    };

    fetchStats();
  }, [timeRange]); // run this again ONLY if 'timeRange' changes

  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur w-full">
      
      {/* Show the header with the title and the time dropdown */}
      <ChartHeader timeRange={timeRange} setTimeRange={setTimeRange} />

      {/* Decide what to show based on the current state */}
      {isLoading ? (
        // If we're loading, show the loading component
        <ChartLoading />
      ) : error ? (
        //something went wrong, show the error component
        <ChartError />
      ) : chartData.length === 0 ? (
        // No data to show, display the empty state component
        <ChartEmpty />
      ) : (
        //show the area chart with the fetched data
        <ChartArea data={chartData} />
      )}
      
    </div>
  );
}
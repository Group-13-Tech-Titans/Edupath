import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"; // Import required chart components from the recharts library


export default function ChartArea({ data }) {
  return (
    <div style={{ width: '100%', height: '300px' }}>
      
      {/* make mobile responsive for different screen sizes */}
      <ResponsiveContainer width="100%" height="100%">
        
        {/* pass the data to the chart and set margins */}
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          
          {/* horizontal dashed lines */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          
          {/* x axis */}
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            dy={10} // adjusts bottom x axis text position (gap between x axis and text)
          />
          
          {/*y axis */}
          <YAxis 
            allowDecimals={false} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            dx={-10} // adjusts left y axis text position (gap between y axis and text)
          />
          
          {/* The popup box that appears when you hover over the chart */}
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
          />

          {/* chart growth line cover area */}
          <Area 
            type="monotone" // Makes the line smooth and curved
            dataKey="Students" // Uses the 'Students' value from the data
            stroke="#10b981" // adc green color for the line
            strokeWidth={3} // The thickness of the line
            fill="#10b981" // The color of the shaded area
            fillOpacity={0.2} // growth line opacity
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
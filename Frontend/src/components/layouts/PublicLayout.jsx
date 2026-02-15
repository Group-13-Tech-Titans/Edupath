import React from "react";
import { Link, Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-200 via-teal-200 to-cyan-200">
      

      <main className="flex-1">
        <Outlet />
      </main>

      
    </div>
  );
};

export default PublicLayout;


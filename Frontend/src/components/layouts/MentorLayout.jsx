import React from "react";
import { Outlet } from "react-router-dom";
import MentorNavbar from "./MentorNavbar.jsx";
import MentorFooter from "./MentorFooter.jsx";

const MentorLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-200 to-teal-300 p-5 font-sans">
      <MentorNavbar />
      
      <main className="flex-1">
        <Outlet />
      </main>

      <MentorFooter />
    </div>
  );
};

export default MentorLayout;

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useApp } from "../../../context/AppProvider.jsx";

import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-teal-100 to-emerald-50">
      
      {/* 1. Top Navigation Bar and Mobile Menu */}
      <AdminHeader />

      {/* 2. Main Content Area (Dynamic pages will render here) */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;
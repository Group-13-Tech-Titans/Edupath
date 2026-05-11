import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useApp } from "../../../context/AppProvider.jsx";

// Import the modularized components
import AdminHeader from "./AdminHeader";
import ChatSidebar from "../../../components/slideChatBar/ChatSidebar.jsx"; 

const AdminLayout = () => {
  // Access global user state from the context
  const { currentUser } = useApp();
  
  // State to manage whether the chat sidebar is visible or not
  const [isChatOpen, setIsChatOpen] = useState(false); 

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-teal-100 to-emerald-50">
      
      {/* 1. Top Navigation Bar and Mobile Menu */}
      <AdminHeader setIsChatOpen={setIsChatOpen} />

      {/* 2. Main Content Area (Dynamic pages will render here) */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      {/* 3. Slide-in Chat Sidebar */}
      {/* It remains hidden until isChatOpen becomes true */}
      <ChatSidebar 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        currentUser={currentUser}
      />
      
    </div>
  );
};

export default AdminLayout;
import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LandingFooter from "../../../components/LandingFooter.jsx";

// Import all separated section components
import LandingHeader from "./LandingHeader";
import HeroSection from "./HeroSection";
import PathwaysSection from "./PathwaysSection";
import CoursesSection from "./CoursesSection";
import WhySection from "./WhySection";
import ContactSection from "./ContactSection";
import ChatBot from "../ChatBot/ChatBot";

// Helper function to smooth scroll to a specific section by its ID
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function LandingBloomPro() {
  const [showChatbot, setShowChatbot] = useState(false);

  const handleScroll = (e) => {
    // Show chatbot after scrolling down roughly half the screen height
    if (e.target.scrollTop > window.innerHeight * 0.5) {
      setShowChatbot(true);
    } else {
      setShowChatbot(false);
    }
  };

  // Navigation menu items setup
  const navItems = useMemo(
    () => [
      { id: "home", label: "Home" },
      { id: "pathways", label: "Pathways" },
      { id: "courses", label: "Courses" },
      { id: "why", label: "Why EduPath" },
      { id: "contact", label: "Contact" },
    ],
    []
  );

  return (
    // Main wrapper
    <div 
      onScroll={handleScroll}
      className="h-screen w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-pt-16 scroll-smooth bg-white text-slate-900 font-sans"
    >
      
      {/* Navigation Header */}
      <LandingHeader nav={navItems} scrollToId={scrollToId} />

      {/* Hero Section (Top Banner) */}
      <HeroSection scrollToId={scrollToId} />

      {/* Pathways Section */}
      <div className="snap-start">
        <PathwaysSection scrollToId={scrollToId} />
      </div>

      {/* Courses Section */}
      <div className="snap-start">
        <CoursesSection />
      </div>

      {/* Why Choose Us Section */}
      <div className="snap-start">
        <WhySection />
      </div>

      {/* Contact Form Section */}
      <div className="snap-start bg-white py-12">
        <ContactSection />
      </div>

      {/* Footer */}
      <div className="snap-start">
        <LandingFooter onNav={scrollToId} />
      </div>

      {/* Floating Chat Bot */}
      <AnimatePresence>
        {showChatbot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <ChatBot />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
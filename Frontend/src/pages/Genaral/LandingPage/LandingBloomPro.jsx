import React, { useMemo } from "react";
import LandingFooter from "../../../components/LandingFooter.jsx";

// Import all separated section components
import LandingHeader from "./LandingHeader";
import HeroSection from "./HeroSection";
import PathwaysSection from "./PathwaysSection";
import WhySection from "./WhySection";
import ContactSection from "./ContactSection";

// Helper function to smooth scroll to a specific section by its ID
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function LandingBloomPro() {
  
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
    // Main wrapper with background gradient
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50 text-slate-900">
      
      {/* Navigation Header */}
      <LandingHeader nav={navItems} scrollToId={scrollToId} />

      {/* Hero Section (Top Banner) */}
      <HeroSection scrollToId={scrollToId} />

      {/* Pathways Section */}
      <PathwaysSection scrollToId={scrollToId} />

      {/* Why Choose Us Section */}
      <WhySection />

      {/* Contact Form Section */}
      <ContactSection />

      {/* Footer */}
      <LandingFooter onNav={scrollToId} />

    </div>
  );
}
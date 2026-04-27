import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MentorRegistrationDetailsModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    expertise: "",
    phone: "",
    bio: "",
    yearsExperience: "",
    socialLinks: {
      linkedin: "",
      github: "",
      twitter: "",
    },
    // Structured Availability
    availabilityWeekdays: "6:00 PM - 9:00 PM",
    availabilitySaturday: "10:00 AM - 2:00 PM",
    availabilitySunday: "Not Available",
    responseTime: "< 24 Hours",
  });

  useEffect(() => {
    if (initialData) {
      const profile = initialData.profile || {};
      setFormData((prev) => ({
        ...prev,
        name: initialData.name || profile.fullName || "",
        expertise: initialData.specializationTag || profile.specializationTag || "",
        phone: profile.contact || "",
        bio: profile.bio || "",
        yearsExperience: profile.yearsExperience || "",
        socialLinks: {
          ...prev.socialLinks,
          linkedin: profile.credentialsLink || "",
        }
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("social_")) {
      const platform = name.split("_")[1];
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Construct the availability array as requested by the user
    const availabilityArray = [
      `Monday - Friday: ${formData.availabilityWeekdays}`,
      `Saturday: ${formData.availabilitySaturday}`,
      `Sunday: ${formData.availabilitySunday}`,
      `Response Time: ${formData.responseTime}`
    ];
    
    onSubmit({
      ...formData,
      availability: availabilityArray,
      expertise: [formData.expertise], // Store as array for backend
      subjectField: formData.expertise, // Also map to subjectField
      title: `${formData.expertise} Mentor`, // Default title
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Complete Your Mentor Profile</h2>
                <p className="mt-1 text-teal-50 opacity-90">
                  Refine your details to help students connect with you.
                </p>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl sm:flex">
                🏅
              </div>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="max-h-[75vh] overflow-y-auto p-8 custom-scrollbar">
            <div className="grid gap-6 sm:grid-cols-2">
              
              {/* --- Section: Basic Information --- */}
              <div className="sm:col-span-2">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                  Basic Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm focus:border-teal-400 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address (Locked)</label>
                    <input
                      type="email"
                      value={initialData?.email || ""}
                      readOnly
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-100 px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm focus:border-teal-400 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">Years of Experience</label>
                    <input
                      type="text"
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleChange}
                      placeholder="e.g. 5+ Years"
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm focus:border-teal-400 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">Expertise (Locked)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.expertise}
                        readOnly
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-100 px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Section: Bio --- */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">Professional Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm focus:border-teal-400 focus:bg-white focus:outline-none transition-all resize-none"
                  placeholder="Tell students about your background and mentoring style..."
                />
              </div>

              {/* --- Section: Availability --- */}
              <div className="sm:col-span-2 rounded-[24px] bg-slate-50 p-6 border border-slate-100">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <svg className="h-4 w-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Availability & Response
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold text-slate-400 uppercase">Monday - Friday</label>
                    <input
                      name="availabilityWeekdays"
                      value={formData.availabilityWeekdays}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-white bg-white px-4 py-2.5 text-sm focus:border-teal-400 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold text-slate-400 uppercase">Saturday</label>
                    <input
                      name="availabilitySaturday"
                      value={formData.availabilitySaturday}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-white bg-white px-4 py-2.5 text-sm focus:border-teal-400 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold text-slate-400 uppercase">Sunday</label>
                    <input
                      name="availabilitySunday"
                      value={formData.availabilitySunday}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-white bg-white px-4 py-2.5 text-sm focus:border-teal-400 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold text-slate-400 uppercase">Response Time</label>
                    <input
                      name="responseTime"
                      value={formData.responseTime}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-white bg-white px-4 py-2.5 text-sm focus:border-teal-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* --- Section: Social Links --- */}
              <div className="sm:col-span-2">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <svg className="h-4 w-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Social Links
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="relative">
                    <input
                      type="url"
                      name="social_linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={handleChange}
                      placeholder="LinkedIn"
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 pl-10 pr-4 py-3 text-sm focus:border-teal-400 focus:bg-white focus:outline-none transition-all"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <LinkedInIcon />
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="url"
                      name="social_github"
                      value={formData.socialLinks.github}
                      onChange={handleChange}
                      placeholder="GitHub"
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 pl-10 pr-4 py-3 text-sm focus:border-teal-400 focus:bg-white focus:outline-none transition-all"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <GitHubIcon />
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="url"
                      name="social_twitter"
                      value={formData.socialLinks.twitter}
                      onChange={handleChange}
                      placeholder="Twitter"
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 pl-10 pr-4 py-3 text-sm focus:border-teal-400 focus:bg-white focus:outline-none transition-all"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <TwitterIcon />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="mt-10 flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border-2 border-slate-100 bg-white px-6 py-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] rounded-2xl bg-teal-400 px-6 py-4 text-sm font-extrabold text-white transition hover:bg-teal-500 shadow-lg shadow-teal-200"
              >
                Launch Mentor Profile
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </AnimatePresence>
  );
};

// Icons
const LinkedInIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);
const GitHubIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);
const TwitterIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

export default MentorRegistrationDetailsModal;

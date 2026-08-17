import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { fadeUp, stagger, ContactPill, Input } from "./LandingSharedUI";

// Modern Contact Section
export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    topic: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/contact`, formData);
      if (response.data.success) {
        setFeedback({ type: "success", message: "Message sent successfully! Check your email for our acknowledgement." });
        setFormData({ name: "", email: "", role: "", topic: "", message: "" });
      } else {
        setFeedback({ type: "error", message: response.data.error || "Failed to send message." });
      }
    } catch (error) {
      setFeedback({ type: "error", message: error.response?.data?.error || "Network error. Please try again later." });
    } finally {
      setLoading(false);
    }
  };
  return (
    <section id="contact" className="relative bg-white px-4 py-20 sm:px-6 lg:px-12 lg:py-28 overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-[#eefaf6] blur-[120px] opacity-70" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[400px] w-[400px] rounded-full bg-yellow-50 blur-[100px] opacity-60" />

      <div className="mx-auto max-w-[1300px] relative z-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center"
        >
          {/* Left Side: Contact Details */}
          <div className="space-y-6 lg:pr-10">
            <div>
              <motion.p variants={fadeUp} className="text-sm font-bold tracking-wider text-[#2b9d62] uppercase mb-3">
                Contact Us
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-6">
                Need help choosing <br className="hidden sm:block"/> the right path?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-500 mb-10">
                Ask us about pathways, course publishing, reviews, mentoring, or subscriptions. Our team is ready to respond with clear guidance and next steps.
              </motion.p>
            </div>

            <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 pt-6 border-t border-slate-100">
              <ContactPill icon="📍" title="Location" text="Sri Lanka" />
              <ContactPill icon="📧" title="Email" text="support@edupath.app" />
              <ContactPill icon="⏰" title="Hours" text="24/7 Access" />
              <ContactPill icon="💬" title="Support" text="Fast response" />
            </motion.div>
          </div>

          {/* Right Side: Contact Form */}
          <motion.div variants={fadeUp} className="relative">
            {/* Form decorative background */}
            <div className="absolute -inset-2 rounded-[40px] bg-gradient-to-br from-[#eefaf6] via-white to-teal-50 blur-xl opacity-80" />
            
            <form onSubmit={handleSubmit} className="relative rounded-[40px] border border-white bg-white/70 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
              <h3 className="text-2xl font-bold text-slate-800 mb-8">Send us a message</h3>
              
              {feedback.message && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-semibold ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {feedback.message}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2 mb-5">
                <Input label="Full name" placeholder="Your name" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="Email" placeholder="you@email.com" type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="grid gap-5 sm:grid-cols-2 mb-5">
                <Input label="I am a..." placeholder="Student / Educator" name="role" value={formData.role} onChange={handleChange} />
                <Input label="Topic" placeholder="Pathways / Courses" name="topic" value={formData.topic} onChange={handleChange} required />
              </div>
              <div className="mb-8">
                <label className="text-xs font-bold text-slate-700 ml-1 mb-2 block">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="h-32 w-full rounded-2xl border-0 bg-white/80 px-4 py-3 text-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-[#2b9d62] shadow-inner transition-shadow"
                  placeholder="Tell us exactly what you need…"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#2b9d62] px-6 py-4 text-lg font-bold text-white shadow-[0_10px_20px_rgba(43,157,98,0.25)] transition-transform hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(43,157,98,0.35)] disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </motion.div>
          
        </motion.div>
      </div>
    </section>
  );
}
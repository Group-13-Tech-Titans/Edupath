import React from "react";
import { Link } from "react-router-dom";

const MentorFooter = () => {
  return (
    <footer className="mt-5 rounded-2xl bg-white px-7 py-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
              <EduPathLogo />
              <span>EduPath</span>
            </div>
            <p className="mb-4 text-sm leading-6 text-slate-700">
              Empowering learners worldwide with quality education and personalized learning paths.
            </p>
            <div className="flex gap-3">
              <SocialIcon><FacebookIcon /></SocialIcon>
              <SocialIcon><TwitterIcon /></SocialIcon>
              <SocialIcon><LinkedInIcon /></SocialIcon>
              <SocialIcon><InstagramIcon /></SocialIcon>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 md:gap-12">
            <FooterCol
              title="Quick Links"
              links={[
                { label: "Mentor Guidelines", href: "#" },
                { label: "Best Practices", href: "#" },
                { label: "Resources", href: "#" },
              ]}
            />
            <FooterCol
              title="Support"
              links={[
                { label: "Help Center", href: "#" },
                { label: "Contact Us", href: "#" },
                { label: "FAQs", href: "#" },
              ]}
            />
            <FooterCol
              title="Legal"
              links={[
                { label: "Terms & Conditions", href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Cookie Policy", href: "#" },
              ]}
            />
          </div>
        </div>
        <div className="mt-8 border-t-2 border-slate-200 pt-5 text-center">
          <p className="text-sm text-slate-500">© 2026 EduPath. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-800">{title}</h4>
      <div className="flex flex-col gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="text-sm text-slate-500 hover:text-teal-500"
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function SocialIcon({ children }) {
  return (
    <button
      type="button"
      className="grid h-10 w-10 place-items-center rounded-full bg-[#D9F3EC] text-[#5DD9C1] transition hover:bg-[#5DD9C1] hover:text-white"
    >
      {children}
    </button>
  );
}

/* ── Icons ────────────────────────────────────────────────────── */
function EduPathLogo() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none">
      <circle cx="20" cy="20" r="18" fill="#5DD9C1" opacity="0.2" />
      <path d="M20 8L12 12L20 16L28 12L20 8Z" fill="#5DD9C1" />
      <path d="M12 20L20 24L28 20" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 26L20 30L28 26" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2" fill="#5DD9C1" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M22 12.073C22 6.504 17.523 2 12 2S2 6.504 2 12.073c0 5.016 3.657 9.175 8.438 9.927v-7.025H7.898v-2.902h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.095 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.562v1.874h2.773l-.443 2.902h-2.33V22C18.343 21.248 22 17.089 22 12.073z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 8.09V9a10.66 10.66 0 01-9-4.5s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.984V9h3.108v1.561h.046c.433-.82 1.494-1.684 3.074-1.684 3.287 0 3.894 2.164 3.894 4.977v6.598zM5.337 7.433a1.96 1.96 0 110-3.92 1.96 1.96 0 010 3.92zM6.919 20.452H3.756V9h3.163v11.452z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M7 2C4.8 2 3 3.8 3 6v12c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4V6c0-2.2-1.8-4-4-4H7zm5 5a5 5 0 110 10 5 5 0 010-10zm6.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0zM12 9a3 3 0 100 6 3 3 0 000-6z" />
    </svg>
  );
}

export default MentorFooter;

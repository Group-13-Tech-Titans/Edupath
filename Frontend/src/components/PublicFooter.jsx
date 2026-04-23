import React from "react";

export default function PublicFooter() {
  return (
    <footer className="mt-10 border-t border-black/5 bg-white/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-muted sm:flex-row">
        
        <p>© 2026 EduPath. All rights reserved.</p>

        <div className="flex gap-4">
          <button className="hover:text-text-dark transition">
            Support
          </button>
          <button className="hover:text-text-dark transition">
            Terms
          </button>
          <button className="hover:text-text-dark transition">
            Privacy
          </button>
        </div>
      </div>
    </footer>
  );
}


export default function LandingFooter() {
  return (
    <footer className="bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-12">
        {/* Top CTA strip (optional, matches theme) */}
        <div className="mb-6 rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold text-emerald-700">READY TO START?</p>
              <p className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
                Your career starts with a smart learning path.
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                AI path guidance, verified courses, and industry expert sessions.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                to="/signup"
                className="rounded-full bg-emerald-600 px-6 py-3 text-center text-sm font-extrabold text-white shadow hover:brightness-95"
              >
                Get Started
              </Link>
              <Link
                to="/courses"
                className="rounded-full border border-black/10 bg-white px-6 py-3 text-center text-sm font-extrabold text-slate-900 hover:bg-black/5"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        </div>

        {/* Main footer card */}
        <div className="rounded-[30px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)] backdrop-blur sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
            {/* Brand */}
            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700">
                  🎓
                </div>
                <div className="leading-tight">
                  <p className="text-base font-extrabold text-slate-900">EduPath</p>
                  <p className="text-xs font-semibold text-slate-500">
                    AI Paths • Verified Learning • Career Growth
                  </p>
                </div>
              </Link>

              <p className="mt-4 max-w-sm text-sm font-semibold text-slate-600">
                EduPath is a modern learning platform with AI career guidance, qualified educators,
                and special sessions with industry experts.
              </p>

              <div className="mt-4 flex items-center gap-2">
                <SocialDot label="Facebook">
                  <IconFacebook />
                </SocialDot>
                <SocialDot label="Instagram">
                  <IconInstagram />
                </SocialDot>
                <SocialDot label="LinkedIn">
                  <IconLinkedIn />
                </SocialDot>
                <SocialDot label="YouTube">
                  <IconYouTube />
                </SocialDot>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-extrabold text-slate-700">
                <Chip>AI Path Finder</Chip>
                <Chip>Verified Courses</Chip>
                <Chip>Industry Experts</Chip>
              </div>
            </div>

            {/* Columns */}
            <FooterCol
              title="Platform"
              items={[
                { label: "Pathways", to: "/#pathways" },
                { label: "Courses", to: "/courses" },
                { label: "Why EduPath", to: "/#why" },
                { label: "Contact", to: "/#contact" },
              ]}
            />
            <FooterCol
              title="For Educators"
              items={[
                { label: "Become an Educator", to: "/signup" },
                { label: "Publish a Course", to: "/login" },
                { label: "Course Review Flow", to: "/#why" },
                { label: "Mentor Sessions", to: "/#contact" },
              ]}
            />
            <FooterCol
              title="Support"
              items={[
                { label: "Help Center", to: "/#contact" },
                { label: "FAQs", to: "/#contact" },
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms", to: "/terms" },
              ]}
            />
          </div>

          {/* Divider */}
          <div className="mt-8 border-t border-black/5 pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-slate-500">
                © {new Date().getFullYear()} EduPath. All rights reserved.
              </p>

              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="rounded-full border border-black/5 bg-white px-3 py-1">
                  24/7 Learning Access
                </span>
                <span className="rounded-full border border-black/5 bg-white px-3 py-1">
                  Sri Lanka • Remote
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Small Parts ---------- */

function FooterCol({ title, items }) {
  return (
    <div>
      <p className="text-sm font-extrabold text-slate-900">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it.label}>
            <Link
              to={it.to}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 hover:underline"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="rounded-full border border-black/5 bg-white px-3 py-1">
      {children}
    </span>
  );
}

function SocialDot({ children, label }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white text-emerald-700 shadow-sm hover:bg-black/5"
    >
      {children}
    </a>
  );
}

/* ---------- Icons (inline SVG) ---------- */

function IconFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 22v-8h2.7l.4-3H13.5V9.1c0-.9.2-1.6 1.6-1.6h1.6V4.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V11H7.6v3H10v8h3.5z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 2A1.8 1.8 0 1 0 13.8 12 1.8 1.8 0 0 0 12 10.2zM18 6.8a.8.8 0 1 1-.8-.8.8.8 0 0 1 .8.8z" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.94 6.5A2.44 2.44 0 1 1 7 1.62a2.44 2.44 0 0 1-.06 4.88zM2.8 22h4.3V8.2H2.8V22zM9.2 8.2h4.1v1.9h.1c.6-1.1 2-2.3 4.2-2.3 4.5 0 5.3 3 5.3 6.8V22h-4.3v-6.1c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V22H9.2V8.2z" />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.2 31 31 0 0 0 2 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z" />
    </svg>
  );
}

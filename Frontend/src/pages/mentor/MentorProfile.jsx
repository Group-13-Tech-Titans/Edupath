import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MentorProfile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-200 to-teal-300 p-5 text-slate-800">
      {/* Header - matching MentorStudents */}
      <header className="mb-5 flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <EduPathLogo />
          <span>EduPath</span>
        </div>

        <nav className="relative z-50 hidden flex-1 items-center justify-center gap-8 md:flex">
          <Link to="/MentorDashboard" className="font-medium text-slate-800 transition-colors hover:text-teal-500">
            Dashboard
          </Link>
          <Link to="/MentorStudents" className="font-medium text-slate-800 transition-colors hover:text-teal-500">
            My Students
          </Link>
          <Link to="/MentorSessions" className="font-medium text-slate-800 transition-colors hover:text-teal-500">
            Sessions
          </Link>
          
          <Link to="/MentorProfile" className="font-medium text-teal-500 transition-colors hover:text-teal-500" style={{ textDecoration: "none" }}>
            Profile
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="w-[150px] flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white"
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </header>

      {/* Profile Header */}
      <section className="mb-5 rounded-2xl bg-white p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="mb-8 flex flex-col gap-8 md:flex-row md:items-start">
          <img
            className="h-[150px] w-[150px] rounded-full border-[5px] border-teal-400 object-cover"
            alt="Dr. Sarah Johnson"
            src="data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 150 150' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='75' cy='75' r='75' fill='%235DD9C1'/%3E%3Cpath d='M75 70C88.255 70 99 59.255 99 46C99 32.745 88.255 22 75 22C61.745 22 51 32.745 51 46C51 59.255 61.745 70 75 70Z' fill='white'/%3E%3Cpath d='M75 80C54.29 80 37.5 89.455 37.5 100V128H112.5V100C112.5 89.455 95.71 80 75 80Z' fill='white'/%3E%3C/svg%3E"
          />

          <div className="flex-1">
            <h1 className="mb-2 text-[32px] font-extrabold text-slate-800">Dr. Sarah Johnson</h1>
            <p className="mb-4 text-lg text-slate-500">Senior Full-Stack Developer & Technical Mentor</p>

            <div className="mb-5 flex flex-wrap gap-2.5">
              <span className="rounded-full bg-teal-400 px-4 py-2 text-[13px] font-semibold text-white">✓ Verified Mentor</span>
              <span className="rounded-full bg-teal-300 px-4 py-2 text-[13px] font-semibold text-white">Expert Level</span>
              <span className="rounded-full bg-emerald-200 px-4 py-2 text-[13px] font-semibold text-slate-800">★ 4.9 Rating</span>
            </div>

            <div className="mb-5 flex flex-wrap gap-10">
              <StatItem value="180+" label="Students Mentored" />
              <StatItem value="850+" label="Sessions Completed" />
              <StatItem value="12" label="Years Experience" />
              <StatItem value="98%" label="Success Rate" />
            </div>

            <div className="flex gap-2.5">
              <button className="rounded-xl bg-teal-400 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-[0_4px_12px_rgba(93,217,193,0.3)]">
                Edit Profile
              </button>
              <button className="rounded-xl border-2 border-teal-400 bg-white px-5 py-2.5 text-sm font-semibold text-teal-500 transition hover:bg-teal-400 hover:text-white">
                Share Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        {/* Left Column */}
        <div className="flex flex-col gap-5">
          {/* About Me */}
          <section className="rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h3 className="mb-5 flex items-center gap-2.5 text-[22px] font-extrabold text-slate-800">
              <UserIcon />
              About Me
            </h3>
            <p className="mb-4 text-[15px] leading-[1.8] text-slate-800">
              Passionate full-stack developer with over 12 years of experience in web development, specializing in React, Node.js, and cloud technologies. I've successfully mentored 180+ students, helping them transition into tech careers and advance their skills. My approach combines practical, real-world projects with personalized guidance tailored to each student's learning style and career goals.
            </p>
            <p className="text-[15px] leading-[1.8] text-slate-800">
              I believe in learning by doing and focus on helping students build production-ready applications while mastering fundamental concepts. Beyond technical skills, I guide students on best practices, career development, interview preparation, and navigating the tech industry.
            </p>
          </section>

          {/* Areas of Expertise */}
          <section className="rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h3 className="mb-5 flex items-center gap-2.5 text-[22px] font-extrabold text-slate-800">
              <LightbulbIcon />
              Areas of Expertise
            </h3>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {["JavaScript", "React.js", "Node.js", "TypeScript", "Python", "AWS", "MongoDB", "PostgreSQL", "Docker", "GraphQL", "REST APIs", "Microservices", "CI/CD", "System Design", "Agile/Scrum"].map((skill) => (
                <span key={skill} className="rounded-full bg-emerald-50 px-4 py-2 text-[13px] font-semibold text-teal-500">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Work Experience */}
          <section className="rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h3 className="mb-5 flex items-center gap-2.5 text-[22px] font-extrabold text-slate-800">
              <BriefcaseIcon />
              Work Experience
            </h3>

            <ExperienceItem
              title="Senior Full-Stack Developer"
              company="Tech Innovations Inc."
              duration="Jan 2020 - Present · 4+ years"
              description="Leading development of enterprise web applications using React, Node.js, and AWS. Architected microservices infrastructure serving 2M+ users. Mentoring junior developers and conducting code reviews."
            />

            <ExperienceItem
              title="Full-Stack Developer"
              company="Digital Solutions Ltd."
              duration="Mar 2017 - Dec 2019 · 2 years 10 months"
              description="Developed and maintained multiple client applications using MERN stack. Implemented RESTful APIs and integrated third-party services. Collaborated with cross-functional teams in Agile environment."
            />

            <ExperienceItem
              title="Junior Developer"
              company="StartUp Labs"
              duration="Jun 2014 - Feb 2017 · 2 years 9 months"
              description="Built responsive web applications using JavaScript frameworks. Participated in all phases of software development lifecycle. Gained expertise in modern web technologies and best practices."
            />
          </section>

          {/* Education */}
          <section className="rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h3 className="mb-5 flex items-center gap-2.5 text-[22px] font-extrabold text-slate-800">
              <EducationIcon />
              Education
            </h3>

            <EducationItem degree="Ph.D. in Computer Science" institution="Stanford University" year="2010 - 2014" />
            <EducationItem degree="M.S. in Software Engineering" institution="Massachusetts Institute of Technology" year="2008 - 2010" />
            <EducationItem degree="B.S. in Computer Science" institution="University of California, Berkeley" year="2004 - 2008" />
          </section>

          {/* Student Reviews */}
          <section className="rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h3 className="mb-5 flex items-center gap-2.5 text-[22px] font-extrabold text-slate-800">
              <StarIcon />
              Student Reviews
            </h3>

            <ReviewItem
              name="Priya Sharma"
              rating="5.0"
              text="Dr. Sarah is an exceptional mentor! She helped me transition from a non-tech background to landing my first developer job. Her teaching style is clear, patient, and she provides excellent real-world examples."
              date="2 weeks ago"
            />

            <ReviewItem
              name="Rahul Mehta"
              rating="5.0"
              text="The best mentor I've worked with on EduPath. Sarah's deep knowledge of full-stack development and her ability to explain complex concepts simply is remarkable. Highly recommended!"
              date="1 month ago"
            />

            <ReviewItem
              name="Anjali Kumar"
              rating="5.0"
              text="Sarah's guidance was instrumental in helping me build my portfolio and prepare for interviews. She's not just teaching code, she's teaching how to think like a developer."
              date="2 months ago"
            />
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">
          {/* Contact Information */}
          <section className="rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h3 className="mb-5 flex items-center gap-2.5 text-[22px] font-extrabold text-slate-800">
              <MailIcon />
              Contact Information
            </h3>

            <InfoRow label="Email" value="sarah.j@edupath.com" />
            <InfoRow label="Location" value="San Francisco, CA" />
            <InfoRow label="Time Zone" value="PST (UTC-8)" />
            <InfoRow label="Languages" value="English, Spanish" />

            <h4 className="mb-2.5 mt-5 text-sm font-semibold text-slate-800">Social Links</h4>
            <div className="mt-4 flex gap-4">
              <SocialLink>
                <LinkedInSVG />
              </SocialLink>
              <SocialLink>
                <GitHubSVG />
              </SocialLink>
              <SocialLink>
                <TwitterSVG />
              </SocialLink>
              <SocialLink>
                <RedditSVG />
              </SocialLink>
            </div>
          </section>

          {/* Availability */}
          <section className="rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h3 className="mb-5 flex items-center gap-2.5 text-[22px] font-extrabold text-slate-800">
              <CalendarIcon />
              Availability
            </h3>

            <div className="mt-4 grid grid-cols-7 gap-2">
              <DayBox available day="Mon" />
              <DayBox available day="Tue" />
              <DayBox available day="Wed" />
              <DayBox available day="Thu" />
              <DayBox available day="Fri" />
              <DayBox day="Sat" />
              <DayBox day="Sun" />
            </div>

            <p className="mt-4 text-[13px] text-slate-500">Available Monday - Friday, 9 AM - 6 PM PST</p>
          </section>

          {/* Certifications */}
          <section className="rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h3 className="mb-5 flex items-center gap-2.5 text-[22px] font-extrabold text-slate-800">
              <AwardIcon />
              Certifications
            </h3>

            <CertificationItem icon="AWS" title="AWS Certified Solutions Architect" issuer="Amazon Web Services" />
            <CertificationItem icon="GCP" title="Google Cloud Professional" issuer="Google Cloud" />
            <CertificationItem icon="Meta" title="Meta Front-End Developer" issuer="Meta" />
          </section>
        </div>
      </div>

      {/* Footer */}
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
                <SocialIcon>
                  <FacebookIcon />
                </SocialIcon>
                <SocialIcon>
                  <TwitterIcon />
                </SocialIcon>
                <SocialIcon>
                  <LinkedInIcon />
                </SocialIcon>
                <SocialIcon>
                  <InstagramIcon />
                </SocialIcon>
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
    </div>
  );
}

/* ----------------- Small UI Components ----------------- */

function StatItem({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-[28px] font-extrabold text-slate-800">{value}</div>
      <div className="mt-1 text-[13px] text-slate-500">{label}</div>
    </div>
  );
}

function ExperienceItem({ title, company, duration, description }) {
  return (
    <div className="mb-4 rounded-xl border-l-4 border-teal-400 bg-slate-50 p-5">
      <h4 className="mb-1 text-base font-extrabold text-slate-800">{title}</h4>
      <p className="mb-1 text-sm font-semibold text-teal-500">{company}</p>
      <p className="mb-2.5 text-[13px] text-slate-500">{duration}</p>
      <p className="text-sm leading-[1.6] text-slate-800">{description}</p>
    </div>
  );
}

function EducationItem({ degree, institution, year }) {
  return (
    <div className="mb-4 rounded-xl bg-slate-50 p-5">
      <h4 className="mb-1 text-base font-extrabold text-slate-800">{degree}</h4>
      <p className="mb-1 text-sm font-semibold text-teal-500">{institution}</p>
      <p className="text-[13px] text-slate-500">{year}</p>
    </div>
  );
}

function ReviewItem({ name, rating, text, date }) {
  return (
    <div className="mb-4 rounded-xl bg-slate-50 p-5">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">{name}</span>
        <span className="text-sm text-yellow-400">★★★★★ {rating}</span>
      </div>
      <p className="mb-2 text-sm leading-[1.6] text-slate-800">{text}</p>
      <p className="text-xs text-slate-500">{date}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-200 py-4 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function DayBox({ available, day }) {
  return (
    <div className={`rounded-lg px-2 py-3 text-center text-xs font-semibold ${available ? "bg-emerald-50 text-teal-500" : "bg-slate-50 text-slate-500"}`}>
      {day}
    </div>
  );
}

function CertificationItem({ icon, title, issuer }) {
  return (
    <div className="mb-2.5 flex items-center gap-4 rounded-xl bg-slate-50 p-4">
      <div className="flex h-[50px] w-[50px] items-center justify-center rounded-lg bg-teal-400 text-xl font-bold text-white">{icon}</div>
      <div>
        <h5 className="mb-1 text-sm font-semibold text-slate-800">{title}</h5>
        <p className="text-xs text-slate-500">{issuer}</p>
      </div>
    </div>
  );
}

function SocialLink({ children }) {
  return (
    <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-emerald-50 transition hover:bg-teal-400 [&:hover_svg]:fill-white">
      {children}
    </div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-800">{title}</h4>
      <div className="flex flex-col gap-2">
        {links.map((l) => (
          <a key={l.label} href={l.href} className="text-sm text-slate-500 hover:text-teal-500">
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function SocialIcon({ children }) {
  return (
    <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-emerald-200 transition hover:-translate-y-0.5 hover:bg-teal-400">
      {children}
    </button>
  );
}

/* ----------------- Icons ----------------- */

function EduPathLogo() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#5DD9C1" opacity="0.2" />
      <path d="M20 8L12 12L20 16L28 12L20 8Z" fill="#5DD9C1" />
      <path d="M12 20L20 24L28 20" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 26L20 30L28 26" stroke="#5DD9C1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2" fill="#5DD9C1" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-6 w-6 stroke-teal-500" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg className="h-6 w-6 stroke-teal-500" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg className="h-6 w-6 stroke-teal-500" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function EducationIcon() {
  return (
    <svg className="h-6 w-6 stroke-teal-500" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-6 w-6 stroke-teal-500" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-6 w-6 stroke-teal-500" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-6 w-6 stroke-teal-500" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function AwardIcon() {
  return (
    <svg className="h-6 w-6 stroke-teal-500" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function LinkedInSVG() {
  return (
    <svg className="h-5 w-5 fill-teal-500" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubSVG() {
  return (
    <svg className="h-5 w-5 fill-teal-500" viewBox="0 0 24 24">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function TwitterSVG() {
  return (
    <svg className="h-5 w-5 fill-teal-500" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </svg>
  );
}

function RedditSVG() {
  return (
    <svg className="h-5 w-5 fill-teal-500" viewBox="0 0 24 24">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249z" />
    </svg>
  );
}

function FacebookIcon() {
  return <span className="text-slate-700">f</span>;
}
function TwitterIcon() {
  return <span className="text-slate-700">t</span>;
}
function LinkedInIcon() {
  return <span className="text-slate-700">in</span>;
}
function InstagramIcon() {
  return <span className="text-slate-700">ig</span>;
}
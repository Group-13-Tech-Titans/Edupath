import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MentorProfile() {
  const navigate = useNavigate();

  // Load saved photo from localStorage (shared with Dashboard)
  const [photo, setPhoto] = useState(() => localStorage.getItem("mentorPhoto") || null);
  const fileInputRef = useRef(null);

  // Load social links, certifications, mentoring focus, expertise from localStorage (saved in Settings)
  const socialLinks = JSON.parse(localStorage.getItem("mentorSocialLinks") || "{}");
  const certifications = JSON.parse(localStorage.getItem("mentorCertifications") || "[]");
  const mentoringFocus = JSON.parse(localStorage.getItem("mentorMentoringFocus") || "[]");
  const expertiseTags = JSON.parse(localStorage.getItem("mentorExpertiseTags") || "[]");

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPhoto(dataUrl);
      localStorage.setItem("mentorPhoto", dataUrl); // save so Dashboard can read it
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Use tags from Settings if available, otherwise use defaults
  const expertise = expertiseTags.length > 0 ? expertiseTags : [
    "JavaScript", "React.js", "Node.js", "TypeScript", "Python",
    "AWS", "MongoDB", "PostgreSQL", "Docker", "GraphQL",
    "REST APIs", "Microservices", "CI/CD", "System Design", "Agile/Scrum",
  ];

  const experience = [
    {
      role: "Senior Full-Stack Developer",
      company: "Tech Innovations Inc.",
      duration: "Jan 2020 - Present · 4+ years",
      description:
        "Leading development of enterprise web applications using React, Node.js, and AWS. Architected microservices infrastructure serving 2M+ users. Mentoring junior developers and conducting code reviews.",
    },
    {
      role: "Full-Stack Developer",
      company: "Digital Solutions Ltd.",
      duration: "Mar 2017 - Dec 2019 · 2 years 10 months",
      description:
        "Developed and maintained multiple client applications using MERN stack. Implemented RESTful APIs and integrated third-party services. Collaborated with cross-functional teams in Agile environment.",
    },
    {
      role: "Junior Developer",
      company: "StartUp Labs",
      duration: "Jun 2014 - Feb 2017 · 2 years 9 months",
      description:
        "Built responsive web applications using JavaScript frameworks. Participated in all phases of software development lifecycle. Gained expertise in modern web technologies and best practices.",
    },
  ];

  const education = [
    {
      degree: "Ph.D. in Computer Science",
      institution: "Stanford University",
      year: "2010 - 2014",
    },
    {
      degree: "M.S. in Software Engineering",
      institution: "Massachusetts Institute of Technology",
      year: "2008 - 2010",
    },
    {
      degree: "B.S. in Computer Science",
      institution: "University of California, Berkeley",
      year: "2004 - 2008",
    },
  ];

  const reviews = [
    {
      name: "Priya Sharma",
      rating: "5.0 Rating",
      text: `"Dr. Sarah is an exceptional mentor! She helped me transition from a non-tech background to landing my first developer job. Her teaching style is clear, patient, and she provides excellent real-world examples."`,
      date: "2 weeks ago",
    },
    {
      name: "Rahul Mehta",
      rating: "5.0 Rating",
      text: `"The best mentor I've worked with on EduPath. Sarah's deep knowledge of full-stack development and her ability to explain complex concepts simply is remarkable. Highly recommended!"`,
      date: "1 month ago",
    },
    {
      name: "Anjali Kumar",
      rating: "5.0 Rating",
      text: `"Sarah's guidance was instrumental in helping me build my portfolio and prepare for interviews. She's not just teaching code, she's teaching how to think like a developer."`,
      date: "2 months ago",
    },
  ];
  return (
    <>
      {/* Profile Header */}
      <section className="mb-5 rounded-2xl bg-white p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="mb-[30px] flex flex-col gap-[30px] md:flex-row md:items-start">
          {/* Clickable profile photo */}
          <div className="relative flex-shrink-0 cursor-pointer group" onClick={() => fileInputRef.current.click()}>
            <img
              src={photo || "data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 150 150' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='75' cy='75' r='75' fill='%235DD9C1'/%3E%3Cpath d='M75 70C88.255 70 99 59.255 99 46C99 32.745 88.255 22 75 22C61.745 22 51 32.745 51 46C51 59.255 61.745 70 75 70Z' fill='white'/%3E%3Cpath d='M75 80C54.29 80 37.5 89.455 37.5 100V128H112.5V100C112.5 89.455 95.71 80 75 80Z' fill='white'/%3E%3C/svg%3E"}
              alt="Profile Photo"
              className="h-[150px] w-[150px] rounded-full border-[5px] border-[#5DD9C1] object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="h-8 w-8 text-white mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span className="text-xs text-white font-semibold">Change Photo</span>
            </div>
            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          <div className="flex-1">
            <h1 className="mb-2 text-[32px] font-bold text-[#2c3e50]">Dr. Sarah Johnson</h1>
            <p className="mb-[15px] text-[18px] text-[#7f8c8d]">Senior Full-Stack Developer & Technical Mentor</p>

            <div className="mb-5 flex flex-wrap gap-[10px]">
              <span className="rounded-[20px] bg-[#5DD9C1] px-4 py-2 text-[13px] font-semibold text-white">
                Verified Mentor
              </span>
              <span className="rounded-[20px] bg-[#7DD3C0] px-4 py-2 text-[13px] font-semibold text-white">
                Expert Level
              </span>
              <span className="rounded-[20px] bg-[#A8E6CF] px-4 py-2 text-[13px] font-semibold text-[#2c3e50]">
                4.9 Rating
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-10 max-md:justify-center">
              <StatItem value="180+" label="Students Mentored" />
              <StatItem value="850+" label="Sessions Completed" />
              <StatItem value="12" label="Years Experience" />
              <StatItem value="98%" label="Success Rate" />
            </div>

            <div className="mt-5 flex flex-wrap gap-[10px]">
              <Link
                to="/mentor/settings"
                className="rounded-[10px] bg-[#5DD9C1] px-6 py-3 text-[14px] font-semibold text-white transition-all duration-300 hover:-translate-y-[2px] hover:bg-[#4AC4AD] hover:shadow-[0_4px_12px_rgba(93,217,193,0.3)]"
              >
                Edit Profile
              </Link>

              <Link
                to="/mentor/settings"
                className="rounded-[10px] border-2 border-[#5DD9C1] bg-white px-[22px] py-[10px] text-[14px] font-semibold text-[#5DD9C1] transition-all duration-300 hover:bg-[#5DD9C1] hover:text-white"
              >
                Settings
              </Link>

              <Link
                to="/mentor/share-profile"
                className="rounded-[10px] border-2 border-[#5DD9C1] bg-white px-[22px] py-[10px] text-[14px] font-semibold text-[#5DD9C1] transition-all duration-300 hover:bg-[#5DD9C1] hover:text-white"
              >
                Share Profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        {/* Left Column */}
        <div className="flex flex-col gap-5">
          {/* About Me */}
          <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <SectionTitle icon={<UserIcon />} title="About Me" />
            <p className="text-[15px] leading-[1.8] text-[#2c3e50]">
              Passionate full-stack developer with over 12 years of experience in web development, specializing in React, Node.js, and cloud technologies. I've successfully mentored 180+ students, helping them transition into tech careers and advance their skills. My approach combines practical, real-world projects with personalized guidance tailored to each student's learning style and career goals.
            </p>
            <p className="mt-[15px] text-[15px] leading-[1.8] text-[#2c3e50]">
              I believe in learning by doing and focus on helping students build production-ready applications while mastering fundamental concepts. Beyond technical skills, I guide students on best practices, career development, interview preparation, and navigating the tech industry.
            </p>
          </section>

          {/* Areas of Expertise */}
          <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <SectionTitle icon={<LightbulbIcon />} title="Areas of Expertise" />
            <div className="mt-[15px] flex flex-wrap gap-[10px]">
              {expertise.map((skill) => (
                <span
                  key={skill}
                  className="rounded-[20px] bg-[#E8F8F5] px-4 py-2 text-[13px] font-semibold text-[#5DD9C1]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Work Experience */}
          <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <SectionTitle icon={<WorkIcon />} title="Work Experience" />

            {experience.map((item, index) => (
              <div
                key={index}
                className="mb-[15px] rounded-xl border-l-4 border-[#5DD9C1] bg-[#f8f9fa] p-5 last:mb-0"
              >
                <h4 className="mb-[5px] text-[16px] font-semibold text-[#2c3e50]">{item.role}</h4>
                <p className="mb-[5px] text-[14px] font-semibold text-[#5DD9C1]">{item.company}</p>
                <p className="mb-[10px] text-[13px] text-[#7f8c8d]">{item.duration}</p>
                <p className="text-[14px] leading-[1.6] text-[#2c3e50]">{item.description}</p>
              </div>
            ))}
          </section>

         {/* Education */}
          <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <SectionTitle icon={<EducationIcon />} title="Education" />

            {[
              {
                degree: "Ph.D. in Computer Science",
                institution: "Stanford University",
                year: "2010 - 2014",
                specialization: "Specialization: Artificial Intelligence",
                note: "Research Focus: Machine Learning for Education",
              },
              {
                degree: "M.S. in Software Engineering",
                institution: "Massachusetts Institute of Technology",
                year: "2008 - 2010",
                specialization: "Focus Area: Software Architecture & Cloud Systems",
                note: "Built strong expertise in scalable web application design",
              },
              {
                degree: "B.S. in Computer Science",
                institution: "University of California, Berkeley",
                year: "2004 - 2008",
                specialization: "Foundation: Programming, Databases, and Networks",
                note: "Graduated with strong academic performance in core computing subjects",
              },
            ].map((item, index) => (
              <div key={index} className="mb-[18px] rounded-[18px] bg-[#f3f4f6] p-6 last:mb-0">
                <h4 className="mb-[8px] text-[18px] font-bold text-[#243b53]">{item.degree}</h4>
                <p className="mb-[8px] text-[15px] font-semibold text-[#5DD9C1]">{item.institution}</p>
                <p className="mb-[10px] text-[14px] text-[#7b8794]">{item.year}</p>
                <p className="mb-[6px] text-[14px] text-[#52606d]">{item.specialization}</p>
                <p className="text-[14px] leading-[1.6] text-[#52606d]">{item.note}</p>
              </div>
            ))}
          </section>

          {/* Student Reviews */}
          <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <SectionTitle icon={<StarIcon />} title="Student Reviews" />

            {[
              {
                name: "Priya Sharma",
                role: "Career Switcher to Tech",
                topic: "Topic: Web Development & Interview Preparation",
                rating: "★★★★★ 5.0",
                text: `"Dr. Sarah is an exceptional mentor! She helped me transition from a non-tech background to landing my first developer job. Her teaching style is clear, patient, and she provides excellent real-world examples."`,
                date: "2 weeks ago",
              },
              {
                name: "Rahul Mehta",
                role: "Undergraduate Software Engineering Student",
                topic: "Topic: Full-Stack Development & Project Guidance",
                rating: "★★★★★ 5.0",
                text: `"The best mentor I've worked with on EduPath. Sarah's deep knowledge of full-stack development and her ability to explain complex concepts simply is remarkable. Highly recommended!"`,
                date: "1 month ago",
              },
              {
                name: "Anjali Kumar",
                role: "Junior Developer",
                topic: "Topic: Portfolio Building & Career Advice",
                rating: "★★★★★ 5.0",
                text: `"Sarah's guidance was instrumental in helping me build my portfolio and prepare for interviews. She's not just teaching code, she's teaching how to think like a developer."`,
                date: "2 months ago",
              },
            ].map((review, index) => (
              <div key={index} className="mb-[18px] rounded-[18px] bg-[#f3f4f6] p-6 last:mb-0">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-[16px] font-bold text-[#243b53]">{review.name}</h4>
                    <p className="mt-1 text-[14px] text-[#52606d]">{review.role}</p>
                    <p className="mt-1 text-[14px] font-medium text-[#5DD9C1]">{review.topic}</p>
                  </div>
                  <span className="whitespace-nowrap text-[15px] font-medium text-[#f4c542]">5.0 Rating</span>
                </div>

                <p className="mb-3 text-[15px] leading-[1.8] text-[#243b53]">{review.text}</p>
                <p className="text-[13px] text-[#7b8794]">{review.date}</p>
              </div>
            ))}
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">
          {/* Contact Information */}
          <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <SectionTitle icon={<MailIcon />} title="Contact Information" />

            <InfoRow label="Email" value="sarah.johnson@email.com" />
            <InfoRow label="Location" value="San Francisco, CA" />
            <InfoRow label="Time Zone" value="PST (UTC-8)" />
            <InfoRow label="Languages" value="English, Spanish" />

            <h4 className="mb-[10px] mt-5 text-[14px] font-semibold text-[#2c3e50]">Social Links</h4>

            <div className="mt-[15px] flex flex-col gap-3">
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-[#5DD9C1] hover:underline">
                  <LinkedInIcon /> {socialLinks.linkedin}
                </a>
              )}
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-[#5DD9C1] hover:underline">
                  <GitHubIcon /> {socialLinks.github}
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-[#5DD9C1] hover:underline">
                  <TwitterIcon /> {socialLinks.twitter}
                </a>
              )}
              {socialLinks.website && (
                <a href={socialLinks.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-[#5DD9C1] hover:underline">
                  <RedditIcon /> {socialLinks.website}
                </a>
              )}
              {!socialLinks.linkedin && !socialLinks.github && !socialLinks.twitter && !socialLinks.website && (
                <p className="text-[13px] text-[#7f8c8d]">No social links added yet. Add them in Settings.</p>
              )}
            </div>
          </section>

          {/* Availability */}
          <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <SectionTitle icon={<ClockIcon />} title="Availability" />

            <InfoRow label="Monday - Friday" value="6:00 PM - 9:00 PM" />
            <InfoRow label="Saturday" value="10:00 AM - 2:00 PM" />
            <InfoRow label="Sunday" value="Not Available" />
            <InfoRow label="Response Time" value="< 24 Hours" />
          </section>

          {/* Mentoring Focus */}
          <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <SectionTitle icon={<TargetIcon />} title="Mentoring Focus" />

            <div className="flex flex-wrap gap-[10px]">
              {(mentoringFocus.length > 0 ? mentoringFocus : [
                "Career Guidance", "Portfolio Review", "Interview Prep",
                "Resume Feedback", "Full-Stack Projects", "Coding Best Practices",
              ]).map((item) => (
                <span key={item} className="rounded-[20px] bg-[#E8F8F5] px-4 py-2 text-[13px] font-semibold text-[#5DD9C1]">
                  {item}
                </span>
              ))}
            </div>
          </section>

          {/* Certifications */}
          <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <SectionTitle icon={<CertificateIcon />} title="Certifications" />

            <div className="flex flex-col gap-3">
              {certifications.length > 0 ? certifications.map((cert, i) => (
                <div key={i} className="rounded-xl bg-[#f8f9fa] p-4">
                  <p className="text-[14px] font-semibold text-[#2c3e50]">{cert.name}</p>
                  <p className="mt-1 text-[13px] text-[#7f8c8d]">{cert.issuer}{cert.year ? ` • ${cert.year}` : ""}</p>
                </div>
              )) : (
                <>
                  <div className="rounded-xl bg-[#f8f9fa] p-4">
                    <p className="text-[14px] font-semibold text-[#2c3e50]">AWS Certified Developer</p>
                    <p className="mt-1 text-[13px] text-[#7f8c8d]">Amazon Web Services</p>
                  </div>
                  <div className="rounded-xl bg-[#f8f9fa] p-4">
                    <p className="text-[14px] font-semibold text-[#2c3e50]">Google Cloud Associate</p>
                    <p className="mt-1 text-[13px] text-[#7f8c8d]">Google Cloud Platform</p>
                  </div>
                  <div className="rounded-xl bg-[#f8f9fa] p-4">
                    <p className="text-[14px] font-semibold text-[#2c3e50]">Professional Scrum Master</p>
                    <p className="mt-1 text-[13px] text-[#7f8c8d]">Scrum.org</p>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Quick Stats */}
          <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <SectionTitle icon={<ChartIcon />} title="Quick Stats" />

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#f8f9fa] p-4 text-center">
                <p className="text-[22px] font-bold text-[#2c3e50]">180+</p>
                <p className="mt-1 text-[13px] text-[#7f8c8d]">Students</p>
              </div>

              <div className="rounded-xl bg-[#f8f9fa] p-4 text-center">
                <p className="text-[22px] font-bold text-[#2c3e50]">850+</p>
                <p className="mt-1 text-[13px] text-[#7f8c8d]">Sessions</p>
              </div>

              <div className="rounded-xl bg-[#f8f9fa] p-4 text-center">
                <p className="text-[22px] font-bold text-[#2c3e50]">4.9</p>
                <p className="mt-1 text-[13px] text-[#7f8c8d]">Rating</p>
              </div>

              <div className="rounded-xl bg-[#f8f9fa] p-4 text-center">
                <p className="text-[22px] font-bold text-[#2c3e50]">98%</p>
                <p className="mt-1 text-[13px] text-[#7f8c8d]">Success</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}


/* ----------------- Small UI Components ----------------- */
function StatItem({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-[28px] font-bold text-[#2c3e50]">{value}</div>
      <div className="mt-[5px] text-[13px] text-[#7f8c8d]">{label}</div>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <h3 className="mb-5 flex items-center gap-[10px] text-[22px] font-bold text-[#2c3e50]">
      {icon}
      {title}
    </h3>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-[#e0e0e0] py-[15px] last:border-b-0">
      <span className="text-[14px] text-[#7f8c8d]">{label}</span>
      <span className="text-[14px] font-semibold text-[#2c3e50]">{value}</span>
    </div>
  );
}

function UserIcon() {
  return (
    <svg className="h-6 w-6 text-[#5DD9C1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg className="h-6 w-6 text-[#5DD9C1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 00-4 12.9V17a2 2 0 002 2h4a2 2 0 002-2v-2.1A7 7 0 0012 2z" />
    </svg>
  );
}

function WorkIcon() {
  return (
    <svg className="h-6 w-6 text-[#5DD9C1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
    </svg>
  );
}

function EducationIcon() {
  return (
    <svg className="h-6 w-6 text-[#5DD9C1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3L2 7l10 4 10-4-10-4z" />
      <path d="M2 17l10 4 10-4" />
      <path d="M2 7l10 4 10-4" />
      <path d="M12 11v10" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-6 w-6 text-[#5DD9C1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-6 w-6 text-[#5DD9C1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v16H4z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5 text-[#0A66C2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h4v16H4z" />
      <circle cx="6" cy="6" r="2" />
      <path d="M10 8h4v12h-4z" />
      <path d="M10 12h4" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-5 w-5 text-[#333]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 19c-4.3 1.4-4.3-2-6-2" />
      <path d="M12 2a9 9 0 00-9 9c0 4 2.6 7.4 6.2 8.6" />
      <path d="M15 22c3.4-1.2 6-4.6 6-8.6a9 9 0 00-9-9" />
      <path d="M12 14a3 3 0 01-3-3" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="h-5 w-5 text-[#1DA1F2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0016 3a4.5 4.5 0 00-4.5 4.5c0 .35.04.7.1 1.03A12.94 12.94 0 013 4s-4 9 5 13a13 13 0 01-8 2c12 7 27 0 27-16a9.22 9.22 0 00-.08-1.82A6.72 6.72 0 0023 3z" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg className="h-5 w-5 text-[#FF4500]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 8a3 3 0 11-6 0 3 3 0 016 0z" />
      <path d="M8 16a4 4 0 008 0" />
      <path d="M8 9l3-2 3 2" />
      <path d="M15 9l1-4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-6 w-6 text-[#5DD9C1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg className="h-6 w-6 text-[#5DD9C1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <path d="M22 12h-2" />
    </svg>
  );
}

function CertificateIcon() {
  return (
    <svg className="h-6 w-6 text-[#5DD9C1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v16H4z" />
      <path d="M4 14h16" />
      <path d="M9 4v4" />
      <path d="M15 4v4" />
      <path d="M9 20l3-3 3 3" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="h-6 w-6 text-[#5DD9C1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19h16" />
      <path d="M8 15v4" />
      <path d="M12 11v8" />
      <path d="M16 7v12" />
    </svg>
  );
}
 
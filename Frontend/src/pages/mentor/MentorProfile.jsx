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
      rating: "★★★★★ 5.0",
      text: `"Dr. Sarah is an exceptional mentor! She helped me transition from a non-tech background to landing my first developer job. Her teaching style is clear, patient, and she provides excellent real-world examples."`,
      date: "2 weeks ago",
    },
    {
      name: "Rahul Mehta",
      rating: "★★★★★ 5.0",
      text: `"The best mentor I've worked with on EduPath. Sarah's deep knowledge of full-stack development and her ability to explain complex concepts simply is remarkable. Highly recommended!"`,
      date: "1 month ago",
    },
    {
      name: "Anjali Kumar",
      rating: "★★★★★ 5.0",
      text: `"Sarah's guidance was instrumental in helping me build my portfolio and prepare for interviews. She's not just teaching code, she's teaching how to think like a developer."`,
      date: "2 months ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A8E6CF] to-[#7DD3C0] p-5 font-sans text-[#2c3e50]">
      {/* Header */}
      <header className="mb-5 flex items-center justify-between rounded-2xl bg-white px-[30px] py-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-[10px] text-[20px] font-bold text-[#2c3e50]">
          <EduPathLogo />
          <span>EduPath</span>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-[30px] md:flex">
          <Link to="/MentorDashboard" className="font-medium text-[#2c3e50] transition-colors duration-300 hover:text-[#5DD9C1]">
            Dashboard
          </Link>
          <Link to="/MentorStudents" className="font-medium text-[#2c3e50] transition-colors duration-300 hover:text-[#5DD9C1]">
            My Students
          </Link>
          <Link to="/MentorSessions" className="font-medium text-[#2c3e50] transition-colors duration-300 hover:text-[#5DD9C1]">
            Sessions
          </Link>
          <Link to="/MentorResources" className="font-medium text-[#2c3e50] transition-colors duration-300 hover:text-[#5DD9C1]">
            Resources
          </Link>
          <Link to="/MentorMessages" className="font-medium text-[#2c3e50] transition-colors duration-300 hover:text-[#5DD9C1]">
            Messages
          </Link>
          <Link to="/MentorProfile" className="font-medium text-[#5DD9C1] transition-colors duration-300 hover:text-[#5DD9C1]">
            Profile
          </Link>
        </nav>

        <div className="flex w-[150px] justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-[10px] border-2 border-[#5DD9C1] bg-white px-[22px] py-[10px] text-[14px] font-semibold text-[#5DD9C1] transition-all duration-300 hover:bg-[#5DD9C1] hover:text-white"
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </header>

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
                ✓ Verified Mentor
              </span>
              <span className="rounded-[20px] bg-[#7DD3C0] px-4 py-2 text-[13px] font-semibold text-white">
                Expert Level
              </span>
              <span className="rounded-[20px] bg-[#A8E6CF] px-4 py-2 text-[13px] font-semibold text-[#2c3e50]">
                ★ 4.9 Rating
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
                to="/MentorSettings"
                className="rounded-[10px] bg-[#5DD9C1] px-6 py-3 text-[14px] font-semibold text-white transition-all duration-300 hover:-translate-y-[2px] hover:bg-[#4AC4AD] hover:shadow-[0_4px_12px_rgba(93,217,193,0.3)]"
              >
                Edit Profile
              </Link>

              <Link
                to="/MentorSettings"
                className="rounded-[10px] border-2 border-[#5DD9C1] bg-white px-[22px] py-[10px] text-[14px] font-semibold text-[#5DD9C1] transition-all duration-300 hover:bg-[#5DD9C1] hover:text-white"
              >
                Settings
              </Link>

              <Link
                to="/MentorShareProfile"
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
        <span className="whitespace-nowrap text-[15px] font-medium text-[#f4c542]">{review.rating}</span>
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

function SocialLink({ icon }) {
  return (
    <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#E8F8F5] transition-all duration-300 hover:bg-[#5DD9C1] group">
      <div className="text-[#5DD9C1] group-hover:text-white">{icon}</div>
    </div>
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
    <svg className="h-6 w-6 stroke-[#5DD9C1]" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg className="h-6 w-6 stroke-[#5DD9C1]" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function WorkIcon() {
  return (
    <svg className="h-6 w-6 stroke-[#5DD9C1]" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function EducationIcon() {
  return (
    <svg className="h-6 w-6 stroke-[#5DD9C1]" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path d="M8 20v-7.5l4-2.222" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-6 w-6 stroke-[#5DD9C1]" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-6 w-6 stroke-[#5DD9C1]" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-6 w-6 stroke-[#5DD9C1]" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg className="h-6 w-6 stroke-[#5DD9C1]" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1.5" fill="#5DD9C1" stroke="none" />
    </svg>
  );
}

function CertificateIcon() {
  return (
    <svg className="h-6 w-6 stroke-[#5DD9C1]" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M8 3h8l4 4v6c0 5-3.5 7.5-8 8-4.5-.5-8-3-8-8V7l4-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="h-6 w-6 stroke-[#5DD9C1]" fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 19h16" />
      <path d="M7 16V10" />
      <path d="M12 16V6" />
      <path d="M17 16v-4" />
    </svg>
  );
}

function SocialIcon({ children }) {
  return (
    <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#E8F8F5] text-[#5DD9C1] transition-all duration-300 hover:bg-[#5DD9C1] hover:text-white">
      {children}
    </div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="mb-4 text-[16px] font-semibold text-[#2c3e50]">{title}</h4>
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-sm text-[#7f8c8d] transition-colors duration-300 hover:text-[#5DD9C1]"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0022 12z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3.5A5.5 5.5 0 1112 18.5 5.5 5.5 0 0112 7.5zm0 2A3.5 3.5 0 1012 16.5 3.5 3.5 0 0012 9.5zm5.75-3.25a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" />
    </svg>
  );
}
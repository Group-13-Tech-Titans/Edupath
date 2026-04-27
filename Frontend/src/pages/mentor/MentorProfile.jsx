import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppProvider.jsx";
import { getMentorProfile, updateMentorProfile } from "../../api/mentorApi";

export default function MentorProfile() {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMentorProfile();
        setProfile(data);
        setPhoto(data.avatar);
      } catch (err) {
        console.error("Failed to fetch mentor profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setPhoto(dataUrl);
      try {
        await updateMentorProfile({ avatar: dataUrl });
      } catch (err) {
        console.error("Failed to update avatar:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  const mentorName = profile?.name || currentUser?.name || "Mentor Name";
  const mentorTitle = profile?.title || "Professional Mentor";
  const mentorBio = profile?.bio || "No bio provided yet.";
  const mentorEmail = currentUser?.email || "No email available";
  const socialLinks = profile?.socialLinks || {};
  const expertise = profile?.expertise || [];
  
  // Handling availability array from backend
  const availability = profile?.availability || [];
  const findAvail = (key) => availability.find(a => a.startsWith(key))?.split(": ")[1] || "Not Specified";

  return (
    <>
      {/* Profile Header */}
      <section className="mb-5 rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="relative flex-shrink-0 cursor-pointer group" onClick={() => fileInputRef.current.click()}>
            <img
              src={photo || "data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='60' cy='60' r='60' fill='%235DD9C1'/%3E%3Cpath d='M60 56C70.604 56 79.2 47.404 79.2 36.8C79.2 26.196 70.604 17.6 60 17.6C49.396 17.6 40.8 26.196 40.8 36.8C40.8 47.404 49.396 56 60 56Z' fill='white'/%3E%3Cpath d='M60 64C43.432 64 30 71.564 30 80V102.4H90V80C90 71.564 76.568 64 60 64Z' fill='white'/%3E%3C/svg%3E"}
              alt="Profile Photo"
              className="h-[120px] w-[120px] rounded-full border-[4px] border-[#5DD9C1] object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="h-6 w-6 text-white mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span className="text-xs text-white font-semibold text-center px-2">Change</span>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] font-bold text-[#2c3e50]">{mentorName}</h1>
              {profile?.yearsExperience && (
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-600 border border-teal-100">
                  {profile.yearsExperience} Exp
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-[16px] text-[#2c3e50] font-semibold">{mentorTitle}</p>
              <p className="text-[14px] text-teal-500 font-bold uppercase tracking-wide">{profile?.subjectField || "Professional"}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        {/* Left Column */}
        <div className="flex flex-col gap-5">
          {/* About Me */}
          <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <SectionTitle icon={<UserIcon />} title="About Me" />
            <p className="text-[15px] leading-[1.8] text-[#2c3e50] whitespace-pre-wrap">
              {mentorBio}
            </p>
            
            <div className="mt-6">
              <h4 className="text-sm font-bold text-slate-700 mb-3">Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {expertise.length > 0 ? expertise.map((skill, i) => (
                  <span key={i} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200">
                    {skill}
                  </span>
                )) : (
                  <span className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200">
                    {profile?.subjectField}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Student Reviews (Placeholder for now) */}
          <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <SectionTitle icon={<StarIcon />} title="Student Reviews" />
            <div className="py-8 text-center">
              <p className="text-sm text-slate-400 italic">No reviews yet. Completed sessions will show feedback here.</p>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">
          {/* Contact Information */}
          <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <SectionTitle icon={<MailIcon />} title="Contact Information" />

            <InfoRow label="Email" value={profile?.email || mentorEmail} />
            {profile?.phone && <InfoRow label="Phone" value={profile.phone} />}

            <h4 className="mb-[10px] mt-5 text-[14px] font-semibold text-[#2c3e50]">Social Links</h4>

            <div className="mt-[15px] flex flex-col gap-3">
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-teal-600 hover:underline">
                  <LinkedInIcon /> LinkedIn Profile
                </a>
              )}
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-teal-600 hover:underline">
                  <GitHubIcon /> GitHub Profile
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-teal-600 hover:underline">
                  <TwitterIcon /> Twitter Profile
                </a>
              )}
              {!socialLinks.linkedin && !socialLinks.github && !socialLinks.twitter && (
                <p className="text-[13px] text-[#7f8c8d]">No social links added yet.</p>
              )}
            </div>
          </section>

          {/* Availability */}
          <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <SectionTitle icon={<ClockIcon />} title="Availability" />

            <InfoRow label="Monday - Friday" value={findAvail("Monday - Friday")} />
            <InfoRow label="Saturday" value={findAvail("Saturday")} />
            <InfoRow label="Sunday" value={findAvail("Sunday")} />
            <InfoRow label="Response Time" value={profile?.responseTime || findAvail("Response Time")} />
          </section>
        </div>
      </div>
    </>
  );
}

/* ----------------- Small UI Components ----------------- */
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
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
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

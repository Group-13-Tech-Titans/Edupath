import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import * as mentorApi from "../../api/mentorApi.js";

export default function MentorPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (id) {
      setLoading(true);
      mentorApi.getPublicMentorProfile(id)
        .then(data => {
          setMentor(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch mentor:", err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl py-20 text-center">
          <p className="text-slate-500">Loading mentor profile...</p>
        </div>
      </PageShell>
    );
  }

  if (!mentor) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl py-20 text-center">
          <h1 className="text-2xl font-bold text-[#2c3e50]">Mentor not found</h1>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 text-[#5DD9C1] font-bold hover:underline"
          >
            ← Go back
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-[#7f8c8d] hover:text-[#5DD9C1] transition-colors font-semibold"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to selection
        </button>

        {/* Profile Header */}
        <section className="mb-5 rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative flex-shrink-0">
              <img
                src={mentor.avatar || "https://via.placeholder.com/150"}
                alt={mentor.name}
                className="h-[120px] w-[120px] rounded-full border-[4px] border-[#5DD9C1] object-cover"
              />
            </div>

            <div className="flex-1">
              <h1 className="mb-1 text-[28px] font-bold text-[#2c3e50]">{mentor.name}</h1>
              <p className="text-[16px] text-[#7f8c8d]">{mentor.title}</p>
            </div>

            <button 
                onClick={() => navigate(`/student/mentor`, { state: { selectedMentorId: mentor.userId, selectedField: mentor.subjectField } })}
                className="bg-[#5DD9C1] hover:bg-[#4bcbb0] text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg shadow-[#5DD9C1]/20 transition-all"
            >
                Book Session
            </button>
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
                {mentor.bio}
              </p>
            </section>

            {/* Student Reviews */}
            <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <SectionTitle icon={<StarIcon />} title="Student Reviews" />

              {mentor.reviews && mentor.reviews.length > 0 ? (
                mentor.reviews.map((review, index) => (
                  <div key={index} className="mb-[18px] rounded-[18px] bg-[#f3f4f6] p-6 last:mb-0">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-[16px] font-bold text-[#243b53]">{review.studentName}</h4>
                        <div className="flex gap-1 text-[#f39c12] text-sm mt-1">
                            {[...Array(5)].map((_, i) => (
                                <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                            ))}
                        </div>
                      </div>
                      <p className="text-[13px] text-[#7b8794]">{review.date}</p>
                    </div>

                    <p className="mb-3 text-[15px] leading-[1.8] text-[#243b53] italic">"{review.comment}"</p>
                  </div>
                ))
              ) : (
                <p className="text-[14px] text-[#7f8c8d] italic">No reviews yet.</p>
              )}
            </section>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-5">
            {/* Contact Information */}
            <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <SectionTitle icon={<MailIcon />} title="Contact Information" />

              <InfoRow label="Email" value={mentor.email} />

              <h4 className="mb-[10px] mt-5 text-[14px] font-semibold text-[#2c3e50]">Social Links</h4>

              <div className="mt-[15px] flex flex-col gap-3">
                {mentor.socialLinks?.linkedin && (
                  <a href={mentor.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-[#5DD9C1] hover:underline">
                    <LinkedInIcon /> LinkedIn
                  </a>
                )}
                {mentor.socialLinks?.github && (
                  <a href={mentor.socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-[#5DD9C1] hover:underline">
                    <GitHubIcon /> GitHub
                  </a>
                )}
                {mentor.socialLinks?.twitter && (
                  <a href={mentor.socialLinks.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-[#5DD9C1] hover:underline">
                    <TwitterIcon /> Twitter
                  </a>
                )}
                {(!mentor.socialLinks || Object.keys(mentor.socialLinks).length === 0) && (
                  <p className="text-[13px] text-[#7f8c8d]">No social links available.</p>
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
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* ----------------- UI Components ----------------- */
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

function ClockIcon() {
  return (
    <svg className="h-6 w-6 text-[#5DD9C1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

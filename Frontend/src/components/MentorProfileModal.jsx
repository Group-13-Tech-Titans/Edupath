import React from "react";

const MentorProfileModal = ({ mentor, isOpen, onClose, onSelect }) => {
  if (!isOpen || !mentor) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-[#f8fafc] shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 z-10 h-10 w-10 rounded-full bg-white/80 text-slate-500 shadow-md hover:bg-white hover:text-red-500 transition-all grid place-items-center"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
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
                        <div className="flex flex-wrap gap-2 items-center">
                            <p className="text-[16px] text-[#7f8c8d]">{mentor.title}</p>
                            <span className="rounded-full bg-[#5DD9C1]/10 px-3 py-0.5 text-xs font-bold text-[#5DD9C1] border border-[#5DD9C1]/20">
                                {mentor.subjectField}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            onSelect(mentor.userId);
                            onClose();
                        }}
                        className="bg-[#5DD9C1] hover:bg-[#4bcbb0] text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-lg shadow-[#5DD9C1]/20 transition-all"
                    >
                        Select Mentor
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

                                <p className="mb-3 text-[15px] leading-[1.8] text-[#243b53]">"{review.comment}"</p>
                            </div>
                            ))
                        ) : (
                             <p className="text-[14px] text-[#7f8c8d]">No reviews yet.</p>
                        )}
                    </section>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-5">
                    {/* Contact Information */}
                    <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                        <SectionTitle icon={<MailIcon />} title="Contact Information" />

                        <div className="flex justify-between border-b border-[#e0e0e0] py-[15px] last:border-b-0">
                            <span className="text-[14px] text-[#7f8c8d]">Email</span>
                            {mentor.email ? (
                                <a href={`mailto:${mentor.email}`} className="text-[14px] font-semibold text-[#5DD9C1] hover:underline">
                                    {mentor.email}
                                </a>
                            ) : (
                                <span className="text-[14px] font-semibold text-[#2c3e50]">Not available</span>
                            )}
                        </div>

                        <h4 className="mb-[10px] mt-5 text-[14px] font-semibold text-[#2c3e50]">Social Links</h4>

                        <div className="mt-[15px] flex flex-col gap-3">
                            {mentor.socialLinks?.linkedin && (
                                <a href={mentor.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-[#5DD9C1] hover:underline">
                                    <LinkedInIcon /> LinkedIn Profile
                                </a>
                            )}
                            {mentor.socialLinks?.github && (
                                <a href={mentor.socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-[#5DD9C1] hover:underline">
                                    <GitHubIcon /> GitHub Profile
                                </a>
                            )}
                            {mentor.socialLinks?.twitter && (
                                <a href={mentor.socialLinks.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-[#5DD9C1] hover:underline">
                                    <TwitterIcon /> Twitter Profile
                                </a>
                            )}
                            {!mentor.socialLinks?.linkedin && !mentor.socialLinks?.github && !mentor.socialLinks?.twitter && (
                                <p className="text-[13px] text-[#7f8c8d]">No social links shared.</p>
                            )}
                        </div>
                    </section>

                    <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                        <SectionTitle icon={<ClockIcon />} title="Availability" />

                        {mentor.availability && mentor.availability.length > 0 ? (
                            mentor.availability.map((a, i) => (
                                <div key={i} className="flex justify-between border-b border-[#e0e0e0] py-[10px] last:border-b-0">
                                    <span className="text-[14px] font-semibold text-[#2c3e50]">{a}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400">Availability not specified.</p>
                        )}
                        <div className="mt-4">
                            <InfoRow label="Response Time" value="< 24 Hours" />
                        </div>
                    </section>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

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

export default MentorProfileModal;

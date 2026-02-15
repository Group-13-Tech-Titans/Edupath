import React, { useMemo, useState } from "react";
import PageShell from "../../components/PageShell.jsx";
import AdminFooter from "./AdminFooter.jsx";


const mockRecentRequests = [
  {
    id: "req-1001",
    fullName: "Amal Perera",
    email: "amal.perera@edupath.com",
    field: "Software Engineering",
    educationLevel: "BSc",
    courseCount: 4,
    submittedAt: "2026-02-10T10:30:00.000Z",
    docs: { nic: true, certificate: true, portfolio: "https://portfolio.example/john" },
  },
  {
    id: "req-1002",
    fullName: "Sahan Fernando",
    email: "sahan.fernando@edupath.com",
    field: "UI/UX Design",
    educationLevel: "Diploma",
    courseCount: 2,
    submittedAt: "2026-02-11T15:05:00.000Z",
    docs: { nic: true, certificate: false, portfolio: "https://behance.net/sarah" },
  },
  {
    id: "req-1003",
    fullName: "Kevin Silva",
    email: "kevin.silva@edupath.com",
    field: "Data Science",
    educationLevel: "MSc",
    courseCount: 6,
    submittedAt: "2026-02-12T09:10:00.000Z",
    docs: { nic: true, certificate: true, portfolio: "https://github.com/kevinsilva" },
  },
];

const AdminVerifyEducators = () => {
  const [requests] = useState(mockRecentRequests);

  const sorted = useMemo(() => {
    return [...requests].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }, [requests]);

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-text-dark">
                Educator Requests
              </h1>
              <p className="mt-1 text-xs text-muted">
                Recent educator verification requests submitted to the platform.
              </p>
            </div>
            <a
              href="/coming-soon"
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90"
            >
              View All Requests
            </a>
          </div>
        </div>

        {/* Requests List (matches screenshot style) */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-dark">Requests</h2>
            <span className="text-xs text-muted">
              <a
              href="/coming-soon"
              className=" px-4 py-2 text-xs font-semibold text-black hover:bg-primary/90 hover:text-white rounded-full"
            >
              View All
            </a>
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {sorted.map((e) => (
              <RequestCard key={e.id} educator={e} />
            ))}

            {sorted.length === 0 && (
              <div className="rounded-2xl border border-black/5 bg-white/60 p-4 text-sm text-muted">
                No educators found for this filter.
              </div>
            )}
          </div>
        </div>

        <AdminFooter />
      </div>
    </PageShell>
  );
};

const RequestCard = ({ educator }) => {
  return (
    <div className="rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar name={educator.fullName || educator.email} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-dark">
              {educator.fullName}
            </p>
            <p className="truncate text-xs text-muted">{educator.email}</p>

            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <MiniPill label={`Field: ${educator.field || "N/A"}`} />
              <MiniPill label={`Level: ${educator.educationLevel || "N/A"}`} />
              <MiniPill label={`Courses: ${educator.courseCount ?? 0}`} />
              <MiniPill
                label={`Submitted: ${
                  educator.submittedAt
                    ? new Date(educator.submittedAt).toLocaleDateString()
                    : "—"
                }`}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted">
              <DocLine label="NIC" ok={!!educator.docs?.nic} />
              <DocLine label="Certificates" ok={!!educator.docs?.certificate} />
              <DocLink label="Portfolio" url={educator.docs?.portfolio} />
            </div>
          </div>
        </div>

        <button
          onClick={() => window.location.href = "/coming-soon"}
          className="rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-200"
        >
          Action
        </button>
      </div>
    </div>
  );
};

const MiniPill = ({ label }) => (
  <span className="rounded-full bg-black/5 px-3 py-1">{label}</span>
);

const DocLine = ({ label, ok }) => (
  <span
    className={`rounded-full px-3 py-1 ${
      ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
    }`}
  >
    {label}: {ok ? "Provided" : "Missing"}
  </span>
);

const DocLink = ({ label, url }) => (
  <span className="rounded-full bg-black/5 px-3 py-1">
    {label}:{" "}
    {url ? (
      <a
        className="text-primary font-semibold hover:underline"
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        Open
      </a>
    ) : (
      "N/A"
    )}
  </span>
);

const Avatar = ({ name }) => (
  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-sm">
    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
      {getInitials(name)}
    </div>
  </div>
);

function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "E";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

export default AdminVerifyEducators;

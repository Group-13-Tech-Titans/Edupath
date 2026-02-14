import React, { useEffect, useMemo, useState } from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import AdminFooter from "./AdminFooter.jsx";

const LS_USERS_KEY = "edupath_users_v1";

const mockEducatorUsers = [
  {
    id: "edu-1001",
    role: "educator",
    status: "PENDING_VERIFICATION",
    fullName: "John Perera",
    email: "john.perera@edupath.com",
    phone: "+94 77 123 4567",
    field: "Software Engineering",
    educationLevel: "BSc",
    courseCount: 4,
    submittedAt: "2026-02-10T10:30:00.000Z",
    docs: {
      nic: true,
      certificate: true,
      portfolio: "https://portfolio.example/john",
      linkedin: "https://linkedin.com/in/johnperera",
    },
  },
  {
    id: "edu-1002",
    role: "educator",
    status: "PENDING_VERIFICATION",
    fullName: "Sarah Fernando",
    email: "sarah.fernando@edupath.com",
    phone: "+94 71 987 4321",
    field: "UI/UX Design",
    educationLevel: "Diploma",
    courseCount: 2,
    submittedAt: "2026-02-11T15:05:00.000Z",
    docs: {
      nic: true,
      certificate: false,
      portfolio: "https://behance.net/sarah",
      linkedin: "https://linkedin.com/in/sarahfernando",
    },
  },
  {
    id: "edu-1003",
    role: "educator",
    status: "VERIFIED",
    fullName: "Kevin Silva",
    email: "kevin.silva@edupath.com",
    phone: "+94 75 555 2222",
    field: "Data Science",
    educationLevel: "MSc",
    courseCount: 6,
    submittedAt: "2026-02-05T09:10:00.000Z",
    docs: {
      nic: true,
      certificate: true,
      portfolio: "https://github.com/kevinsilva",
      linkedin: "https://linkedin.com/in/kevinsilva",
    },
  },
  {
    id: "edu-1004",
    role: "educator",
    status: "REJECTED",
    fullName: "Nimal Jayasinghe",
    email: "nimal.j@edupath.com",
    phone: "+94 76 222 1111",
    field: "Business Management",
    educationLevel: "BBA",
    courseCount: 1,
    submittedAt: "2026-02-04T18:40:00.000Z",
    docs: {
      nic: false,
      certificate: false,
      portfolio: "",
      linkedin: "",
    },
    rejectionReason: "Missing identity verification documents.",
  },
];


const AdminVerifyEducators = () => {
  const app = useApp();
  const usersFromApp = app.users || [];
  const setUsers = app.setUsers;

  const [users, setLocalUsers] = useState(usersFromApp);

  useEffect(() => {
    if (usersFromApp && usersFromApp.length > 0) {
      setLocalUsers(usersFromApp);
      return;
    }

    const raw = localStorage.getItem(LS_USERS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLocalUsers(parsed);
          return;
        }
      } catch {
      }
    }

    // fallback to mock
    setLocalUsers(mockEducatorUsers);
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(mockEducatorUsers));
  }, [usersFromApp]);

  // keep app state in sync if setUsers exists
  useEffect(() => {
    if (typeof setUsers === "function" && users && users.length) {
      setUsers(users);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState("PENDING_VERIFICATION");

  const educators = useMemo(
    () => users.filter((u) => u.role === "educator"),
    [users]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return educators
      .filter((e) => e.status === statusTab)
      .filter((e) => {
        if (!q) return true;
        const hay = `${e.fullName || ""} ${e.email || ""} ${e.field || ""} ${
          e.educationLevel || ""
        }`.toLowerCase();
        return hay.includes(q);
      });
  }, [educators, query, statusTab]);

  const counts = useMemo(() => {
    const pending = educators.filter((e) => e.status === "PENDING_VERIFICATION").length;
    const verified = educators.filter((e) => e.status === "VERIFIED").length;
    const rejected = educators.filter((e) => e.status === "REJECTED").length;
    return { pending, verified, rejected };
  }, [educators]);

  const [toast, setToast] = useState(null);
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2200);
  };

  const persist = (next) => {
    setLocalUsers(next);
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(next));
  };

  const updateStatus = (id, nextStatus) => {
    const next = users.map((u) =>
      u.id === id ? { ...u, status: nextStatus, updatedAt: new Date().toISOString() } : u
    );
    persist(next);

    showToast(
      "success",
      nextStatus === "VERIFIED" ? "Educator Approved ✅" : "Educator Rejected ❌"
    );
  };

  const TabBtn = ({ value, label, count }) => (
    <button
      onClick={() => setStatusTab(value)}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        statusTab === value
          ? "bg-primary/60 text-white shadow"
          : "bg-white/70 text-text-dark hover:bg-white/90"
      }`}
    >
      {label}
      <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs">
        {count}
      </span>
    </button>
  );

  return (
    <PageShell>
      {toast && (
        <div className="fixed right-4 top-20 z-50">
          <div
            className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur bg-white/80 ${
              toast.type === "success"
                ? "border-emerald-200 text-emerald-700"
                : "border-red-200 text-red-600"
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-text-dark">
                Verify Educators
              </h1>
              <p className="mt-1 text-xs text-muted">
                Review educator verification submissions and approve/reject requests.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  localStorage.setItem(LS_USERS_KEY, JSON.stringify(mockEducatorUsers));
                  setLocalUsers(mockEducatorUsers);
                  
                }}
                className="rounded-full bg-primary/15 px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-primary/20"
              >
                view Educators
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Pending Requests" value={counts.pending} />
          <StatCard label="Verified Educators" value={counts.verified} />
          <StatCard label="Rejected Requests" value={counts.rejected} />
        </div>

        {/* Tabs + Search */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <TabBtn value="PENDING_VERIFICATION" label="Pending" count={counts.pending} />
              <TabBtn value="VERIFIED" label="Verified" count={counts.verified} />
              <TabBtn value="REJECTED" label="Rejected" count={counts.rejected} />
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                🔎
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name/email/field..."
                className="w-full lg:w-[340px] rounded-2xl border border-black/10 bg-white/70 pl-9 pr-4 py-3 text-sm text-text-dark shadow-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-dark">Requests</h2>
            <span className="text-xs text-muted">
              Showing{" "}
              <span className="font-semibold text-text-dark">{filtered.length}</span>
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {filtered.map((e) => (
              <EducatorCard
                key={e.id}
                educator={e}
                statusTab={statusTab}
                onApprove={() => updateStatus(e.id, "VERIFIED")}
                onReject={() => updateStatus(e.id, "REJECTED")}
              />
            ))}

            {filtered.length === 0 && (
              <div className="rounded-2xl border border-black/5 bg-white/60 p-4 text-sm text-muted">
                No educators found for this filter.
              </div>
            )}
          </div>
        </div>
        <div>
        <br/>
         <AdminFooter />
      </div>
      </div>
    </PageShell>
  );
};


const StatCard = ({ label, value }) => (
  <div className="rounded-[22px] border border-black/5 bg-white/75 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.08)] backdrop-blur">
    <p className="text-sm text-text-dark/70">{label}</p>
    <p className="mt-2 text-4xl font-extrabold tracking-tight text-text-dark">
      {value}
    </p>
  </div>
);

const EducatorCard = ({ educator, statusTab, onApprove, onReject }) => {
  const badge = getBadge(educator.status);

  return (
    <div className="rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar name={educator.fullName || educator.email} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-text-dark">
                {educator.fullName || "Unnamed Educator"}
              </p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                {badge.text}
              </span>
            </div>

            <p className="truncate text-xs text-muted">{educator.email}</p>

            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <MiniPill label={`Field: ${educator.field || "N/A"}`} />
              <MiniPill label={`Level: ${educator.educationLevel || "N/A"}`} />
              <MiniPill label={`Courses: ${educator.courseCount ?? 0}`} />
              <MiniPill
                label={`Submitted: ${educator.submittedAt ? new Date(educator.submittedAt).toLocaleDateString() : "—"}`}
              />
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 text-[11px] text-muted">
              <DocLine label="NIC" ok={!!educator.docs?.nic} />
              <DocLine label="Certificates" ok={!!educator.docs?.certificate} />
              <DocLink label="Portfolio" url={educator.docs?.portfolio} />
              <DocLink label="LinkedIn" url={educator.docs?.linkedin} />
            </div>

            {educator.rejectionReason && educator.status === "REJECTED" && (
              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50/60 p-3 text-xs text-red-600">
                Reason: {educator.rejectionReason}
              </div>
            )}
          </div>
        </div>

        
        <div className="flex flex-wrap items-center gap-2">
          

          {statusTab === "PENDING_VERIFICATION" ? (
            <>
              <button
                onClick={onReject}
                className="rounded-full bg-black/5 px-5 py-2 text-sm font-semibold text-text-dark hover:bg-black/10"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow hover:brightness-95"
              >
                Approve
              </button>
            </>
          ) : (
            <button className="rounded-full bg-primary/15 px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/20">
              View History
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

const MiniPill = ({ label }) => (
  <span className="rounded-full bg-black/5 px-3 py-1">{label}</span>
);

const DocLine = ({ label, ok }) => (
  <span className={`rounded-full px-3 py-1 ${ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
    {label}: {ok ? "Provided" : "Missing"}
  </span>
);

const DocLink = ({ label, url }) => (
  <span className="rounded-full bg-black/5 px-3 py-1">
    {label}:{" "}
    {url ? (
      <a className="text-primary font-semibold hover:underline" href={url} target="_blank" rel="noreferrer">
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

function getBadge(status) {
  if (status === "PENDING_VERIFICATION")
    return { text: "Pending", className: "bg-amber-100 text-amber-700" };
  if (status === "VERIFIED")
    return { text: "Verified", className: "bg-emerald-100 text-emerald-700" };
  return { text: "Rejected", className: "bg-red-100 text-red-600" };
}

export default AdminVerifyEducators;

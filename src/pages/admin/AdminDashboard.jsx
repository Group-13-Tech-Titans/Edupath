import React, { useMemo, useState } from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const AdminDashboard = () => {
  const { users, courses } = useApp();

  // ---- Mock numbers like your UI (replace with real fields if you already have them)
  const totalUsers = users?.length || 0;

  const educators = useMemo(
    () => (users || []).filter((u) => u.role === "educator"),
    [users]
  );

  const pendingEducators = useMemo(
    () => educators.filter((e) => e.status === "PENDING_VERIFICATION"),
    [educators]
  );

  const pendingCourses = useMemo(
    () => (courses || []).filter((c) => c.status === "pending"),
    [courses]
  );

  // Simple demo "subscriptions/payments"
  const activeSubscriptions = Math.max(0, Math.round(totalUsers * 0.15));
  const paymentsToReview = Math.max(0, Math.min(35, pendingCourses.length + 10));

  // Approvals list (UI mock)
  const [approvals, setApprovals] = useState([
    {
      id: "a1",
      title: "Educator Verification: yasindu",
      subtitle: "Submitted certificates + portfolio links",
      type: "educator",
    },
    {
      id: "a2",
      title: "Mentor Verification: gunasekara",
      subtitle: "5+ years exp • references attached",
      type: "mentor",
    },
    {
      id: "a3",
      title: "Mentor Verification: ramrasu",
      subtitle: "5+ years exp • references attached",
      type: "mentor",
    },
  ]);

  const handleDecision = (id, decision) => {
    setApprovals((prev) => prev.filter((x) => x.id !== id));
   
  };

  return (
    <PageShell>
      <div className="space-y-6">
        {/* System Dashboard banner */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-text-dark">
                System Dashboard
              </h1>
              <p className="mt-1 text-xs text-muted">
                View platform stats, approvals, user handling, and payment
                operations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow hover:brightness-95">
                Export Reports
              </button>
              <button className="rounded-full bg-primary/15 px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-primary/20">
                System Status
              </button>
            </div>
          </div>
        </div>

        {/* KPI tiles */}
        <div className="grid gap-4 sm:grid-cols-2">
          <KpiCard label="Total Users" value={formatK(totalUsers || 12480)} />
          <KpiCard
            label="Active Subscriptions"
            value={formatK(activeSubscriptions || 1942)}
          />
          <KpiCard
            label="Pending Educator Approvals"
            value={pendingEducators.length || 27}
          />
          <KpiCard label="Payments to Review" value={paymentsToReview || 19} />
        </div>

        {/* Approvals & Requests */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-dark">
              Verify Educators
            </h2>
            <button className="text-sm font-semibold text-primary" onClick={() => window.location.href = '/admin/verify-educators'}>View All</button>
          </div>

          <div className="mt-4 space-y-3">
            {approvals.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-3 rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-text-dark">
                    {a.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{a.subtitle}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDecision(a.id, "rejected")}
                    className="rounded-full bg-black/5 px-5 py-2 text-sm font-semibold text-text-dark hover:bg-black/10"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleDecision(a.id, "approved")}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow hover:brightness-95"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}

            {approvals.length === 0 && (
              <div className="rounded-[22px] border border-black/5 bg-white/60 p-4 text-sm text-muted">
                No approvals pending right now.
              </div>
            )}
          </div>
        </div>

        {/* Platform Statistics */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-dark">
              Platform Statistics
            </h2>
            <span className="text-xs font-semibold text-muted">Last 30 days</span>
          </div>

          <div className="mt-4 rounded-[22px] border border-dashed border-black/10 bg-white/60 p-10 text-center text-sm text-muted">
            KPI graph placeholder (MAU / Conversions / Revenue)
          </div>
        </div>

        {/* User Handling */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-dark">
              User Handling
            </h2>
            <span className="text-sm font-semibold text-primary">Open</span>
          </div>

          <div className="mt-4 space-y-3">
            <IssueRow
              title="Reported User: user_1029"
              subtitle="Spam messages in mentorship chat"
              badge="High"
              tone="danger"
            />
            <IssueRow
              title="Educator Payout Issue"
              subtitle="Bank details mismatch"
              badge="Medium"
              tone="warn"
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow hover:brightness-95">
              Manage Users
            </button>
            <button className="rounded-full bg-primary/15 px-5 py-3 text-sm font-semibold text-primary shadow-sm hover:bg-primary/20">
              Role & Access
            </button>
          </div>
        </div>

        {/* Payments Review */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-dark">
              Payments Review
            </h2>
            <button className="text-sm font-semibold text-primary hover:underline">
              View All
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <PaymentRow
              title="Student Payment"
              subtitle="Rs 30,000 • Course: Web Dev Bootcamp"
              action="Verify"
            />
            <PaymentRow
              title="Educator Withdrawal"
              subtitle="Rs 75,000 • Bank Transfer"
              action="Approve"
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow hover:brightness-95">
              Approve Selected
            </button>
            <button className="rounded-full bg-primary/15 px-5 py-3 text-sm font-semibold text-primary shadow-sm hover:bg-primary/20">
              Flag
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="grid gap-6 sm:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm">
                  🎓
                </div>
                <p className="font-semibold text-text-dark">EduPath</p>
              </div>
              <p className="mt-3 text-xs text-muted">
                Empowering learners worldwide with quality education and
                personalized learning paths.
              </p>
              <div className="mt-3 flex gap-2">
                <IconDot>f</IconDot>
                <IconDot>x</IconDot>
                <IconDot>in</IconDot>
                <IconDot>ig</IconDot>
              </div>
            </div>

            <FooterCol
              title="Quick Links"
              items={["Browse Courses", "Career Paths", "My Learning", "Become an Instructor"]}
            />
            <FooterCol
              title="Support"
              items={["Help Center", "Contact Us", "FAQs", "Community"]}
            />
            <FooterCol
              title="Legal"
              items={[
                "Terms & Conditions",
                "Privacy Policy",
                "Cookie Policy",
                "Accessibility",
              ]}
            />
          </div>

          <div className="mt-6 border-t border-black/5 pt-4 text-center text-xs text-muted">
            2025 EduPath. All rights reserved.
          </div>
        </footer>
      </div>
    </PageShell>
  );
};


const KpiCard = ({ label, value }) => {
  return (
    <div className="rounded-[22px] border border-black/5 bg-white/75 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.08)] backdrop-blur">
      <p className="text-sm text-text-dark/70">{label}</p>
      <p className="mt-2 text-4xl font-extrabold tracking-tight text-text-dark">
        {value}
      </p>
    </div>
  );
};

const IssueRow = ({ title, subtitle, badge, tone = "warn" }) => {
  const badgeClass =
    tone === "danger"
      ? "bg-red-100 text-red-600"
      : "bg-amber-100 text-amber-700";

  return (
    <div className="flex items-center justify-between rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-text-dark">{title}</p>
        <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
        {badge}
      </span>
    </div>
  );
};

const PaymentRow = ({ title, subtitle, action }) => {
  return (
    <div className="flex items-center justify-between rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-text-dark">{title}</p>
        <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
      </div>
      <button className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-200">
        {action}
      </button>
    </div>
  );
};

const FooterCol = ({ title, items }) => (
  <div>
    <p className="text-sm font-semibold text-text-dark">{title}</p>
    <ul className="mt-3 space-y-2 text-xs text-muted">
      {items.map((x) => (
        <li key={x} className="hover:text-text-dark hover:underline cursor-pointer">
          {x}
        </li>
      ))}
    </ul>
  </div>
);

const IconDot = ({ children }) => (
  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
    {children}
  </div>
);

function formatK(n) {
  if (typeof n !== "number") return n;
  if (n >= 1000) return n.toLocaleString();
  return String(n);
}

export default AdminDashboard;

import React, { useMemo, useState } from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import AdminFooter from "./AdminFooter.jsx";
import ComingSoon from "../ComingSoon.jsx";


const AdminDashboard = () => {
  const { users, courses } = useApp();


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



  const [approvals, setApprovals] = useState([
    {
      id: "a1",
      title: "Educator Verification: Amal perera",
      subtitle: "Submitted certificates + portfolio links",
      type: "educator",
    },
    {
      id: "a2",
      title: "Mentor Verification: Kamalika Jayasuriya",
      subtitle: "5+ years exp • references attached",
      type: "mentor",
    },
    {
      id: "a3",
      title: "Mentor Verification: Nimalka Fernando",
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
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-text-dark">
                System Dashboard
              </h1>
              <p className="mt-1 text-xs text-muted">
                Manage platform users, verify educators, and add reviewers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              
              <button className="rounded-full bg-primary/15 px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-primary/20" onClick={() => window.location.href = '/admin/profile'}>
                Profile
              </button>
            </div>
          </div>
        </div>

        

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

        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-dark">
              Platform Statistics
            </h2>
            <span className="text-xs font-semibold text-muted">Last 30 days</span>
          </div>

          <div className="mt-4 rounded-[22px] border border-dashed border-black/10 bg-white/60 p-10 text-center text-sm text-muted">
            Comming Soon
          </div>
        </div>

       
        <AdminFooter />
      </div>
    </PageShell>
  );
};


export default AdminDashboard;

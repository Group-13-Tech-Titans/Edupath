import React from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const AdminVerifyEducators = () => {
  const { users, verifyEducator } = useApp();
  const pending = users.filter(
    (u) => u.role === "educator" && u.status === "PENDING_VERIFICATION"
  );

  return (
    <PageShell>
      <div className="glass-card p-5 text-xs">
        <h1 className="text-xl font-semibold text-text-dark">
          Educator verification
        </h1>
        <p className="mt-1 text-muted">
          Review pending educator applications and approve or reject them.
        </p>
        <div className="mt-4 space-y-3">
          {pending.map((edu) => (
            <div
              key={edu.id}
              className="flex flex-col gap-3 rounded-2xl bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-text-dark">{edu.name}</p>
                <p className="text-[11px] text-muted">{edu.email}</p>
                <p className="mt-1 text-[11px] text-muted">
                  Specialization tag:{" "}
                  <span className="font-medium text-text-dark">
                    {edu.specializationTag || "N/A"}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => verifyEducator(edu.email, "VERIFIED")}
                  className="rounded-full bg-emerald-500 px-4 py-1 text-[11px] font-medium text-white hover:bg-emerald-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => verifyEducator(edu.email, "REJECTED")}
                  className="rounded-full bg-red-500 px-4 py-1 text-[11px] font-medium text-white hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {pending.length === 0 && (
            <p className="text-sm text-muted">No pending educator applications.</p>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default AdminVerifyEducators;


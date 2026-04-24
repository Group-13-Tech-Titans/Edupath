import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";

const mockHistory = [
  { date: "2026-02-06", ref: "#PAYOUT-1042", amount: "Rs 25,000", status: "Completed" },
  { date: "2026-01-22", ref: "#PAYOUT-1037", amount: "Rs 18,500", status: "Completed" },
  { date: "2026-01-10", ref: "#PAYOUT-1031", amount: "Rs 12,000", status: "Completed" },
];

const StatCard = ({ label, value, sub }) => (
  <div className="glass-card p-5">
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold text-text-dark">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted">{sub}</p>}
    </div>
  </div>
);

const EducatorPayouts = () => {
  const navigate = useNavigate();

  return (
    <PageShell>
      <div className="space-y-6">

        {/* Header */}
        <div className="glass-card p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text-dark">Payout &amp; Earnings</h1>
            <p className="mt-1 text-xs text-muted">
              Track your revenue, pending balance, and payout history.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-soft px-5 py-2 text-sm self-start sm:self-auto"
          >
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Earnings"  value="Rs 1,245,000" sub="All-time revenue" />
          <StatCard label="This Month"      value="Rs 182,000"   sub="February revenue" />
          <StatCard label="Pending Payout"  value="Rs 55,500"    sub="Awaiting transfer" />
        </div>

        {/* Payout method */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-text-dark mb-4">Payout Method</h2>
          <div className="rounded-2xl border border-black/8 bg-white/60 px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-semibold text-text-dark">Bank Transfer</p>
                <p className="text-xs text-muted">Account ending **** 4481</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/educator/profile#payout-details")}
              className="btn-soft px-5 py-2 text-xs self-start sm:self-auto"
            >
              Update Bank Details
            </button>
          </div>
        </div>

        {/* Payout history */}
        <div className="glass-card p-6">
          <div className="mb-4">
            <h2 className="font-semibold text-text-dark">Payout History</h2>
            <p className="mt-0.5 text-xs text-muted">Recent withdrawals and their statuses.</p>
          </div>

          {mockHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white/50 px-6 py-12 text-center">
              <p className="text-sm font-medium text-muted">No payout history yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-black/5">
              <table className="min-w-full text-left text-xs">
                <thead className="border-b border-black/5 bg-white/60">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-muted">Date</th>
                    <th className="px-4 py-3 font-semibold text-muted">Reference</th>
                    <th className="px-4 py-3 font-semibold text-muted">Amount</th>
                    <th className="px-4 py-3 font-semibold text-muted">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 bg-white/40">
                  {mockHistory.map((row) => (
                    <tr key={row.ref} className="hover:bg-primary/5 transition">
                      <td className="px-4 py-3 text-muted">{row.date}</td>
                      <td className="px-4 py-3 font-semibold text-text-dark">{row.ref}</td>
                      <td className="px-4 py-3 font-semibold text-text-dark">{row.amount}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[10px] font-semibold text-primary">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" className="btn-soft px-4 py-1.5 text-[11px]">
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </PageShell>
  );
};

export default EducatorPayouts;

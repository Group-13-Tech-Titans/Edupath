import React from "react";
import PageShell from "../../components/PageShell.jsx";

const mockHistory = [
  { date: "2026-02-05", ref: "#PAYOUT-1042", amount: "Rs 25,000" },
  { date: "2026-01-22", ref: "#PAYOUT-1037", amount: "Rs 18,500" },
  { date: "2026-01-10", ref: "#PAYOUT-1031", amount: "Rs 12,000" }
];

const EducatorPayouts = () => {
  return (
    <PageShell>
      <div className="space-y-5">
        <div className="glass-card p-5">
          <h1 className="text-xl font-semibold text-text-dark">Payout & earnings</h1>
          <p className="mt-1 text-xs text-muted">
            Track your revenue, pending balance, and payout history. This is mock data
            only.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3 text-xs">
            <div className="rounded-2xl bg-white/80 p-4 shadow">
              <p className="text-muted">Total earnings</p>
              <p className="mt-1 text-2xl font-semibold text-text-dark">Rs 1,245,000</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow">
              <p className="text-muted">This month</p>
              <p className="mt-1 text-2xl font-semibold text-text-dark">Rs 182,000</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow">
              <p className="text-muted">Pending balance</p>
              <p className="mt-1 text-2xl font-semibold text-text-dark">Rs 32,000</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 text-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-dark">Payout history</h2>
            <button className="btn-outline px-4 py-1 text-xs">Export</button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-[11px]">
              <thead className="border-b border-black/5 text-muted">
                <tr>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Reference</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {mockHistory.map((row) => (
                  <tr key={row.ref} className="border-b border-black/5 last:border-0">
                    <td className="py-2 pr-4">{row.date}</td>
                    <td className="py-2 pr-4">{row.ref}</td>
                    <td className="py-2 pr-4">{row.amount}</td>
                    <td className="py-2 pr-4 text-right">
                      <button className="rounded-full border border-primary px-3 py-1 text-[11px] text-primary hover:bg-primary/5">
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default EducatorPayouts;


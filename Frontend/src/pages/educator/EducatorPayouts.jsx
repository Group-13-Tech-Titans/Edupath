import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";

const mockHistory = [
  { date: "2026-02-06", ref: "#PAYOUT-1042", amount: "Rs 25,000" },
  { date: "2026-01-22", ref: "#PAYOUT-1037", amount: "Rs 18,500" },
  { date: "2026-01-10", ref: "#PAYOUT-1031", amount: "Rs 12,000" }
];

const EducatorPayouts = () => {
  const navigate = useNavigate();

  const handleRefresh = () => window.location.reload();

  const handleUpdateBankDetails = () => {
    // ✅ Redirect works.
    // ⚠️ Scroll will only work IF EducatorProfile has an element with id="payout-details"
    navigate("/educator/profile#payout-details");
  };

  return (
    <PageShell>
      <div className="space-y-5">
        <div className="glass-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="text-xl font-semibold text-text-dark">PayOut &amp; Earnings</h1>
              <p className="mt-1 text-xs text-muted">
                Track your revenue, pending balance, and payout history. Request withdrawals anytime.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-white/80 p-5 shadow border border-black/5">
              <p className="text-xs text-muted font-semibold">Total Earnings</p>
              <p className="mt-2 text-2xl font-semibold text-text-dark">Rs 1,245,000</p>
              <p className="mt-1 text-[11px] text-muted">All-time revenue</p>
            </div>

            <div className="rounded-2xl bg-white/80 p-5 shadow border border-black/5">
              <p className="text-xs text-muted font-semibold">This Month</p>
              <p className="mt-2 text-2xl font-semibold text-text-dark">Rs 182,000</p>
              <p className="mt-1 text-[11px] text-muted">Feb revenue</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/80 p-4 shadow border border-black/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-text-dark">Payout Method</p>
                <p className="text-[11px] text-muted">Bank Transfer •••• 4481</p>
              </div>

              <button
                type="button"
                onClick={handleUpdateBankDetails}
                className="rounded-full border border-primary px-6 py-2 text-[11px] font-semibold text-primary hover:bg-primary/5 transition"
              >
                Update Bank Details
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={handleRefresh} className="btn-primary px-10 py-2 text-xs" type="button">
              Refresh
            </button>
          </div>
        </div>

        <div className="glass-card p-6">
          <div>
            <h2 className="text-sm font-semibold text-text-dark">Payout History</h2>
            <p className="mt-1 text-[11px] text-muted">Recent withdrawals and statuses</p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-[11px]">
              <thead className="border-b border-black/5 text-muted">
                <tr>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Reference</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4 text-right"></th>
                </tr>
              </thead>

              <tbody>
                {mockHistory.map((row) => (
                  <tr key={row.ref} className="border-b border-black/5 last:border-0">
                    <td className="py-4 pr-4">{row.date}</td>
                    <td className="py-4 pr-4">{row.ref}</td>
                    <td className="py-4 pr-4">{row.amount}</td>
                    <td className="py-4 pr-4 text-right">
                      <button type="button" className="btn-primary px-6 py-2 text-[11px]">
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

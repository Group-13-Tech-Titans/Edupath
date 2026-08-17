import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import axios from "axios";
import toast from "react-hot-toast";
import {
  DollarSign,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  ArrowDownToLine,
  Receipt,
  X,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Users
} from "lucide-react";

// Payout statistic card
const StatCard = ({ label, value, sub, highlight = false }) => (
  <div className={`glass-card p-5 border ${highlight ? "border-emerald-300 bg-emerald-50/40" : "border-black/5"}`}>
    <div>
      <p className="text-xs text-muted font-medium">{label}</p>
      <p className={`mt-0.5 text-2xl font-black tracking-tight ${highlight ? "text-emerald-700" : "text-text-dark"}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-[11px] text-muted">{sub}</p>}
    </div>
  </div>
);

const EducatorPayouts = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useApp();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [payoutMethods, setPayoutMethods] = useState({ bank: {}, card: {} });

  // Withdrawal modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState("bank"); // "bank" or "card"
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  // Bank & Card form for withdrawal
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    branch: ""
  });
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    cardHolder: "",
    cardExpiry: ""
  });

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState(null);

  // Fetch real earnings and payout history from backend
  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("edupath_token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api"}/educator/earnings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setStats(res.data.stats);
        setWithdrawals(res.data.withdrawals || []);
        setPayoutMethods(res.data.payoutMethods || { bank: {}, card: {} });

        if (res.data.payoutMethods?.bank) {
          setBankForm((prev) => ({ ...prev, ...res.data.payoutMethods.bank }));
        }
        if (res.data.payoutMethods?.card) {
          setCardForm((prev) => ({ ...prev, ...res.data.payoutMethods.card }));
        }
        setWithdrawAmount(res.data.stats.currentBalanceUSD ? String(res.data.stats.currentBalanceUSD) : "0");
      }
    } catch (err) {
      console.error("Failed to load earnings data:", err);
      toast.error("Could not fetch latest earnings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const today = new Date();
  const isFirstWeekOfMonth = today.getDate() >= 1 && today.getDate() <= 7;

  const nextPayoutWindowFormatted = useMemo(() => {
    if (stats?.nextWithdrawalStartDate) {
      const start = new Date(stats.nextWithdrawalStartDate);
      const end = new Date(stats.nextWithdrawalEndDate);
      return `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${end.toLocaleDateString("en-US", { day: "numeric", year: "numeric" })}`;
    }
    if (isFirstWeekOfMonth) {
      return `Active Now (Until ${new Date(today.getFullYear(), today.getMonth(), 7).toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
    }
    const nextStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextEnd = new Date(today.getFullYear(), today.getMonth() + 1, 7);
    return `${nextStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${nextEnd.toLocaleDateString("en-US", { day: "numeric", year: "numeric" })}`;
  }, [stats?.nextWithdrawalStartDate, stats?.nextWithdrawalEndDate, isFirstWeekOfMonth, today]);

  const accountEndingText = useMemo(() => {
    const acc = bankForm.accountNumber || currentUser?.profile?.payout?.accountNumber || "";
    const clean = acc.replace(/\D/g, "");
    return clean ? `Account ending in ****${clean.slice(-4)} (${bankForm.bankName || "Bank"})` : "No bank account saved";
  }, [bankForm, currentUser]);

  const cardEndingText = useMemo(() => {
    const num = cardForm.cardNumber || currentUser?.profile?.cardPayout?.cardNumber || "";
    const clean = num.replace(/\D/g, "");
    return clean ? `Card ending in ****${clean.slice(-4)} (${cardForm.cardHolder || "Debit/Credit"})` : "No card saved";
  }, [cardForm, currentUser]);

  /**
   * Handle Withdrawal Request
   */
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid withdrawal amount.");
      return;
    }

    if (amountNum > (stats?.currentBalanceUSD || 0)) {
      toast.error(`Amount exceeds your available balance ($${stats?.currentBalanceUSD?.toFixed(2)} USD).`);
      return;
    }

    if (withdrawMethod === "bank") {
      if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.accountHolder) {
        toast.error("Please fill in your bank name, account number, and holder name.");
        return;
      }
    } else {
      if (!cardForm.cardNumber || cardForm.cardNumber.replace(/\D/g, "").length < 12) {
        toast.error("Please enter a valid card number.");
        return;
      }
    }

    try {
      setWithdrawing(true);
      const token = localStorage.getItem("edupath_token");
      const destinationDetails = withdrawMethod === "bank" ? bankForm : cardForm;

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api"}/educator/withdraw`,
        {
          amount: amountNum,
          method: withdrawMethod,
          destinationDetails,
          allowTestOverride: true // Allows instant withdrawal testing
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Withdrawal completed successfully! 🚀");
        setIsWithdrawModalOpen(false);
        setReceiptData(res.data.withdrawal);
        fetchEarningsData();
      }
    } catch (err) {
      console.error("Withdrawal error:", err);
      toast.error(err.response?.data?.message || "Failed to process withdrawal.");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <PageShell>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="glass-card p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-dark">Payout &amp; Earnings</h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
                $1.00 / STUDENT ENROLLMENT
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Courses are free for students. Earn $1.00 USD for every enrolled student and withdraw during the 1st week of every month (Days 1–7).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchEarningsData}
              disabled={loading}
              className="btn-soft px-4 py-2 text-xs font-semibold self-start sm:self-auto cursor-pointer"
            >
              {loading ? "Refreshing..." : "Refresh Stats"}
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Students Enrolled"
            value={stats?.totalStudentsEnrolled ?? 0}
            sub="All active and enrolled students"
          />
          <StatCard
            label="Total Lifetime Earnings"
            value={`$${(stats?.totalEarnedUSD ?? 0).toFixed(2)}`}
            sub="$1.00 USD per enrolled student"
          />
          <StatCard
            label="This Month Earnings"
            value={`$${(stats?.thisMonthEarnedUSD ?? 0).toFixed(2)}`}
            sub={`Window: ${nextPayoutWindowFormatted}`}
          />
          <StatCard
            label="Available Balance"
            value={`$${(stats?.currentBalanceUSD ?? 0).toFixed(2)}`}
            sub="Withdrawable Days 1–7 of month"
            highlight={(stats?.currentBalanceUSD || 0) > 0}
          />
        </div>

        {/* MONTHLY 1ST WEEK WITHDRAWAL SYSTEM BANNER */}
        <div className="glass-card p-6 border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Monthly Payout Schedule: 1st Week of Every Month (Days 1–7)</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {isFirstWeekOfMonth ? (
                  <span className="text-emerald-700">🎉 1st Week Payout Window is Open (Days 1–7)! Withdrawals Active!</span>
                ) : (
                  <span>Next Payout Window: {nextPayoutWindowFormatted}</span>
                )}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Educators can withdraw their accumulated earnings to their verified <strong>Bank Account</strong> or <strong>Card</strong> during the <strong>first week of every month (Days 1–7)</strong>. Each student enrollment automatically credits <strong>$1.00 USD</strong> to your balance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setWithdrawAmount(stats?.currentBalanceUSD ? String(stats.currentBalanceUSD) : "0");
                  setIsWithdrawModalOpen(true);
                }}
                disabled={(stats?.currentBalanceUSD || 0) <= 0}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black px-6 py-3 rounded-full text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Withdraw ${(stats?.currentBalanceUSD || 0).toFixed(2)} USD</span>
              </button>
            </div>
          </div>
        </div>

        {/* PAYOUT METHOD CONFIGURATION CARDS */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Bank Transfer Card */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-text-dark">Bank Account Transfer</h3>
                    <p className="text-[11px] text-muted">Primary monthly withdrawal method</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Direct Deposit
                </span>
              </div>
              <div className="rounded-2xl bg-white/70 border border-black/5 p-4 space-y-1.5 text-xs text-slate-700 mb-4">
                <p className="font-semibold text-slate-900">{accountEndingText}</p>
                {bankForm.accountHolder && <p className="text-[11px] text-slate-500">Account Holder: {bankForm.accountHolder}</p>}
                {bankForm.branch && <p className="text-[11px] text-slate-500">Branch: {bankForm.branch}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/educator/profile#payout-details")}
              className="btn-soft w-full py-2.5 text-xs font-bold text-center cursor-pointer"
            >
              Update Bank Details in Profile
            </button>
          </div>

          {/* Card Payout */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-text-dark">Debit / Credit Card Payout</h3>
                    <p className="text-[11px] text-muted">Visa, Mastercard direct disbursement</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  Instant Card Transfer
                </span>
              </div>
              <div className="rounded-2xl bg-white/70 border border-black/5 p-4 space-y-1.5 text-xs text-slate-700 mb-4">
                <p className="font-semibold text-slate-900">{cardEndingText}</p>
                <p className="text-[11px] text-slate-500">Withdraw earnings directly onto your card during the first week of the month (Days 1–7).</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setWithdrawMethod("card");
                setIsWithdrawModalOpen(true);
              }}
              className="btn-soft w-full py-2.5 text-xs font-bold text-center cursor-pointer"
            >
              Configure Card Payout
            </button>
          </div>
        </div>

        {/* PAYOUT HISTORY TABLE */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-text-dark text-base">Withdrawal &amp; Payout History</h2>
              <p className="mt-0.5 text-xs text-muted">
                Completed disbursements transferred to your bank account or card.
              </p>
            </div>
          </div>

          {withdrawals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white/50 px-6 py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <Receipt className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No withdrawal history yet.</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Once you make a withdrawal on the 1st of the month, your receipts and transaction status will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-black/5">
              <table className="min-w-full text-left text-xs">
                <thead className="border-b border-black/5 bg-white/60">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-muted">Date</th>
                    <th className="px-4 py-3 font-semibold text-muted">Reference</th>
                    <th className="px-4 py-3 font-semibold text-muted">Destination</th>
                    <th className="px-4 py-3 font-semibold text-muted">Amount (USD)</th>
                    <th className="px-4 py-3 font-semibold text-muted">Status</th>
                    <th className="px-4 py-3 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 bg-white/40">
                  {withdrawals.map((row) => (
                    <tr key={row.payoutId || row.reference} className="hover:bg-primary/5 transition">
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-text-dark">
                        {row.payoutId || row.reference}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {row.destination || (row.method === "card" ? "Card Transfer" : "Bank Transfer")}
                      </td>
                      <td className="px-4 py-3 font-black text-emerald-700">
                        ${Number(row.amountUSD || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{row.status || "Completed"}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setReceiptData(row)}
                          className="btn-soft px-3 py-1 text-[11px] font-bold cursor-pointer"
                        >
                          View Receipt
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

      {/* ================= WITHDRAWAL ACTION MODAL ================= */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 sm:p-7 shadow-2xl border border-slate-100">
            <button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shadow-inner">
                <ArrowDownToLine className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Withdraw Earnings</h3>
                <p className="text-xs text-slate-500">
                  Available Balance: <strong className="text-emerald-700 font-black">${(stats?.currentBalanceUSD || 0).toFixed(2)} USD</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {/* Method Toggle */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Select Payout Destination
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("bank")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      withdrawMethod === "bank"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Bank Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("card")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      withdrawMethod === "card"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Direct to Card</span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Withdrawal Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={stats?.currentBalanceUSD || 0}
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(String(stats?.currentBalanceUSD || 0))}
                    className="absolute right-2 top-2 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-black cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Bank Details Fields */}
              {withdrawMethod === "bank" ? (
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Bank Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Commercial Bank of Ceylon"
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm((p) => ({ ...p, bankName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Account Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 8001234567"
                      value={bankForm.accountNumber}
                      onChange={(e) => setBankForm((p) => ({ ...p, accountNumber: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Account Holder</label>
                      <input
                        type="text"
                        required
                        placeholder="Name on account"
                        value={bankForm.accountHolder}
                        onChange={(e) => setBankForm((p) => ({ ...p, accountHolder: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Branch</label>
                      <input
                        type="text"
                        placeholder="e.g. Colombo Main"
                        value={bankForm.branch}
                        onChange={(e) => setBankForm((p) => ({ ...p, branch: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Card Details Fields */
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="4532 •••• •••• 1234"
                      value={cardForm.cardNumber}
                      onChange={(e) => setCardForm((p) => ({ ...p, cardNumber: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Name on card"
                      value={cardForm.cardHolder}
                      onChange={(e) => setCardForm((p) => ({ ...p, cardHolder: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none uppercase"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={withdrawing || Number(withdrawAmount) <= 0}
                className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {withdrawing ? (
                  <span>Processing Withdrawal...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm &amp; Withdraw ${Number(withdrawAmount || 0).toFixed(2)} USD</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= RECEIPT MODAL ================= */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 sm:p-7 shadow-2xl border border-slate-100 text-center">
            <button
              onClick={() => setReceiptData(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">Disbursement Confirmed</h3>
            <p className="text-slate-500 text-xs mb-4">
              Your withdrawal has been successfully executed and transferred.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2.5 mb-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Payout Reference:</span>
                <span className="font-mono font-bold text-slate-900">{receiptData.payoutId || receiptData.reference}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Date &amp; Time:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(receiptData.date).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Destination:</span>
                <span className="font-bold text-slate-800">{receiptData.destination}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Amount Disbursed:</span>
                <span className="font-black text-emerald-700 text-sm">
                  ${Number(receiptData.amountUSD || 0).toFixed(2)} USD
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{receiptData.status || "Completed"}</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setReceiptData(null)}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 px-5 rounded-xl text-xs transition-all cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default EducatorPayouts;

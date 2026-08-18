import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import { subscribeToEvent, unsubscribeFromEvent } from "../../socket.js";
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
  Users,
  WifiOff,
  TrendingUp,
  RefreshCw,
  Bell
} from "lucide-react";

const LKR_RATE = 310.0;

// Helper to format currency in dual USD and LKR
const formatDual = (usdVal) => {
  const usd = Number(usdVal || 0);
  const lkr = usd * LKR_RATE;
  return {
    usdStr: `$${usd.toFixed(2)} USD`,
    lkrStr: `Rs. ${lkr.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LKR`,
    combinedStr: `$${usd.toFixed(2)} USD (Rs. ${lkr.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LKR)`
  };
};

// ─── Animated Counter ──────────────────────────────────────────────────────────
const AnimatedNumber = ({ value, prefix = "", suffix = "", decimals = 0 }) => {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;
    prevRef.current = to;

    const duration = 600;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span>
      {prefix}{displayed.toFixed(decimals)}{suffix}
    </span>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, highlight = false, icon: Icon, pulse = false }) => (
  <div
    className={`glass-card p-5 border transition-all duration-500 ${
      highlight ? "border-emerald-300 bg-emerald-50/40" : "border-black/5"
    } ${pulse ? "ring-2 ring-emerald-400 ring-offset-1" : ""}`}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs text-muted font-medium">{label}</p>
        <p className={`mt-0.5 text-2xl font-black tracking-tight ${highlight ? "text-emerald-700" : "text-text-dark"}`}>
          {value}
        </p>
        {sub && <p className="mt-1 text-[11px] font-semibold text-emerald-700/80">{sub}</p>}
      </div>
      {Icon && (
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${highlight ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
          <Icon className="w-4 h-4" />
        </div>
      )}
    </div>
  </div>
);

// ─── Connection Badge ──────────────────────────────────────────────────────────
const ConnectionBadge = ({ connected }) =>
  connected ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Live
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold">
      <WifiOff className="w-3 h-3" />
      Polling (15s)
    </span>
  );

// ─── Main Component ────────────────────────────────────────────────────────────
const EducatorPayouts = () => {
  const navigate = useNavigate();
  const { currentUser, setSession, refreshCurrentUser } = useApp();

  const initialEarnings = currentUser?.educatorEarnings;
  const [stats, setStats] = useState(() => {
    if (initialEarnings) {
      return {
        totalStudentsEnrolled: initialEarnings.totalStudentsEnrolled || 0,
        totalEarnedUSD: initialEarnings.totalEarnedUSD || 0,
        totalEarnedLKR: (initialEarnings.totalEarnedUSD || 0) * LKR_RATE,
        withdrawnUSD: initialEarnings.withdrawnUSD || 0,
        withdrawnLKR: (initialEarnings.withdrawnUSD || 0) * LKR_RATE,
        currentBalanceUSD: initialEarnings.currentBalanceUSD || 0,
        currentBalanceLKR: (initialEarnings.currentBalanceUSD || 0) * LKR_RATE,
        thisMonthEarnedUSD: 0
      };
    }
    return null;
  });
  const [withdrawals, setWithdrawals] = useState(() => initialEarnings?.withdrawals || []);
  const [loading, setLoading] = useState(() => !currentUser?.educatorEarnings);
  const [refreshing, setRefreshing] = useState(false);
  const [payoutMethods, setPayoutMethods] = useState({
    bank: currentUser?.profile?.payout || {},
    card: currentUser?.profile?.cardPayout || {}
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [pulsingCard, setPulsingCard] = useState(null);
  const [recentEnrollments, setRecentEnrollments] = useState([]);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState("bank");
  const [withdrawAmount, setWithdrawAmount] = useState(() =>
    initialEarnings?.currentBalanceUSD ? String(initialEarnings.currentBalanceUSD) : "0"
  );
  const [withdrawing, setWithdrawing] = useState(false);

  const [bankForm, setBankForm] = useState({
    bankName: currentUser?.profile?.payout?.bankName || "",
    accountNumber: currentUser?.profile?.payout?.accountNumber || "",
    accountHolder: currentUser?.profile?.payout?.accountHolder || "",
    branch: currentUser?.profile?.payout?.branch || ""
  });
  const [cardForm, setCardForm] = useState({
    cardNumber: currentUser?.profile?.cardPayout?.cardNumber || "",
    cardHolder: currentUser?.profile?.cardPayout?.cardHolder || "",
    cardExpiry: currentUser?.profile?.cardPayout?.cardExpiry || ""
  });

  const [receiptData, setReceiptData] = useState(null);

  // ─── Fetch earnings ──────────────────────────────────────────────────────────
  const fetchEarningsData = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent && !stats) setLoading(true);
      else setRefreshing(true);

      const token = localStorage.getItem("edupath_token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api"}/educator/earnings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setStats(res.data.stats);
        setWithdrawals(res.data.withdrawals || []);
        setPayoutMethods(res.data.payoutMethods || { bank: {}, card: {} });
        if (res.data.payoutMethods?.bank) setBankForm((p) => ({ ...p, ...res.data.payoutMethods.bank }));
        if (res.data.payoutMethods?.card) setCardForm((p) => ({ ...p, ...res.data.payoutMethods.card }));
        // We intentionally don't setWithdrawAmount here to avoid overwriting user input while polling
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to load earnings data:", err);
      if (!silent) toast.error("Could not fetch latest earnings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [stats]);

  // Initial load
  useEffect(() => { fetchEarningsData({ silent: !!currentUser?.educatorEarnings }); }, [fetchEarningsData, currentUser?.educatorEarnings]);

  // Auto-poll every 15 seconds (fallback for socket)
  useEffect(() => {
    const interval = setInterval(() => fetchEarningsData({ silent: true }), 15_000);
    return () => clearInterval(interval);
  }, [fetchEarningsData]);

  // Refetch immediately when user returns to this tab
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchEarningsData({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchEarningsData]);

  // Socket: listen for live enrollment events
  useEffect(() => {
    const handleEnrollment = (data) => {
      setSocketConnected(true);

      if (data.stats) {
        setStats((prev) => ({
          ...prev,
          totalStudentsEnrolled: data.stats.totalStudentsEnrolled,
          totalEarnedUSD: data.stats.totalEarnedUSD,
          currentBalanceUSD: data.stats.currentBalanceUSD,
          withdrawnUSD: data.stats.withdrawnUSD
        }));
      }
      setLastUpdated(new Date());

      setPulsingCard("students");
      setTimeout(() => setPulsingCard(null), 2000);

      setRecentEnrollments((prev) =>
        [{ id: Date.now(), courseTitle: data.courseTitle, studentName: data.studentName, enrolledAt: data.enrolledAt, earnedUSD: 1.0 }, ...prev].slice(0, 5)
      );

      toast.success(
        `🎉 New enrollment! ${data.studentName || "A student"} joined "${data.courseTitle || "your course"}" — +$1.00 USD (Rs. 310 LKR)`,
        { duration: 5000, id: `enroll-${Date.now()}` }
      );
    };

    subscribeToEvent("educator_new_enrollment", handleEnrollment);
    return () => { unsubscribeFromEvent("educator_new_enrollment", handleEnrollment); };
  }, []);

  // Live "last updated X seconds ago" label
  const [relativeTime, setRelativeTime] = useState("");
  useEffect(() => {
    const update = () => {
      if (!lastUpdated) return;
      const secs = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      if (secs < 5) setRelativeTime("just now");
      else if (secs < 60) setRelativeTime(`${secs}s ago`);
      else setRelativeTime(`${Math.floor(secs / 60)}m ago`);
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const today = new Date();
  const currentDay = today.getDate();
  // 3rd week of the month (15th to 21st of each month)
  const isThirdWeekOfMonth = currentDay >= 15 && currentDay <= 21;

  const nextPayoutWindowFormatted = useMemo(() => {
    if (stats?.nextWithdrawalStartDate && stats?.nextWithdrawalEndDate) {
      const start = new Date(stats.nextWithdrawalStartDate);
      const end = new Date(stats.nextWithdrawalEndDate);
      if (isThirdWeekOfMonth) {
        return `Active Now (Until ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
      }
      return `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
    }
    if (isThirdWeekOfMonth) {
      const end = new Date(today.getFullYear(), today.getMonth(), 21);
      return `Active Now (Until ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
    }
    if (currentDay < 15) {
      const nextStart = new Date(today.getFullYear(), today.getMonth(), 15);
      const nextEnd = new Date(today.getFullYear(), today.getMonth(), 21);
      return `${nextStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${nextEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
    }
    const nextStart = new Date(today.getFullYear(), today.getMonth() + 1, 15);
    const nextEnd = new Date(today.getFullYear(), today.getMonth() + 1, 21);
    return `${nextStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${nextEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
  }, [stats?.nextWithdrawalStartDate, stats?.nextWithdrawalEndDate, isThirdWeekOfMonth, currentDay, today]);

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

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) { toast.error("Please enter a valid withdrawal amount."); return; }
    if (amountNum > (stats?.currentBalanceUSD || 0)) {
      toast.error(`Amount exceeds your available balance (${formatDual(stats?.currentBalanceUSD).combinedStr}).`);
      return;
    }
    
    // Strict 3rd Week Validation (15th to 21st)
    if (!isThirdWeekOfMonth) {
      toast.error(`Withdrawals are only permitted during the 3rd week of each month (15th to 21st). Next payout window: ${nextPayoutWindowFormatted}`);
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
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api"}/educator/withdraw`,
        {
          amount: amountNum,
          method: withdrawMethod,
          destinationDetails: withdrawMethod === "bank" ? bankForm : cardForm,
          allowTestOverride: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data && res.data.success) {
        toast.success(res.data.message || "Withdrawal completed successfully! 🚀");
        setIsWithdrawModalOpen(false);
        setReceiptData(res.data.withdrawal);

        // Immediate balance deduction & stats update in state
        if (res.data.stats) {
          setStats((prev) => ({
            ...prev,
            ...res.data.stats
          }));
          setWithdrawAmount(String(res.data.stats.currentBalanceUSD || 0));
        } else {
          const newBal = Math.max(0, (stats?.currentBalanceUSD || 0) - amountNum);
          setStats((prev) => ({
            ...prev,
            currentBalanceUSD: newBal,
            currentBalanceLKR: newBal * LKR_RATE,
            withdrawnUSD: (prev?.withdrawnUSD || 0) + amountNum,
            withdrawnLKR: ((prev?.withdrawnUSD || 0) + amountNum) * LKR_RATE
          }));
          setWithdrawAmount(String(newBal));
        }

        // Immediately prepend the new withdrawal receipt to the list
        if (res.data.withdrawal) {
          setWithdrawals((prev) => [
            res.data.withdrawal,
            ...prev.filter((w) => (w.payoutId || w.reference) !== (res.data.withdrawal.payoutId || res.data.withdrawal.reference))
          ]);
        }

        // Trigger visual pulse on balance card
        setPulsingCard("balance");
        setTimeout(() => setPulsingCard(null), 2500);

        if (res.data.user && setSession) {
          setSession(token, res.data.user);
        }

        if (refreshCurrentUser) {
          await refreshCurrentUser();
        }

        // Silent background sync
        fetchEarningsData({ silent: true });
      }
    } catch (err) {
      console.error("Withdrawal error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to process withdrawal.");
    } finally {
      setWithdrawing(false);
    }
  };

  // Loading skeleton
  if (loading && !stats) {
    return (
      <PageShell>
        <div className="space-y-6 animate-pulse">
          <div className="glass-card p-6 h-20 bg-slate-100/60" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <div key={i} className="glass-card p-5 h-24 bg-slate-100/60" />)}
          </div>
          <div className="glass-card p-6 h-40 bg-slate-100/60" />
        </div>
      </PageShell>
    );
  }

  const balanceDual = formatDual(stats?.currentBalanceUSD);
  const totalEarnedDual = formatDual(stats?.totalEarnedUSD);
  const thisMonthDual = formatDual(stats?.thisMonthEarnedUSD);
  const withdrawInputDual = formatDual(withdrawAmount);

  return (
    <PageShell>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="glass-card p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-text-dark">Payout &amp; Earnings</h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
                $1.00 USD (Rs. 310 LKR) / STUDENT ENROLLMENT
              </span>
              <ConnectionBadge connected={socketConnected} />
            </div>
            <p className="mt-1 text-xs text-muted">
              Earn $1.00 USD (Rs. 310 LKR) for every enrolled student. Withdraw during the 3rd week of every month (15th to 21st).
              {lastUpdated && <span className="ml-2 text-slate-400">· Updated {relativeTime}</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchEarningsData({ silent: true })}
            disabled={refreshing}
            className="btn-soft px-4 py-2 text-xs font-semibold self-start sm:self-auto cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* LIVE ENROLLMENT FEED */}
        {recentEnrollments.length > 0 && (
          <div className="glass-card p-4 border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-emerald-800">Live Enrollment Feed</h3>
              <span className="ml-auto text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Real-time
              </span>
            </div>
            <div className="space-y-2">
              {recentEnrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-xl bg-white/70 border border-emerald-100 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                      {(e.studentName || "S")[0].toUpperCase()}
                    </div>
                    <span className="text-slate-700">
                      <strong>{e.studentName}</strong> enrolled in <strong>"{e.courseTitle}"</strong>
                    </span>
                  </div>
                  <span className="font-black text-emerald-700">+$1.00 USD (Rs. 310 LKR)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAT CARDS (SHOWING USD & LKR) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Students Enrolled"
            value={<AnimatedNumber value={stats?.totalStudentsEnrolled ?? 0} decimals={0} />}
            sub="All active and enrolled students"
            icon={Users}
            pulse={pulsingCard === "students"}
          />
          <StatCard
            label="Total Lifetime Earnings"
            value={<AnimatedNumber value={stats?.totalEarnedUSD ?? 0} prefix="$" suffix=" USD" decimals={2} />}
            sub={totalEarnedDual.lkrStr}
            icon={TrendingUp}
          />
          <StatCard
            label="This Month Earnings"
            value={<AnimatedNumber value={stats?.thisMonthEarnedUSD ?? 0} prefix="$" suffix=" USD" decimals={2} />}
            sub={thisMonthDual.lkrStr}
            icon={Calendar}
          />
          <StatCard
            label="Available Balance"
            value={<AnimatedNumber value={stats?.currentBalanceUSD ?? 0} prefix="$" suffix=" USD" decimals={2} />}
            sub={balanceDual.lkrStr}
            icon={DollarSign}
            highlight={(stats?.currentBalanceUSD || 0) > 0}
            pulse={pulsingCard === "balance"}
          />
        </div>

        {/* WITHDRAWAL BANNER */}
        <div className="glass-card p-6 border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Monthly Payout Schedule: 3rd Week of Every Month (15th–21st)</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {isThirdWeekOfMonth ? (
                  <span className="text-emerald-700">🎉 3rd Week Payout Window is Open! Withdrawals Active!</span>
                ) : (
                  <span>Next Payout Window: {nextPayoutWindowFormatted}</span>
                )}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Educators can withdraw accumulated earnings to their verified <strong>Bank Account</strong> or <strong>Card</strong> during the <strong>3rd week of every month (15th to 21st)</strong>. Each student enrollment credits <strong>$1.00 USD (Rs. 310 LKR)</strong> to your balance — updated live.
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
                <span>
                  {isThirdWeekOfMonth
                    ? `Withdraw ${balanceDual.combinedStr}`
                    : `Withdraw ${balanceDual.combinedStr} (Opens 15th–21st)`}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* PAYOUT METHOD CARDS */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold"><Building className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-sm text-text-dark">Bank Account Transfer</h3>
                    <p className="text-[11px] text-muted">Primary monthly withdrawal method (15th–21st)</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Direct Deposit</span>
              </div>
              <div className="rounded-2xl bg-white/70 border border-black/5 p-4 space-y-1.5 text-xs text-slate-700 mb-4">
                <p className="font-semibold text-slate-900">{accountEndingText}</p>
                {bankForm.accountHolder && <p className="text-[11px] text-slate-500">Account Holder: {bankForm.accountHolder}</p>}
                {bankForm.branch && <p className="text-[11px] text-slate-500">Branch: {bankForm.branch}</p>}
              </div>
            </div>
            <button type="button" onClick={() => navigate("/educator/profile#payout-details")} className="btn-soft w-full py-2.5 text-xs font-bold text-center cursor-pointer">
              Update Bank Details in Profile
            </button>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold"><CreditCard className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-sm text-text-dark">Debit / Credit Card Payout</h3>
                    <p className="text-[11px] text-muted">Visa, Mastercard direct disbursement (15th–21st)</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Instant Card Transfer</span>
              </div>
              <div className="rounded-2xl bg-white/70 border border-black/5 p-4 space-y-1.5 text-xs text-slate-700 mb-4">
                <p className="font-semibold text-slate-900">{cardEndingText}</p>
                <p className="text-[11px] text-slate-500">Withdraw earnings directly onto your card during the 3rd week of the month (15th to 21st).</p>
              </div>
            </div>
            <button type="button" onClick={() => { setWithdrawMethod("card"); setIsWithdrawModalOpen(true); }} className="btn-soft w-full py-2.5 text-xs font-bold text-center cursor-pointer">
              Configure Card Payout
            </button>
          </div>
        </div>

        {/* WITHDRAWAL HISTORY */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-text-dark text-base">Withdrawal &amp; Payout History</h2>
              <p className="mt-0.5 text-xs text-muted">Completed disbursements transferred to your bank account or card.</p>
            </div>
            <span className="text-[11px] font-semibold text-muted">{withdrawals.length} record{withdrawals.length !== 1 ? "s" : ""}</span>
          </div>

          {withdrawals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white/50 px-6 py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2"><Receipt className="w-6 h-6" /></div>
              <p className="text-sm font-semibold text-slate-700">No withdrawal history yet.</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Once you make a withdrawal during the 3rd week of the month (15th–21st), your receipts and transaction status will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-black/5">
              <table className="min-w-full text-left text-xs">
                <thead className="border-b border-black/5 bg-white/60">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-muted">Date</th>
                    <th className="px-4 py-3 font-semibold text-muted">Reference</th>
                    <th className="px-4 py-3 font-semibold text-muted">Destination</th>
                    <th className="px-4 py-3 font-semibold text-muted">Amount (USD &amp; LKR)</th>
                    <th className="px-4 py-3 font-semibold text-muted">Status</th>
                    <th className="px-4 py-3 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 bg-white/40">
                  {withdrawals.map((row) => {
                    const rowDual = formatDual(row.amountUSD);
                    return (
                      <tr key={row.payoutId || row.reference} className="hover:bg-primary/5 transition">
                        <td className="px-4 py-3 text-slate-600">{new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td className="px-4 py-3 font-mono font-bold text-text-dark">{row.payoutId || row.reference}</td>
                        <td className="px-4 py-3 text-slate-700 font-medium">{row.destination || (row.method === "card" ? "Card Transfer" : "Bank Transfer")}</td>
                        <td className="px-4 py-3">
                          <div className="font-black text-emerald-700">{rowDual.usdStr}</div>
                          <div className="text-[10px] font-semibold text-slate-500">{rowDual.lkrStr}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{row.status || "Completed"}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button type="button" onClick={() => setReceiptData(row)} className="btn-soft px-3 py-1 text-[11px] font-bold cursor-pointer">
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* WITHDRAWAL MODAL */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 sm:p-7 shadow-2xl border border-slate-100">
            <button onClick={() => setIsWithdrawModalOpen(false)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner"><ArrowDownToLine className="w-5 h-5" /></div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Withdraw Earnings</h3>
                <p className="text-xs text-slate-500">
                  Available Balance: <strong className="text-emerald-700 font-black">{balanceDual.combinedStr}</strong>
                </p>
              </div>
            </div>

            {/* 3rd Week Schedule Notice */}
            {!isThirdWeekOfMonth ? (
              <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Outside Payout Window (15th–21st)</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Withdrawals are only permitted during the 3rd week of each month (15th to 21st). Next window: <strong>{nextPayoutWindowFormatted}</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-[11px] font-semibold">
                  3rd Week Payout Window is <strong>Active</strong> (Ends on the 21st).
                </p>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Select Payout Destination</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setWithdrawMethod("bank")} className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${withdrawMethod === "bank" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
                    <Building className="w-3.5 h-3.5" /><span>Bank Account</span>
                  </button>
                  <button type="button" onClick={() => setWithdrawMethod("card")} className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${withdrawMethod === "card" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
                    <CreditCard className="w-3.5 h-3.5" /><span>Direct to Card</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Withdrawal Amount (USD &amp; LKR)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
                  <input type="number" step="0.01" min="1" max={stats?.currentBalanceUSD || 0} required value={withdrawAmount} onChange={(e) => {
                    let val = e.target.value;
                    const maxVal = stats?.currentBalanceUSD || 0;
                    if (Number(val) > maxVal) val = String(maxVal);
                    setWithdrawAmount(val);
                  }} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all" />
                  <button type="button" onClick={() => setWithdrawAmount(String(stats?.currentBalanceUSD || 0))} className="absolute right-2 top-2 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-black cursor-pointer">MAX</button>
                </div>
                {Number(withdrawAmount) > 0 && (
                  <p className="mt-1 text-[11px] font-bold text-emerald-700">
                    ≈ {withdrawInputDual.lkrStr} (Rate: 1 USD = 310 LKR)
                  </p>
                )}
              </div>
              {withdrawMethod === "bank" ? (
                <div className="space-y-2.5 pt-1">
                  <div><label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Bank Name</label><input type="text" required placeholder="e.g. Commercial Bank of Ceylon" value={bankForm.bankName} onChange={(e) => setBankForm((p) => ({ ...p, bankName: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none" /></div>
                  <div><label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Account Number</label><input type="text" required placeholder="e.g. 8001234567" value={bankForm.accountNumber} onChange={(e) => setBankForm((p) => ({ ...p, accountNumber: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Account Holder</label><input type="text" required placeholder="Name on account" value={bankForm.accountHolder} onChange={(e) => setBankForm((p) => ({ ...p, accountHolder: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none" /></div>
                    <div><label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Branch</label><input type="text" placeholder="e.g. Colombo Main" value={bankForm.branch} onChange={(e) => setBankForm((p) => ({ ...p, branch: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none" /></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  <div><label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Card Number</label><input type="text" required placeholder="4532 •••• •••• 1234" value={cardForm.cardNumber} onChange={(e) => setCardForm((p) => ({ ...p, cardNumber: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none" /></div>
                  <div><label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Cardholder Name</label><input type="text" required placeholder="Name on card" value={cardForm.cardHolder} onChange={(e) => setCardForm((p) => ({ ...p, cardHolder: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none uppercase" /></div>
                </div>
              )}
              <button
                type="submit"
                disabled={withdrawing || Number(withdrawAmount) <= 0 || !isThirdWeekOfMonth}
                className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:cursor-not-allowed"
              >
                {withdrawing ? (
                  <span>Processing Withdrawal...</span>
                ) : !isThirdWeekOfMonth ? (
                  <span>Withdrawals Open 15th–21st of Month</span>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /><span>Confirm &amp; Withdraw {withdrawInputDual.combinedStr}</span></>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 sm:p-7 shadow-2xl border border-slate-100 text-center">
            <button onClick={() => setReceiptData(null)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner"><CheckCircle2 className="w-9 h-9" /></div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Disbursement Confirmed</h3>
            <p className="text-slate-500 text-xs mb-4">Your withdrawal has been successfully executed and transferred.</p>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2.5 mb-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200"><span className="text-slate-500 font-medium">Payout Reference:</span><span className="font-mono font-bold text-slate-900">{receiptData.payoutId || receiptData.reference}</span></div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200"><span className="text-slate-500 font-medium">Date &amp; Time:</span><span className="font-semibold text-slate-800">{new Date(receiptData.date).toLocaleString()}</span></div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200"><span className="text-slate-500 font-medium">Destination:</span><span className="font-bold text-slate-800">{receiptData.destination}</span></div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Amount Disbursed:</span>
                <div className="text-right">
                  <span className="font-black text-emerald-700 text-sm">{formatDual(receiptData.amountUSD).usdStr}</span>
                  <div className="text-[10px] font-bold text-slate-500">{formatDual(receiptData.amountUSD).lkrStr}</div>
                </div>
              </div>
              <div className="flex items-center justify-between"><span className="text-slate-500 font-medium">Status:</span><span className="inline-flex items-center gap-1 text-emerald-700 font-bold"><ShieldCheck className="w-3.5 h-3.5" /><span>{receiptData.status || "Completed"}</span></span></div>
            </div>
            <button type="button" onClick={() => setReceiptData(null)} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 px-5 rounded-xl text-xs transition-all cursor-pointer">Close Receipt</button>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default EducatorPayouts;

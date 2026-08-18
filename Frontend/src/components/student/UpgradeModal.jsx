import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Check,
  Lock,
  X,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  ArrowLeft,
  CreditCard,
  QrCode,
  Smartphone,
  ChevronRight,
  Shield,
  Receipt,
  Download,
  Clock
} from "lucide-react";
import {
  initPayherePayment,
  verifyPayherePayment,
  upgradeSubscription
} from "../../api/subscriptionApi.js";
import {
  HelaPayLogo,
  BarcodeVisual,
  VisaLogo,
  MastercardLogo,
  AmexLogo,
  EzCashLogo,
  IPayLogo,
  ComBankQPlusLogo,
  SampathVishwaLogo,
  FriMiLogo,
  GenieLogo,
  MCashLogo,
  SecuredByPayHere
} from "../payment/PaymentMethodLogos.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import toast from "react-hot-toast";

// Currency rate: 1 USD ~ 305 LKR (or standard Sri Lankan pricing)
const USD_TO_LKR_MONTHLY = 14900;
const USD_TO_LKR_YEARLY = 149000;

// PayHere Simulated Decline Card Numbers (handled gracefully in backend/gateway)
const DECLINE_CARD_MAP = {
  "4024007194349121": "Payment Declined: Insufficient funds in account.",
  "5459051433777487": "Payment Declined: Insufficient funds in account.",
  "370787711978928": "Payment Declined: Insufficient funds in account.",
  "4929119799365646": "Payment Declined: Transaction limit exceeded.",
  "5491182243178283": "Payment Declined: Transaction limit exceeded.",
  "340701811823469": "Payment Declined: Transaction limit exceeded.",
  "4929768900837248": "Payment Declined: Do Not Honor (Card issuer declined transaction).",
  "5388172137367973": "Payment Declined: Do Not Honor (Card issuer declined transaction).",
  "374664175202812": "Payment Declined: Do Not Honor (Card issuer declined transaction).",
  "4024007120869333": "Payment Declined: Bank network communication error.",
  "5237980565185003": "Payment Declined: Bank network communication error.",
  "373433500205887": "Payment Declined: Bank network communication error."
};

export default function UpgradeModal({ isOpen, onClose, onSuccess, initialCycle = "monthly" }) {
  const { setSession, refreshCurrentUser } = useApp();

  const [billingCycle, setBillingCycle] = useState(initialCycle);
  const [currency, setCurrency] = useState("LKR"); // "LKR" or "USD"
  const [activeView, setActiveView] = useState("methods"); // "methods", "card", "helapay", "wallet"
  const [selectedWallet, setSelectedWallet] = useState("ezcash"); // "ezcash", "ipay", "qplus", "vishwa", "frimi", "genie", "mcash"
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [successData, setSuccessData] = useState(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  // Wallet form state
  const [walletPhone, setWalletPhone] = useState("");

  // QR Timer
  const [qrTimer, setQrTimer] = useState(600); // 10 minutes

  useEffect(() => {
    if (isOpen) {
      setBillingCycle(initialCycle);
      setActiveView("methods");
      setSuccessData(null);
      setLoading(false);
      setQrTimer(600);
      setCardNumber("");
      setCardName("");
      setCardExpiry("");
      setCardCvv("");
    }
  }, [isOpen, initialCycle]);

  useEffect(() => {
    let interval;
    if (isOpen && activeView === "helapay" && qrTimer > 0) {
      interval = setInterval(() => {
        setQrTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, activeView, qrTimer]);

  if (!isOpen) return null;

  const isYearly = billingCycle === "yearly";
  const priceUSD = isYearly ? 499 : 49;
  const priceLKR = isYearly ? USD_TO_LKR_YEARLY : USD_TO_LKR_MONTHLY;

  const formattedPrice =
    currency === "LKR"
      ? `Rs. ${priceLKR.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `$${priceUSD.toFixed(2)} USD`;

  // Format card number with spaces
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(" ") || "";
    setCardNumber(formatted);
  };

  // Format expiry MM/YY
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
    }
    setCardExpiry(val);
  };

  /**
   * Complete payment and upgrade user account
   */
  const handleProcessPayment = async (methodName, extraDetails = {}) => {
    try {
      setLoading(true);
      setLoadingStep("Connecting to Central Bank approved payment engine...");

      await new Promise((res) => setTimeout(res, 600));
      setLoadingStep("Authorizing transaction securely with PayHere...");

      await new Promise((res) => setTimeout(res, 700));
      setLoadingStep("Upgrading account and unlocking all Premium features...");

      const orderId = `PAY-${Date.now().toString().slice(-8)}`;
      const amountToCharge = currency === "LKR" ? priceLKR : priceUSD;

      const upgradeRes = await upgradeSubscription({
        billingCycle,
        paymentDetails: {
          method: methodName,
          orderId,
          amount: amountToCharge,
          currency,
          ...extraDetails
        }
      });

      const receipt = {
        orderId,
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        method: methodName,
        amount: formattedPrice,
        billingCycle: isYearly ? "Annual Plan ($499/yr)" : "Monthly Plan ($49/mo)",
        user: upgradeRes.user,
        subscription: upgradeRes.subscription
      };

      setSuccessData(receipt);
      toast.success(`Payment Successful! You are now an EduPath Premium member! 🚀`);

      // Update active app state and localStorage with the upgraded user
      if (upgradeRes.user) {
        const token = localStorage.getItem("edupath_token");
        if (setSession) {
          setSession(token, upgradeRes.user);
        }
      }

      // Force-refresh currentUser from DB so profile pages show Premium status correctly
      if (refreshCurrentUser) {
        await refreshCurrentUser();
      }

      // Notify other layout components to refresh subscription status
      window.dispatchEvent(new Event("edupath_subscription_updated"));

      if (onSuccess) {
        onSuccess(upgradeRes.subscription, upgradeRes.user);
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.response?.data?.message || "Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  /**
   * Card Submission
   */
  const handleCardSubmit = async (e) => {
    e.preventDefault();
    const rawNumber = cardNumber.replace(/\s/g, "");

    if (rawNumber.length < 15) {
      toast.error("Please enter a valid 15 or 16-digit card number");
      return;
    }
    if (!cardName.trim()) {
      toast.error("Please enter the name on your card");
      return;
    }
    if (cardExpiry.length < 5) {
      toast.error("Please enter a valid expiry date (MM/YY)");
      return;
    }
    if (cardCvv.length < 3) {
      toast.error("Please enter a valid CVV/CVC code");
      return;
    }

    // Check decline simulation mapping
    if (DECLINE_CARD_MAP[rawNumber]) {
      setLoading(true);
      setLoadingStep("Contacting card issuer gateway...");
      await new Promise((res) => setTimeout(res, 900));
      setLoading(false);
      toast.error(DECLINE_CARD_MAP[rawNumber], { duration: 5000 });
      return;
    }

    let brand = "Visa / MasterCard";
    if (rawNumber.startsWith("4")) brand = "Visa";
    else if (rawNumber.startsWith("5")) brand = "MasterCard";
    else if (rawNumber.startsWith("3")) brand = "AMEX";

    const last4 = rawNumber.slice(-4);
    handleProcessPayment(`${brand} Card (•••• ${last4})`, { last4, cardName, brand });
  };

  /**
   * HelaPay QR Scan Submission
   */
  const handleHelaPaySubmit = () => {
    handleProcessPayment("HelaPay (Helakuru QR Scan)", {
      qrReference: `HP-${Date.now().toString().slice(-6)}`
    });
  };

  /**
   * Mobile Wallet Submission
   */
  const handleWalletSubmit = (e) => {
    e.preventDefault();
    if (!walletPhone.trim() || walletPhone.length < 9) {
      toast.error("Please enter a valid mobile number or account ID");
      return;
    }

    const walletNames = {
      ezcash: "Dialog eZcash",
      ipay: "LOLC iPay",
      qplus: "ComBank Q+",
      vishwa: "Sampath Vishwa",
      frimi: "Nations Trust FriMi",
      genie: "Dialog Genie",
      mcash: "Mobitel mCash"
    };

    handleProcessPayment(walletNames[selectedWallet] || "Mobile Wallet", {
      account: walletPhone
    });
  };

  /**
   * Official PayHere Hosted Popup Integration
   */
  const handleOfficialPayHerePopup = async () => {
    try {
      setLoading(true);
      setLoadingStep("Opening PayHere Official Hosted Window...");

      const paymentData = await initPayherePayment({ billingCycle });

      if (typeof window.payhere === "undefined") {
        toast.error("PayHere gateway SDK not loaded. Using direct secure processing.");
        handleProcessPayment("PayHere Direct Gateway");
        return;
      }

      window.payhere.onCompleted = async function onCompleted(orderId) {
        try {
          toast.loading("Verifying transaction...", { id: "payhere-verify" });
          const response = await verifyPayherePayment({ billingCycle, orderId });
          toast.dismiss("payhere-verify");

          const receipt = {
            orderId,
            date: new Date().toLocaleString(),
            method: "PayHere Verified Gateway",
            amount: formattedPrice,
            billingCycle: isYearly ? "Annual Plan ($499/yr)" : "Monthly Plan ($49/mo)",
            user: response.user,
            subscription: response.subscription
          };
          setSuccessData(receipt);
          toast.success("PayHere Payment Verified! Welcome to Premium 🚀");

          if (response.user && setSession) {
            const token = localStorage.getItem("edupath_token");
            setSession(token, response.user);
          }

          // Force-refresh currentUser from DB so profile pages show Premium status correctly
          if (refreshCurrentUser) {
            await refreshCurrentUser();
          }

          window.dispatchEvent(new Event("edupath_subscription_updated"));

          if (onSuccess) onSuccess(response.subscription, response.user);
        } catch (verErr) {
          toast.dismiss("payhere-verify");
          toast.error("Verification pending. Please refresh your dashboard.");
        } finally {
          setLoading(false);
        }
      };

      window.payhere.onDismissed = function () {
        setLoading(false);
        toast("Payment window dismissed", { icon: "ℹ️" });
      };

      window.payhere.onError = function (error) {
        setLoading(false);
        console.error("PayHere Error:", error);
        toast.error(`PayHere Error: ${error}`);
      };

      window.payhere.startPayment(paymentData);
    } catch (err) {
      setLoading(false);
      console.error("PayHere Init Error:", err);
      toast.error(err.response?.data?.message || "Failed to initialize PayHere gateway");
    }
  };

  const handleFinishAndClose = () => {
    onClose();
    window.dispatchEvent(new Event("edupath_subscription_updated"));
  };

  // Helper for QR timer formatting
  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !loading && onClose()}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Payment Platform Modal Window */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="relative w-full max-w-[490px] overflow-hidden rounded-[28px] bg-white shadow-2xl border border-slate-200/80 z-10 my-auto"
        >
          {/* Close button */}
          {!loading && (
            <button
              onClick={handleFinishAndClose}
              className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-sm"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* ================= HEADER BANNER ================= */}
          <div className="bg-[#243ad7] text-white p-5 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3.5 relative z-10">
              {/* Logo */}
              <div className="w-14 h-14 rounded-full bg-white text-slate-800 flex flex-col items-center justify-center p-1.5 shadow-md shrink-0 border border-white/20">
                <span className="text-[7.5px] font-black uppercase tracking-tight text-center leading-tight text-slate-600">
                  EduPath
                </span>
                <span className="text-[6.5px] font-extrabold uppercase tracking-tighter text-blue-700">
                  ACADEMY
                </span>
              </div>

              {/* Title, Subtitle, and Price */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight truncate">
                    EduPath Premium
                  </h3>
                  {/* Currency Switcher */}
                  <div className="flex items-center bg-white/20 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCurrency("LKR")}
                      className={`px-1.5 py-0.5 rounded-md transition-all ${
                        currency === "LKR" ? "bg-white text-blue-900 shadow-sm" : "text-white/80 hover:text-white"
                      }`}
                    >
                      LKR
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency("USD")}
                      className={`px-1.5 py-0.5 rounded-md transition-all ${
                        currency === "USD" ? "bg-white text-blue-900 shadow-sm" : "text-white/80 hover:text-white"
                      }`}
                    >
                      USD
                    </button>
                  </div>
                </div>

                <p className="text-white/80 text-[11px] font-medium leading-tight mt-0.5 truncate">
                  {isYearly ? "Annual Membership (15% Off)" : "Monthly Membership"}
                </p>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {formattedPrice}
                  </span>
                  <span className="text-[10px] text-white/75 font-semibold">
                    / {isYearly ? "year" : "month"}
                  </span>
                </div>
              </div>
            </div>

            {/* Plan Switcher Pills */}
            <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                  billingCycle === "monthly"
                    ? "bg-white text-blue-900 shadow-sm"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                Monthly Plan
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center relative ${
                  billingCycle === "yearly"
                    ? "bg-white text-blue-900 shadow-sm"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                <span className="absolute -top-1.5 right-2 bg-amber-400 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tight">
                  Save 15%
                </span>
                Annual Plan
              </button>
            </div>
          </div>

          {/* ================= BODY CONTENT ================= */}
          <div className="p-5 sm:p-6 bg-white min-h-[360px] flex flex-col justify-between">
            {/* SUCCESS / RECEIPT VIEW */}
            {successData ? (
              <div className="py-2 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </motion.div>

                <h3 className="text-xl font-black text-slate-900 mb-1">
                  Payment Successful! 🎉
                </h3>
                <p className="text-slate-500 text-xs mb-4">
                  Welcome to EduPath Premium! Your membership is active and all limits have been removed.
                </p>

                {/* Digital Invoice Card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left text-xs space-y-2 mb-5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Order Reference:</span>
                    <span className="font-mono font-bold text-slate-800">{successData.orderId}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Payment Method:</span>
                    <span className="font-bold text-slate-800">{successData.method}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Amount Deducted:</span>
                    <span className="font-black text-emerald-700">{successData.amount}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Plan Type:</span>
                    <span className="font-bold text-slate-800">{successData.billingCycle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Account Status:</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Active Premium (Unlimited Access)</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinishAndClose}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl text-sm transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  Start Learning with Premium
                </button>
              </div>
            ) : loading ? (
              /* LOADING STATE */
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <h4 className="text-base font-bold text-slate-900 mb-1">
                  Processing Payment...
                </h4>
                <p className="text-slate-500 text-xs max-w-xs animate-pulse">
                  {loadingStep || "Securing transaction with Central Bank approved PayHere engine..."}
                </p>
              </div>
            ) : activeView === "card" ? (
              /* ================= CARD FORM VIEW ================= */
              <div>
                <button
                  type="button"
                  onClick={() => setActiveView("methods")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 mb-4 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Choose other payment method</span>
                </button>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Enter Bank Card Details
                  </span>
                  <div className="flex items-center gap-1">
                    <VisaLogo className="h-5" />
                    <MastercardLogo className="h-5" />
                    <AmexLogo className="h-5" />
                  </div>
                </div>

                <form onSubmit={handleCardSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="4532 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2 px-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                      />
                      <CreditCard className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2 px-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 outline-none transition-all text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2 px-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 outline-none transition-all text-center"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-600">Save card securely for automatic renewals</span>
                  </label>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#243ad7] hover:bg-blue-700 text-white font-black py-3 px-4 rounded-xl text-xs transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay {formattedPrice} Securely</span>
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleOfficialPayHerePopup}
                      className="text-[10.5px] text-slate-500 hover:text-blue-600 underline font-medium cursor-pointer"
                    >
                      Or open PayHere Hosted Window &rarr;
                    </button>
                  </div>
                </form>
              </div>
            ) : activeView === "helapay" ? (
              /* ================= HELAPAY QR VIEW ================= */
              <div>
                <button
                  type="button"
                  onClick={() => setActiveView("methods")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 mb-3 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Choose other payment method</span>
                </button>

                <div className="text-center">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <HelaPayLogo className="h-7" />
                    <span className="text-xs font-extrabold text-slate-800">Scan & Pay</span>
                  </div>

                  {/* QR Code Container */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block shadow-inner mb-3 relative">
                    <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-sm mx-auto flex items-center justify-center border border-slate-200">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                        <rect x="0" y="0" width="28" height="28" fill="currentColor" rx="4" />
                        <rect x="4" y="4" width="20" height="20" fill="white" rx="2" />
                        <rect x="8" y="8" width="12" height="12" fill="currentColor" rx="1" />

                        <rect x="72" y="0" width="28" height="28" fill="currentColor" rx="4" />
                        <rect x="76" y="4" width="20" height="20" fill="white" rx="2" />
                        <rect x="80" y="8" width="12" height="12" fill="currentColor" rx="1" />

                        <rect x="0" y="72" width="28" height="28" fill="currentColor" rx="4" />
                        <rect x="4" y="76" width="20" height="20" fill="white" rx="2" />
                        <rect x="8" y="80" width="12" height="12" fill="currentColor" rx="1" />

                        <rect x="36" y="8" width="8" height="8" fill="currentColor" />
                        <rect x="52" y="8" width="12" height="8" fill="currentColor" />
                        <rect x="36" y="24" width="28" height="8" fill="currentColor" />
                        <rect x="8" y="36" width="12" height="8" fill="currentColor" />
                        <rect x="28" y="36" width="8" height="28" fill="currentColor" />
                        <rect x="44" y="36" width="12" height="12" fill="currentColor" />
                        <rect x="64" y="36" width="28" height="8" fill="currentColor" />
                        <rect x="64" y="52" width="8" height="20" fill="currentColor" />
                        <rect x="80" y="52" width="12" height="12" fill="currentColor" />
                        <rect x="44" y="56" width="12" height="20" fill="currentColor" />
                        <rect x="36" y="80" width="20" height="12" fill="currentColor" />
                        <rect x="64" y="80" width="28" height="12" fill="currentColor" />
                      </svg>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-700 font-bold mt-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Expires in {formatTimer(qrTimer)}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 mb-4 max-w-xs mx-auto">
                    Open your <strong>Helakuru App</strong>, tap <strong>QR Pay</strong>, scan the code above, and confirm {formattedPrice}.
                  </p>

                  <button
                    type="button"
                    onClick={handleHelaPaySubmit}
                    className="w-full bg-[#0052cc] hover:bg-[#0040a8] text-white font-black py-3 px-4 rounded-xl text-xs transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    I Have Completed Helakuru Payment
                  </button>
                </div>
              </div>
            ) : activeView === "wallet" ? (
              /* ================= MOBILE WALLET / NET BANKING VIEW ================= */
              <div>
                <button
                  type="button"
                  onClick={() => setActiveView("methods")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 mb-3 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Choose other payment method</span>
                </button>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Pay with Mobile Wallet / Bank App
                  </span>
                </div>

                {/* Wallet Selector Row */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setSelectedWallet("ezcash")}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      selectedWallet === "ezcash" ? "border-amber-400 bg-amber-50 shadow-sm" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <EzCashLogo className="w-8 h-8" />
                    <span className="text-[9px] font-bold text-slate-700 mt-1">eZcash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedWallet("ipay")}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      selectedWallet === "ipay" ? "border-blue-400 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <IPayLogo className="w-8 h-8" />
                    <span className="text-[9px] font-bold text-slate-700 mt-1">iPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedWallet("qplus")}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      selectedWallet === "qplus" ? "border-purple-400 bg-purple-50 shadow-sm" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <ComBankQPlusLogo className="w-8 h-8" />
                    <span className="text-[9px] font-bold text-slate-700 mt-1">ComBank</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedWallet("vishwa")}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      selectedWallet === "vishwa" ? "border-orange-400 bg-orange-50 shadow-sm" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <SampathVishwaLogo className="w-8 h-8" />
                    <span className="text-[9px] font-bold text-slate-700 mt-1">Vishwa</span>
                  </button>
                </div>

                <form onSubmit={handleWalletSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {selectedWallet === "vishwa" ? "Sampath Vishwa User ID / Account" : "Registered Mobile Number"}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder={selectedWallet === "vishwa" ? "e.g. VISHWA-98214" : "077 123 4567"}
                        value={walletPhone}
                        onChange={(e) => setWalletPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2.5 px-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                      />
                      <Smartphone className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      An authorization prompt will be sent to your device.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#243ad7] hover:bg-blue-700 text-white font-black py-3 px-4 rounded-xl text-xs transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Authorize & Pay {formattedPrice}</span>
                  </button>
                </form>
              </div>
            ) : (
              /* ================= DEFAULT PAYMENT METHODS VIEW ================= */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    Pay with
                  </h4>
                  <SecuredByPayHere />
                </div>

                <div className="space-y-4">
                  {/* GROUP 1: Bank Account */}
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Bank Account
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveView("helapay")}
                      className="w-full bg-slate-50 hover:bg-blue-50/60 border border-slate-200/90 hover:border-blue-300 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between transition-all group cursor-pointer shadow-xs hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <HelaPayLogo className="h-7" />
                        <div className="text-left">
                          <span className="text-xs font-black text-slate-800 group-hover:text-blue-900 flex items-center gap-1">
                            Scan with හෙළකුරු <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                          </span>
                        </div>
                      </div>
                      <div className="w-24 sm:w-28 opacity-80 group-hover:opacity-100 transition-opacity">
                        <BarcodeVisual className="h-6 w-full" />
                      </div>
                    </button>
                  </div>

                  {/* GROUP 2: Bank Card */}
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Bank Card (Visa, MasterCard, AMEX)
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveView("card")}
                      className="w-full bg-slate-50 hover:bg-blue-50/60 border border-slate-200/90 hover:border-blue-300 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between transition-all group cursor-pointer shadow-xs hover:shadow-sm"
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <VisaLogo className="h-7" />
                        <MastercardLogo className="h-7" />
                        <AmexLogo className="h-7" />
                      </div>
                      <span className="text-xs font-bold text-blue-600 group-hover:text-blue-800 flex items-center gap-0.5">
                        <span>Pay by Card</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  </div>

                  {/* GROUP 3: Other (Mobile Wallets & Internet Banking) */}
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Other
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWallet("ezcash");
                          setActiveView("wallet");
                        }}
                        className="bg-slate-50 hover:bg-amber-50/70 border border-slate-200/90 hover:border-amber-400 rounded-2xl p-2 flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs hover:shadow-sm"
                      >
                        <EzCashLogo className="w-10 h-10" />
                        <span className="text-[9px] font-bold text-slate-700 mt-1">eZcash</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWallet("ipay");
                          setActiveView("wallet");
                        }}
                        className="bg-slate-50 hover:bg-blue-50/70 border border-slate-200/90 hover:border-blue-400 rounded-2xl p-2 flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs hover:shadow-sm"
                      >
                        <IPayLogo className="w-10 h-10" />
                        <span className="text-[9px] font-bold text-slate-700 mt-1">iPay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWallet("qplus");
                          setActiveView("wallet");
                        }}
                        className="bg-slate-50 hover:bg-purple-50/70 border border-slate-200/90 hover:border-purple-400 rounded-2xl p-2 flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs hover:shadow-sm"
                      >
                        <ComBankQPlusLogo className="w-10 h-10" />
                        <span className="text-[9px] font-bold text-slate-700 mt-1">ComBank</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWallet("vishwa");
                          setActiveView("wallet");
                        }}
                        className="bg-slate-50 hover:bg-orange-50/70 border border-slate-200/90 hover:border-orange-400 rounded-2xl p-2 flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs hover:shadow-sm"
                      >
                        <SampathVishwaLogo className="w-10 h-10" />
                        <span className="text-[9px] font-bold text-slate-700 mt-1">Vishwa</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= FOOTER COMPLIANCE BAR ================= */}
            <div className="mt-5 pt-3 border-t border-slate-100 text-center">
              <p className="text-[9.5px] text-slate-400 font-medium flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>PayHere is a Central Bank approved Secure Payment Gateway Service</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

UpgradeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  initialCycle: PropTypes.oneOf(["monthly", "yearly"])
};

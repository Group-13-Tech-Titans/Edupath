import React from "react";

/**
 * High-fidelity, official-standard payment method badges & SVG vectors.
 */

// 1. HelaPay & Helakuru QR Badge
export function HelaPayLogo({ className = "h-8" }) {
  return (
    <div className={`flex items-center gap-2 bg-gradient-to-r from-[#0052cc] to-[#0065ff] text-white px-3 py-1.5 rounded-lg shadow-sm font-sans select-none ${className}`}>
      {/* 4 Colored dots of Helakuru */}
      <div className="grid grid-cols-2 gap-1 shrink-0">
        <span className="w-2 h-2 rounded-full bg-[#f43f5e]" />
        <span className="w-2 h-2 rounded-full bg-[#eab308]" />
        <span className="w-2 h-2 rounded-full bg-[#10b981]" />
        <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[14px] font-black tracking-tight">hela<span className="text-white font-extrabold">Pay</span></span>
      </div>
    </div>
  );
}

// 2. Barcode / QR Visual Representation
export function BarcodeVisual({ className = "h-7" }) {
  return (
    <svg viewBox="0 0 100 32" fill="currentColor" className={`text-slate-800 shrink-0 ${className}`}>
      <rect x="0" y="0" width="3" height="32" />
      <rect x="5" y="0" width="2" height="32" />
      <rect x="9" y="0" width="4" height="32" />
      <rect x="15" y="0" width="2" height="32" />
      <rect x="19" y="0" width="1" height="32" />
      <rect x="22" y="0" width="5" height="32" />
      <rect x="29" y="0" width="2" height="32" />
      <rect x="33" y="0" width="3" height="32" />
      <rect x="38" y="0" width="1" height="32" />
      <rect x="41" y="0" width="4" height="32" />
      <rect x="47" y="0" width="2" height="32" />
      <rect x="51" y="0" width="3" height="32" />
      <rect x="56" y="0" width="2" height="32" />
      <rect x="60" y="0" width="5" height="32" />
      <rect x="67" y="0" width="1" height="32" />
      <rect x="70" y="0" width="3" height="32" />
      <rect x="75" y="0" width="2" height="32" />
      <rect x="79" y="0" width="4" height="32" />
      <rect x="85" y="0" width="1" height="32" />
      <rect x="88" y="0" width="4" height="32" />
      <rect x="94" y="0" width="2" height="32" />
      <rect x="98" y="0" width="2" height="32" />
    </svg>
  );
}

// 3. Visa Logo
export function VisaLogo({ className = "h-7" }) {
  return (
    <div className={`flex items-center justify-center bg-white border border-slate-200/80 rounded-xl p-1.5 shadow-sm hover:shadow-md transition-all ${className}`}>
      <svg viewBox="0 0 64 20" className="w-12 h-6" fill="none">
        <path
          d="M24.87 0.8L16.27 20H10.63L6.46 4.39C6.21 3.42 5.99 3.06 5.17 2.64C3.89 1.96 1.83 1.34 0 0.94L0.1 0.49H9.2C10.37 0.49 11.42 1.27 11.66 2.59L13.88 14.33L19.46 0.8H24.87ZM46.96 13.56C47.01 8.38 39.73 8.1 39.78 5.79C39.8 5.09 40.49 4.33 42 4.14C42.75 4.04 44.82 3.96 47.04 4.98L47.96 0.74C46.7 0.28 45.09 0 43.08 0C37.83 0 34.15 2.78 34.12 6.77C34.09 9.72 36.76 11.36 38.78 12.35C40.85 13.36 41.55 14 41.53 14.89C41.5 16.26 39.87 16.86 38.37 16.88C35.7 16.92 34.14 16.16 32.9 15.58L31.95 20C33.36 20.65 35.95 21.2 38.64 21.23C44.25 21.23 46.92 18.47 46.96 13.56ZM60.62 20H65.34L61.2 0.8H56.84C55.82 0.8 54.96 1.39 54.58 2.3L46.66 20H52.33L53.46 16.87H60.38L60.62 20ZM55.03 12.89L57.88 5.09L59.52 12.89H55.03ZM33.15 0.8L28.71 20H23.32L27.76 0.8H33.15Z"
          fill="#1A1F71"
        />
        <path d="M6.46 4.39L10.63 20H16.27L24.87 0.8H19.46L13.88 14.33L11.66 2.59C11.42 1.27 10.37 0.49 9.2 0.49H0.1L0 0.94C1.83 1.34 3.89 1.96 5.17 2.64C5.99 3.06 6.21 3.42 6.46 4.39Z" fill="#F7B600" />
      </svg>
    </div>
  );
}

// 4. Mastercard Logo
export function MastercardLogo({ className = "h-7" }) {
  return (
    <div className={`flex items-center justify-center bg-white border border-slate-200/80 rounded-xl p-1.5 shadow-sm hover:shadow-md transition-all ${className}`}>
      <svg viewBox="0 0 48 30" className="w-11 h-6" fill="none">
        <circle cx="16" cy="15" r="13" fill="#EB001B" />
        <circle cx="32" cy="15" r="13" fill="#F79E1B" fillOpacity="0.92" />
        <path
          d="M24 5.3A12.96 12.96 0 0 1 29 15a12.96 12.96 0 0 1-5 9.7A12.96 12.96 0 0 1 19 15c0-3.8 1.9-7.2 5-9.7z"
          fill="#FF5F00"
        />
      </svg>
    </div>
  );
}

// 5. American Express Logo
export function AmexLogo({ className = "h-7" }) {
  return (
    <div className={`flex items-center justify-center bg-[#006FCF] border border-blue-600 rounded-xl px-2.5 py-1.5 shadow-sm hover:shadow-md transition-all text-white font-black tracking-tighter text-[11px] select-none ${className}`}>
      <span className="font-serif italic font-extrabold tracking-widest text-[12px]">AMEX</span>
    </div>
  );
}

// 6. eZcash (Dialog) Logo
export function EzCashLogo({ className = "w-12 h-12" }) {
  return (
    <div className={`flex flex-col items-center justify-center bg-[#FFDD00] text-black font-black rounded-xl p-1.5 shadow-sm border border-amber-300 select-none ${className}`}>
      <span className="text-[12px] leading-none tracking-tight font-extrabold">eZ</span>
      <span className="text-[9px] leading-none tracking-tighter text-slate-900 uppercase font-black">cash</span>
    </div>
  );
}

// 7. iPay (LOLC) Logo
export function IPayLogo({ className = "w-12 h-12" }) {
  return (
    <div className={`flex items-center justify-center bg-[#0080FF] text-white font-black rounded-full p-1.5 shadow-sm border-2 border-white select-none ${className}`}>
      <span className="text-[11px] font-black tracking-tight flex items-center">
        i<span className="text-white font-black">Pay</span>
      </span>
    </div>
  );
}

// 8. ComBank Q+ Logo
export function ComBankQPlusLogo({ className = "w-12 h-12" }) {
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-[#6b21a8] to-[#be185d] text-white font-black rounded-xl p-1.5 shadow-sm select-none relative overflow-hidden ${className}`}>
      <div className="text-center">
        <span className="text-[14px] font-black leading-none text-white">Q</span>
        <span className="text-[11px] font-extrabold text-amber-300 leading-none">+</span>
      </div>
    </div>
  );
}

// 9. Sampath Vishwa Logo
export function SampathVishwaLogo({ className = "w-12 h-12" }) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#ff6b00] to-[#e65100] text-white rounded-xl p-1.5 shadow-sm border border-orange-400 select-none ${className}`}>
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L15 7H9L12 2Z" fill="currentColor" />
        <path d="M5 10C5 15 8 20 12 22C16 20 19 15 19 10H5Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" />
        <line x1="8" y1="14" x2="16" y2="14" />
      </svg>
      <span className="text-[7px] font-black uppercase tracking-tighter mt-0.5 leading-none">Vishwa</span>
    </div>
  );
}

// 10. FriMi Logo
export function FriMiLogo({ className = "w-12 h-12" }) {
  return (
    <div className={`flex items-center justify-center bg-[#E60000] text-white font-black rounded-xl p-1.5 shadow-sm select-none ${className}`}>
      <span className="text-[10px] font-black tracking-tight">FriMi</span>
    </div>
  );
}

// 11. Genie Logo (Dialog)
export function GenieLogo({ className = "w-12 h-12" }) {
  return (
    <div className={`flex items-center justify-center bg-[#1E293B] text-[#00E5FF] font-black rounded-xl p-1.5 shadow-sm border border-cyan-500/30 select-none ${className}`}>
      <span className="text-[10px] font-black tracking-tight">genie</span>
    </div>
  );
}

// 12. mCash Logo (Mobitel)
export function MCashLogo({ className = "w-12 h-12" }) {
  return (
    <div className={`flex flex-col items-center justify-center bg-[#008751] text-white font-black rounded-xl p-1.5 shadow-sm select-none ${className}`}>
      <span className="text-[11px] leading-none font-black">m</span>
      <span className="text-[8px] leading-none uppercase tracking-tighter font-extrabold">Cash</span>
    </div>
  );
}

// 13. Secured by PayHere Badge
export function SecuredByPayHere({ className = "" }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 shadow-sm ${className}`}>
      <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className="text-[7.5px] uppercase tracking-wider text-slate-500 font-semibold">Secured by</span>
        <span className="text-[11px] font-black text-slate-800 font-sans tracking-tight">
          Pay<span className="text-blue-600">Here</span>
        </span>
      </div>
    </div>
  );
}

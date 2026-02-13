import React from "react";

const Login = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#8dfbe5] p-4 font-sans text-slate-800">
      {/* Main Card */}
      <div className="bg-white rounded-[2.5rem] shadow-xl w-full max-w-[480px] px-8 py-10 relative">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <GraduationCapIcon className="w-8 h-8 text-black" />
            <h1 className="text-2xl font-bold text-black tracking-tight">
              Edupath
            </h1>
          </div>

          <h2 className="text-2xl font-bold text-[#0f172a] mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-sm font-medium">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <button className="w-full border border-teal-100 rounded-full py-3.5 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors group">
            <GoogleIcon className="w-5 h-5" />
            <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800">
              Continue with Google
            </span>
          </button>

          <button className="w-full border border-teal-100 rounded-full py-3.5 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors group">
            <AppleIcon className="w-5 h-5" />
            <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800">
              Continue with Apple
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-[1px] bg-teal-100 flex-1"></div>
          <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
            Or login with email
          </span>
          <div className="h-[1px] bg-teal-100 flex-1"></div>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-900 ml-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-6 py-3.5 rounded-2xl border border-teal-100 bg-[#f0fdfa] focus:outline-none focus:ring-2 focus:ring-[#3ddbc9] focus:border-transparent text-gray-600 placeholder-gray-400 transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="block text-sm font-bold text-gray-900">
                Password
              </label>
              <a
                href="#"
                className="text-sm text-[#3ddbc9] hover:text-teal-500 font-bold transition-colors"
              >
                Forgot Password ?
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-6 py-3.5 rounded-2xl border border-teal-100 bg-[#f0fdfa] focus:outline-none focus:ring-2 focus:ring-[#3ddbc9] focus:border-transparent text-gray-600 placeholder-gray-400 tracking-widest transition-all"
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-3 ml-1">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 transition-all checked:border-[#3ddbc9] checked:bg-[#3ddbc9]"
              />
              <svg
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 stroke-white opacity-0 peer-checked:opacity-100 transition-opacity"
                viewBox="0 0 14 10"
                fill="none"
              >
                <path
                  d="M1 5L4.5 8.5L13 1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <label
              htmlFor="remember"
              className="text-gray-500 font-medium text-sm cursor-pointer select-none"
            >
              Remember me for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#75eadd] hover:bg-[#5cdbc9] active:scale-[0.98] text-white font-bold py-4 rounded-full text-lg shadow-sm hover:shadow-md transition-all mt-4"
          >
            Sign in
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm font-medium">
            Don't have an account?{" "}
            <a
              href="#"
              className="text-[#3ddbc9] font-bold hover:underline ml-1"
            >
              Sign up free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Icons ---

const GraduationCapIcon = ({ className }: { className: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const GoogleIcon = ({ className }: { className: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const AppleIcon = ({ className }: { className: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.02 3.67-.85 1.6.22 2.76 1 3.5 2.15-2.9 1.76-2.43 5.48.56 6.77-.59 1.58-1.41 3.12-2.81 4.16zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

export default Login;

/**
 * FORGOT PASSWORD COMPONENT
 * Allows users to request a password reset link via email.
 * Design Patterns: Controlled Components, Conditional Rendering, Env Variables.
 */
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Grab the backend URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsError(false);
    setLoading(true);

    try {
      // Use the dynamic API_URL
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setMsg(res.data?.message || "Reset link sent to your email.");
    } catch (err) {
      setIsError(true);
      setMsg(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-100 to-teal-200 px-4">
      <div className="w-full max-w-xl bg-white rounded-[32px] shadow-2xl px-10 py-12">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-lg">
            🎓
          </div>
          <h1 className="text-xl font-bold text-emerald-700">Edupath</h1>
        </div>

        <h2 className="text-4xl font-extrabold text-center text-gray-900">Forgot Password</h2>
        <p className="text-center text-gray-500 mt-2 mb-8">
          Enter your email and we'll send a password reset link.
        </p>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="reset-email" className="text-sm font-semibold text-gray-900">Email Address</label>
              <Link to="/login" className="text-sm font-semibold text-emerald-600 hover:underline">
                Back to Login
              </Link>
            </div>

            <input
              id="reset-email"
              type="email"
              placeholder="youremail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading} // Disable input while loading
              className="w-full rounded-full border border-emerald-100 px-5 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {msg && (
          <div
            className={`mt-5 rounded-xl px-4 py-3 text-sm text-center ${
              isError
                ? "bg-red-50 text-red-700 border border-red-100"
                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
            }`}
          >
            {msg}
          </div>
        )}

        <p className="text-center text-gray-500 mt-6 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-emerald-600 hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
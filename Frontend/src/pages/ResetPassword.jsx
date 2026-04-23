/**
 * RESET PASSWORD COMPONENT
 * Captures a new password from the user and submits it along with the
 * URL token to securely update the user's credentials.
 * Design Patterns: URL Parameter Extraction, Controlled Form, Client Validation.
 */

import { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { passwordRegex } from "../utils/validation";

export default function ResetPassword() {
  const { token } = useParams(); // Extracts the token from the URL (e.g., /reset-password/:token)
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Grab the backend URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const submit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    setMsg("");
    setIsError(false);

    // Strict Client-Side Validation
    if (!password) {
      newErrors.password = "Please enter a new password";
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must be 8+ characters with uppercase, lowercase, number and special character";
    }

    if (!confirm) {
      newErrors.confirm = "Please confirm your password";
    } else if (password !== confirm) {
      newErrors.confirm = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      // Use the dynamic API_URL
      const res = await axios.post(
        `${API_URL}/api/auth/reset-password/${token}`,
        { password },
      );

      setMsg(res.data?.message || "Password updated successfully!");
      
      // Navigate to login after a brief delay so they can read the success message
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      setIsError(true);
      setMsg(err?.response?.data?.message || "Invalid or expired reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-100 to-teal-200 px-4">
      <div className="w-full max-w-xl bg-white rounded-[32px] shadow-2xl px-10 py-12">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-lg">
            🎓
          </div>
          <h1 className="text-xl font-bold text-emerald-700">Edupath</h1>
        </div>

        <h2 className="text-4xl font-extrabold text-center text-gray-900">
          Reset Password
        </h2>
        <p className="text-center text-gray-500 mt-2 mb-8">
          Create a new password for your account.
        </p>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="new-password" className="text-sm font-semibold text-gray-900">
                New Password
              </label>
              <Link to="/login" className="text-sm font-semibold text-emerald-600 hover:underline">
                Back to Login
              </Link>
            </div>

            <input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading} // Disabled while loading
              className="w-full rounded-full border border-emerald-100 px-5 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 disabled:opacity-60"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="confirm-password" className="text-sm font-semibold text-gray-900">
                Confirm Password
              </label>
            </div>

            <input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading} // Disabled while loading
              className="w-full rounded-full border border-emerald-100 px-5 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 disabled:opacity-60"
            />
            {errors.confirm && (
              <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Password must contain uppercase, lowercase, number and special
            character.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Password"}
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

      </div>
    </div>
  );
}

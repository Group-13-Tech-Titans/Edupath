import { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsError(false);

    if (password.length < 8) {
      setIsError(true);
      setMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setIsError(true);
      setMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
        password
      });
      setMsg(res.data?.message || "Password updated successfully!");
      setTimeout(() => navigate("/"), 1200);
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
          <h1 className="text-xl font-bold text-emerald-700">Edupahth</h1>
        </div>

        <h2 className="text-4xl font-extrabold text-center text-gray-900">Reset Password</h2>
        <p className="text-center text-gray-500 mt-2 mb-8">
          Create a new password for your account.
        </p>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-900">New Password</label>
              <Link to="/" className="text-sm font-semibold text-emerald-600 hover:underline">
                Back to Login
              </Link>
            </div>

            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-full border border-emerald-100 px-5 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-900">Confirm Password</label>
              <span className="text-xs text-gray-500">Minimum 8 characters</span>
            </div>

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full rounded-full border border-emerald-100 px-5 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200"
            />
          </div>

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
            className={`mt-5 rounded-xl px-4 py-3 text-sm ${
              isError
                ? "bg-red-50 text-red-700 border border-red-100"
                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
            }`}
          >
            {msg}
          </div>
        )}

        <p className="text-center text-gray-500 mt-6 text-sm">
          Remembered your password?{" "}
          <Link to="/" className="font-semibold text-emerald-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

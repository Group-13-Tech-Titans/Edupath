import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "../context/AppProvider.jsx";
import PageShell from "../components/PageShell.jsx";

const roleHomePath = {
  student: "/student",
  educator: "/educator",
  admin: "/admin",
  reviewer: "/reviewer"
};

const Login = () => {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = login(email.trim(), password);
    if (!res.success) {
      setError(res.message || "Unable to login");
      return;
    }
    const user = res.user;
    const target =
      (location.state && location.state.from?.pathname) ||
      roleHomePath[user.role] ||
      "/";
    navigate(target, { replace: true });
  };

  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
        <motion.div
          className="glass-card w-full max-w-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-center text-2xl font-semibold text-text-dark">
            Welcome back
          </h2>
          <p className="mt-1 text-center text-xs text-muted">
            Sign in to continue your learning journey.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-text-dark">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-dark">Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none ring-primary/40 focus:ring"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            )}
            <button type="submit" className="btn-primary w-full">
              Sign in
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-primary underline-offset-2 hover:underline">
              Sign up free
            </Link>
          </p>

          <div className="mt-4 rounded-2xl bg-primary/5 px-3 py-2 text-[11px] text-muted">
            <p className="font-medium text-text-dark">Demo logins</p>
            <p>Admin: admin@edupath.com / Admin@123</p>
            <p>Student: student@edupath.com / Student@123</p>
            <p>Educator: educator@edupath.com / Educator@123</p>
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
};

export default Login;


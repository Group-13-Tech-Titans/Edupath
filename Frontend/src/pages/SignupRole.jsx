import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";

const SignupRole = () => {
  const navigate = useNavigate();
  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
        <div className="glass-card w-full max-w-md p-6 text-center">
          <h2 className="text-2xl font-semibold text-text-dark">Select your role</h2>
          <p className="mt-1 text-xs text-muted">
            Choose how you want to join EduPath.
          </p>
          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate("/signup/student")}
              className="btn-primary w-full"
            >
              Continue as Student
            </button>
            <button
              onClick={() => navigate("/signup/educator")}
              className="btn-outline w-full"
            >
              Continue as Educator
            </button>
          </div>
          <p className="mt-4 text-xs text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-primary underline-offset-2 hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
};

export default SignupRole;


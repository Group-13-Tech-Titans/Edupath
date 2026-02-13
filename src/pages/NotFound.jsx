import React from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";

const NotFound = () => {
  return (
    <PageShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="glass-card max-w-md p-6 text-center">
          <h1 className="text-3xl font-semibold text-text-dark">404</h1>
          <p className="mt-2 text-sm text-muted">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <div className="mt-4 flex justify-center gap-3 text-sm">
            <Link to="/" className="btn-primary">
              Go home
            </Link>
            <Link to="/login" className="btn-outline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default NotFound;


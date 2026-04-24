/**
 * PROTECTED ROUTE COMPONENT
 * Acts as a UI Gatekeeper. Checks global Context state to ensure a user
 * is authenticated and authorized before rendering child routes.
 * Design Patterns: Layout Wrapper, Declarative Routing, RBAC.
 */

import React from "react";
import PropTypes from "prop-types";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../context/AppProvider.jsx";

const roleHomePath = {
  student: "/student",
  educator: "/educator",
  admin: "/admin",
  reviewer: "/reviewer",
  mentor: "/mentor"
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, authLoading } = useApp();
  const location = useLocation();

  // Check if we are still verifying the token with the backend
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  // AUTHENTICATION CHECK: If no user, redirect to login
  if (!currentUser) {
    // state={{ from: location }} remembers where they were trying to go!
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // THE ONBOARDING INTERCEPTOR
  // If user try to access the dashboard but haven't finished the form
  if (currentUser.status === "onboarding" && !location.pathname.includes("/signup")) {
    return <Navigate to={`/signup/${currentUser.role}`} replace />;
  }

  // AUTHORIZATION CHECK (RBAC): If they have a user, but the wrong role
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const target = roleHomePath[currentUser.role] || "/";
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};

//prop validation
ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string)
};

export default ProtectedRoute;
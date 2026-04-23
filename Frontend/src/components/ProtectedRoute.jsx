import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../context/AppProvider.jsx";

const roleHomePath = {
  student: "/student",
  educator: "/educator",
  admin: "/admin",
  reviewer: "/reviewer"
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const target = roleHomePath[currentUser.role] || "/";
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;


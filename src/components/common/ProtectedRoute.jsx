import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    // Redirect to correct dashboard based on role
    const roleRoutes = {
      student: '/student/dashboard',
      educator: '/educator/dashboard',
      admin: '/admin/dashboard',
      reviewer: '/reviewer/dashboard'
    };
    return <Navigate to={roleRoutes[currentUser.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;



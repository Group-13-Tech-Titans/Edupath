import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoleRedirect = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const roleRoutes = {
    student: '/student/dashboard',
    educator: '/educator/dashboard',
    admin: '/admin/dashboard',
    reviewer: '/reviewer/dashboard'
  };

  return <Navigate to={roleRoutes[currentUser.role] || '/login'} replace />;
};

export default RoleRedirect;



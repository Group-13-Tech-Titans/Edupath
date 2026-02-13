import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StudentNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { path: '/student/dashboard', label: 'Dashboard' },
    { path: '/student/courses', label: 'Courses' },
    { path: '/student/mentor-request', label: 'Mentorship' },
    { path: '/student/profile', label: 'Profile' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/student/dashboard" className="navbar-brand">EduPath</Link>
        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
        <div className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-center gap-sm" style={{ marginLeft: '18px' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{currentUser?.name}</span>
            <button onClick={handleLogout} className="btn btn-sm btn-ghost">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StudentNavbar;


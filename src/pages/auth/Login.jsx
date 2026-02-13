import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/common/Toast';

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const result = login(emailOrUsername, password);
    
    if (result.success) {
      const roleRoutes = {
        student: '/student/dashboard',
        educator: '/educator/dashboard',
        admin: '/admin/dashboard',
        reviewer: '/reviewer/dashboard'
      };
      navigate(roleRoutes[result.user.role]);
    } else {
      setError(result.error || 'Invalid credentials');
      setShowToast(true);
    }
  };

  const fillDemoCredentials = (email, pass) => {
    setEmailOrUsername(email);
    setPassword(pass);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ maxWidth: '450px', width: '100%' }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Welcome to EduPath</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div>
            <label htmlFor="email">Email or Username</label>
            <input
              id="email"
              type="text"
              className="input mt-sm"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input mt-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-full">Login</button>
        </form>

        <div className="mt-lg" style={{ borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
          <p style={{ fontSize: '12px', fontWeight: 800, marginBottom: '12px', color: 'var(--muted)' }}>DEMO CREDENTIALS</p>
          <div className="flex flex-col gap-sm">
            <div className="card" style={{ padding: '12px', cursor: 'pointer' }} onClick={() => fillDemoCredentials('admin', 'Admin@123')}>
              <div style={{ fontWeight: 700 }}>Admin</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>admin / Admin@123</div>
            </div>
            <div className="card" style={{ padding: '12px', cursor: 'pointer' }} onClick={() => fillDemoCredentials('student1@edupath.com', 'Student@123')}>
              <div style={{ fontWeight: 700 }}>Student</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>student1@edupath.com / Student@123</div>
            </div>
            <div className="card" style={{ padding: '12px', cursor: 'pointer' }} onClick={() => fillDemoCredentials('educator1@edupath.com', 'Educator@123')}>
              <div style={{ fontWeight: 700 }}>Educator</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>educator1@edupath.com / Educator@123</div>
            </div>
          </div>
        </div>
      </motion.div>

      <Toast
        message={error}
        type="error"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default Login;



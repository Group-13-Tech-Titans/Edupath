import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminMock, studentMocks, educatorMocks } from '../data/mockUsers';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedAuth = localStorage.getItem('edupath_auth');
    if (storedAuth) {
      try {
        const user = JSON.parse(storedAuth);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing stored auth:', error);
        localStorage.removeItem('edupath_auth');
      }
    }
    setLoading(false);
  }, []);

  const login = (emailOrUsername, password) => {
    // Check admin
    if ((emailOrUsername === adminMock.username || emailOrUsername === adminMock.email) && 
        password === adminMock.password) {
      const user = { ...adminMock };
      setCurrentUser(user);
      localStorage.setItem('edupath_auth', JSON.stringify(user));
      return { success: true, user };
    }

    // Check students
    const student = studentMocks.find(
      s => (s.email === emailOrUsername || s.username === emailOrUsername) && s.password === password
    );
    if (student) {
      const user = { ...student };
      setCurrentUser(user);
      localStorage.setItem('edupath_auth', JSON.stringify(user));
      return { success: true, user };
    }

    // Check educators
    const educator = educatorMocks.find(
      e => (e.email === emailOrUsername || e.username === emailOrUsername) && e.password === password
    );
    if (educator) {
      const user = { ...educator };
      setCurrentUser(user);
      localStorage.setItem('edupath_auth', JSON.stringify(user));
      return { success: true, user };
    }

    // Check reviewers from localStorage
    const storedReviewers = localStorage.getItem('edupath_reviewers');
    if (storedReviewers) {
      try {
        const reviewers = JSON.parse(storedReviewers);
        const reviewer = reviewers.find(
          r => (r.email === emailOrUsername || r.username === emailOrUsername) && r.password === password
        );
        if (reviewer) {
          const user = { ...reviewer, role: 'reviewer' };
          setCurrentUser(user);
          localStorage.setItem('edupath_auth', JSON.stringify(user));
          return { success: true, user };
        }
      } catch (error) {
        console.error('Error parsing reviewers:', error);
      }
    }

    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('edupath_auth');
  };

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



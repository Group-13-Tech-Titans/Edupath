import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageShell from '../../components/common/PageShell';
import Toast from '../../components/common/Toast';

const AdminReviewPanelists = () => {
  const [reviewers, setReviewers] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    specialization: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    loadReviewers();
  }, []);

  const loadReviewers = () => {
    const stored = localStorage.getItem('edupath_reviewers');
    if (stored) {
      setReviewers(JSON.parse(stored));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newReviewer = {
      id: `reviewer-${Date.now()}`,
      ...formData,
      role: 'reviewer',
      username: formData.email,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    const updatedReviewers = [...reviewers, newReviewer];
    localStorage.setItem('edupath_reviewers', JSON.stringify(updatedReviewers));
    setReviewers(updatedReviewers);
    
    setFormData({ fullName: '', specialization: '', email: '', password: '' });
    setToastMessage('Reviewer account created successfully!');
    setShowToast(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this reviewer?')) {
      const updated = reviewers.filter(r => r.id !== id);
      localStorage.setItem('edupath_reviewers', JSON.stringify(updated));
      setReviewers(updated);
      setToastMessage('Reviewer deleted successfully!');
      setShowToast(true);
    }
  };

  const handleSuspend = (id) => {
    const updated = reviewers.map(r => 
      r.id === id ? { ...r, status: r.status === 'active' ? 'suspended' : 'active' } : r
    );
    localStorage.setItem('edupath_reviewers', JSON.stringify(updated));
    setReviewers(updated);
    setToastMessage('Reviewer status updated!');
    setShowToast(true);
  };

  return (
    <PageShell title="Review Panelists">
      <div className="grid grid-2 gap-md mb-lg">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="mb-md">Create New Reviewer</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
            <div>
              <label htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="input mt-sm"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="specialization">Specialization *</label>
              <select
                id="specialization"
                name="specialization"
                className="input mt-sm"
                value={formData.specialization}
                onChange={handleChange}
                required
              >
                <option value="">Select specialization</option>
                <option value="Data Science">Data Science</option>
                <option value="Web Development">Web Development</option>
                <option value="Programming">Programming</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="Design">Design</option>
                <option value="Security">Security</option>
              </select>
            </div>

            <div>
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                className="input mt-sm"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                name="password"
                type="password"
                className="input mt-sm"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <button type="submit" className="btn btn-primary">Create Reviewer</button>
          </form>
        </motion.div>

        <div className="card">
          <h3 className="mb-md">Reviewer Accounts</h3>
          {reviewers.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '12px' }}>No reviewers created yet</p>
          ) : (
            <div className="flex flex-col gap-sm">
              {reviewers.map(reviewer => (
                <div
                  key={reviewer.id}
                  className="flex flex-between flex-center"
                  style={{ padding: '12px', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-input)' }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{reviewer.fullName}</div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>
                      {reviewer.email} • {reviewer.specialization}
                    </div>
                  </div>
                  <div className="flex gap-sm">
                    <span className={`badge ${reviewer.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {reviewer.status}
                    </span>
                    <button
                      onClick={() => handleSuspend(reviewer.id)}
                      className="btn btn-sm btn-warning"
                    >
                      {reviewer.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(reviewer.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Toast
        message={toastMessage}
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </PageShell>
  );
};

export default AdminReviewPanelists;



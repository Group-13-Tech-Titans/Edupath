import React from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/common/PageShell';
import StatsCard from '../../components/common/StatsCard';
import { mockCourses } from '../../data/mockCourses';
import { studentMocks, educatorMocks } from '../../data/mockUsers';

const AdminDashboard = () => {
  const pendingCourses = mockCourses.filter(c => c.status === 'pending').length;
  const totalUsers = studentMocks.length + educatorMocks.length;
  const totalCourses = mockCourses.length;
  
  // Get reviewers from localStorage
  const storedReviewers = localStorage.getItem('edupath_reviewers');
  const reviewers = storedReviewers ? JSON.parse(storedReviewers) : [];
  const totalReviewers = reviewers.length;

  return (
    <PageShell title="Admin Dashboard">
      <div className="grid grid-4 mb-lg">
        <StatsCard title="Total Users" value={totalUsers} color="info" />
        <StatsCard title="Total Courses" value={totalCourses} color="primary" />
        <StatsCard title="Pending Reviews" value={pendingCourses} color="warning" />
        <StatsCard title="Review Panelists" value={totalReviewers} color="success" />
      </div>

      <div className="grid grid-2 gap-md">
        <Link to="/admin/course-review-queue" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="mb-sm">Course Review Queue</h3>
          <p className="text-muted" style={{ fontSize: '12px' }}>Review pending course submissions</p>
          <div className="mt-md">
            <span className="badge badge-warning">{pendingCourses} pending</span>
          </div>
        </Link>

        <Link to="/admin/review-panelists" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="mb-sm">Review Panelists</h3>
          <p className="text-muted" style={{ fontSize: '12px' }}>Manage reviewer accounts</p>
          <div className="mt-md">
            <span className="badge badge-success">{totalReviewers} active</span>
          </div>
        </Link>
      </div>
    </PageShell>
  );
};

export default AdminDashboard;



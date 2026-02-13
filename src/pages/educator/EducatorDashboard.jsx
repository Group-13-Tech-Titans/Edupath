import React from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/common/PageShell';
import StatsCard from '../../components/common/StatsCard';
import { useAuth } from '../../context/AuthContext';
import { mockCourses } from '../../data/mockCourses';

const EducatorDashboard = () => {
  const { currentUser } = useAuth();
  
  const myCourses = mockCourses.filter(c => c.educatorId === currentUser?.id);
  const publishedCourses = myCourses.filter(c => c.status === 'approved').length;
  const pendingCourses = myCourses.filter(c => c.status === 'pending').length;
  const totalStudents = 45; // Mock data

  return (
    <PageShell title={`Welcome, ${currentUser?.name}!`}>
      <div className="grid grid-3 mb-lg">
        <StatsCard title="Published Courses" value={publishedCourses} color="success" />
        <StatsCard title="Pending Review" value={pendingCourses} color="warning" />
        <StatsCard title="Total Students" value={totalStudents} color="info" />
      </div>

      <div className="card">
        <div className="flex flex-between flex-center mb-md">
          <h3>Quick Actions</h3>
          <Link to="/educator/create-course" className="btn btn-primary">Create New Course</Link>
        </div>
        <p className="text-muted" style={{ fontSize: '12px' }}>Manage your courses and track student engagement</p>
      </div>
    </PageShell>
  );
};

export default EducatorDashboard;



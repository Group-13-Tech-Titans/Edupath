import React from 'react';
import PageShell from '../../components/common/PageShell';
import StatsCard from '../../components/common/StatsCard';
import { useAuth } from '../../context/AuthContext';
import { mockCourses } from '../../data/mockCourses';

const ReviewerDashboard = () => {
  const { currentUser } = useAuth();
  
  // Get courses matching reviewer's specialization
  const assignedCourses = mockCourses.filter(c => 
    c.status === 'pending' && c.specialization === currentUser?.specialization
  );
  
  // Get review history
  const reviews = JSON.parse(localStorage.getItem('course_reviews') || '[]');
  const myReviews = reviews.filter(r => r.reviewedBy === currentUser?.email || r.reviewedBy === currentUser?.id);

  return (
    <PageShell title={`Welcome, ${currentUser?.name || currentUser?.fullName}!`}>
      <div className="grid grid-2 mb-lg">
        <StatsCard title="Assigned Queue" value={assignedCourses.length} color="warning" />
        <StatsCard title="Reviewed" value={myReviews.length} color="success" />
      </div>

      <div className="card">
        <h3 className="mb-sm">Specialization</h3>
        <span className="badge badge-primary">{currentUser?.specialization || 'Not specified'}</span>
        <p className="text-muted mt-sm" style={{ fontSize: '12px' }}>
          You will review courses in your specialization area.
        </p>
      </div>
    </PageShell>
  );
};

export default ReviewerDashboard;



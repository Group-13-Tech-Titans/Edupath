import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageShell from '../../components/common/PageShell';
import StatsCard from '../../components/common/StatsCard';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { currentUser } = useAuth();

  return (
    <PageShell title={`Welcome back, ${currentUser?.name}!`}>
      <div className="mb-lg">
        <div className="card glass-card" style={{ padding: '24px', marginBottom: '18px' }}>
          <h2 style={{ marginBottom: '10px' }}>Continue Your Learning Journey</h2>
          <p className="text-muted" style={{ fontSize: '12px' }}>Pick up where you left off and explore new courses</p>
        </div>
      </div>

      <div className="grid grid-4 mb-lg">
        <StatsCard title="Enrolled Courses" value="3" color="primary" />
        <StatsCard title="Completed" value="1" color="success" />
        <StatsCard title="In Progress" value="2" color="info" />
        <StatsCard title="Certificates" value="1" color="warning" />
      </div>

      <div className="grid grid-2 gap-md">
        <motion.div whileHover={{ scale: 1.02 }} className="card">
          <h3 className="mb-sm">Quick Actions</h3>
          <div className="flex flex-col gap-sm">
            <Link to="/student/courses" className="btn btn-primary">Continue Learning</Link>
            <Link to="/student/mentor-request" className="btn btn-ghost">Request Mentor</Link>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="card">
          <h3 className="mb-sm">Recent Activity</h3>
          <p className="text-muted" style={{ fontSize: '12px' }}>No recent activity</p>
        </motion.div>
      </div>
    </PageShell>
  );
};

export default StudentDashboard;



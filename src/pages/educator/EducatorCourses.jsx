import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageShell from '../../components/common/PageShell';
import SearchBar from '../../components/common/SearchBar';
import { useAuth } from '../../context/AuthContext';
import { mockCourses } from '../../data/mockCourses';

const EducatorCourses = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const myCourses = useMemo(() => {
    return mockCourses.filter(c => {
      const matchesEducator = c.educatorId === currentUser?.id;
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
      return matchesEducator && matchesSearch && matchesStatus;
    });
  }, [currentUser, searchTerm, selectedStatus]);

  return (
    <PageShell title="My Courses">
      <div className="flex flex-between flex-center mb-md" style={{ flexWrap: 'wrap', gap: '14px' }}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search courses..." />
        <div className="flex gap-sm">
          <select
            className="input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Link to="/educator/create-course" className="btn btn-primary">Create New</Link>
        </div>
      </div>

      <div className="grid grid-3">
        {myCourses.map(course => (
          <motion.div
            key={course.id}
            whileHover={{ scale: 1.02, y: -2 }}
            className="card"
          >
            <img
              src={course.thumbnail}
              alt={course.title}
              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-input)', marginBottom: '12px' }}
            />
            <h4 className="mb-sm">{course.title}</h4>
            <p className="text-muted" style={{ fontSize: '12px', marginBottom: '12px' }}>{course.description.substring(0, 100)}...</p>
            <div className="flex flex-between flex-center mb-sm">
              <span className={`badge ${course.status === 'approved' ? 'badge-success' : course.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                {course.status}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>⭐ {course.rating}</span>
            </div>
            <div className="btn btn-ghost w-full" style={{ cursor: 'default' }}>
              {course.status === 'pending' ? 'Under Review' : 'Published'}
            </div>
          </motion.div>
        ))}
      </div>

      {myCourses.length === 0 && (
        <div className="text-center mt-lg">
          <p className="text-muted mb-md">No courses found</p>
          <Link to="/educator/create-course" className="btn btn-primary">Create Your First Course</Link>
        </div>
      )}
    </PageShell>
  );
};

export default EducatorCourses;



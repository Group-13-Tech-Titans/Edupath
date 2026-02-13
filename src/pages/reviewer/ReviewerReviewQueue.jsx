import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageShell from '../../components/common/PageShell';
import SearchBar from '../../components/common/SearchBar';
import { useAuth } from '../../context/AuthContext';
import { mockCourses } from '../../data/mockCourses';

const ReviewerReviewQueue = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const assignedCourses = useMemo(() => {
    return mockCourses.filter(course => {
      const matchesSpecialization = course.specialization === currentUser?.specialization;
      const matchesStatus = course.status === 'pending';
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSpecialization && matchesStatus && matchesSearch;
    });
  }, [currentUser, searchTerm]);

  return (
    <PageShell title="Review Queue">
      <div className="mb-md">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search courses..." />
        <p className="text-muted mt-sm" style={{ fontSize: '12px' }}>
          Showing courses in your specialization: <strong>{currentUser?.specialization}</strong>
        </p>
      </div>

      <div className="grid grid-3">
        {assignedCourses.map(course => (
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
              <span className="badge badge-primary">{course.specialization}</span>
              <span className="badge badge-warning">Pending</span>
            </div>
            <div className="text-muted" style={{ fontSize: '11px', marginBottom: '12px' }}>
              By {course.educatorName}
            </div>
            <Link to={`/reviewer/review-queue/${course.id}`} className="btn btn-primary w-full">Review Course</Link>
          </motion.div>
        ))}
      </div>

      {assignedCourses.length === 0 && (
        <div className="text-center mt-lg">
          <p className="text-muted">No courses assigned to you for review</p>
        </div>
      )}
    </PageShell>
  );
};

export default ReviewerReviewQueue;



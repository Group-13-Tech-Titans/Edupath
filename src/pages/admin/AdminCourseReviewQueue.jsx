import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageShell from '../../components/common/PageShell';
import SearchBar from '../../components/common/SearchBar';
import { mockCourses } from '../../data/mockCourses';

const AdminCourseReviewQueue = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');

  const specializations = ['all', ...new Set(mockCourses.map(c => c.specialization))];

  const pendingCourses = useMemo(() => {
    return mockCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialization = selectedSpecialization === 'all' || course.specialization === selectedSpecialization;
      return course.status === 'pending' && matchesSearch && matchesSpecialization;
    });
  }, [searchTerm, selectedSpecialization]);

  return (
    <PageShell title="Course Review Queue">
      <div className="flex flex-between flex-center mb-md" style={{ flexWrap: 'wrap', gap: '14px' }}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search courses..." />
        <select
          className="input"
          value={selectedSpecialization}
          onChange={(e) => setSelectedSpecialization(e.target.value)}
          style={{ maxWidth: '200px' }}
        >
          {specializations.map(spec => (
            <option key={spec} value={spec}>{spec === 'all' ? 'All Specializations' : spec}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-3">
        {pendingCourses.map(course => (
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
            <Link to={`/admin/course-review-queue/${course.id}`} className="btn btn-primary w-full">Review Course</Link>
          </motion.div>
        ))}
      </div>

      {pendingCourses.length === 0 && (
        <div className="text-center mt-lg">
          <p className="text-muted">No pending courses to review</p>
        </div>
      )}
    </PageShell>
  );
};

export default AdminCourseReviewQueue;


